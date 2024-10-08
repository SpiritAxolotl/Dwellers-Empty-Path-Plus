//============================================================================
// YKNR_SaveThumbnail.js - ver.1.1.1
// ---------------------------------------------------------------------------
// Copyright (c) 2019 Yakinori
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//============================================================================
/*:
 * ===========================================================================
 * @plugindesc Adds a thumbnail image to save file and displays for each slot.
 * @author Yakinori
 * ===========================================================================
 *
 * @param AutoSnapForThumbnail
 * @text Auto Thumbnail
 * @desc Whether to set thumbnail images when switching map to the menu screen.
 * @type boolean
 * @default true
 *
 * @param SnapSettings
 * @text Thumbnail save settings
 *
 * @param ThumbQuality
 * @text Quaility setting
 * @desc Set the quality of thumbnails to save.
 * Smaller the value, smaller the data size.
 * @type number
 * @min 0
 * @max 100
 * @default 90
 * @parent SnapSettings
 *
 * @param ThumbSaveWidth
 * @text Size setting: width
 * @desc Set the thumbnail width to save.
 * Smaller the value, smaller the data size.
 * @type number
 * @min 0
 * @default 122
 * @parent SnapSettings
 *
 * @param ThumbSaveHeight
 * @text Size setting: height
 * @desc Set the thumbnail height to save.
 * Smaller the value, smaller the data size.
 * @type number
 * @min 0
 * @default 94
 * @parent SnapSettings
 *
 * @param ShowInSavefileList
 * @text Display in file list
 * @desc Set whether to display thumbnails in file slots.
 * @type boolean
 * @on Show
 * @off Don't show
 * @default true
 *
 * @param ThumbItemPosX
 * @text Thumbnail X coordinate
 * @desc Set the X coordinate to draw in Javascript.
 * rect = item range, width = thumbnail width
 * @type string
 * @default rect.x + rect.width - width;
 * @parent ShowInSavefileList
 *
 * @param ThumbItemPosY
 * @text Thumbnail Y coordinate
 * @desc Set the Y coordinate to draw in Javascript.
 * rect = item range, height = thumbnail height
 * @type string
 * @default rect.y + 5
 * @parent ShowInSavefileList
 *
 * @param ThumbItemScale
 * @text Thumbnail scale value
 * @desc Set the scale to draw.
 * The width / height set in “Thumbnail save setting” is 1.
 * @type number
 * @min 0
 * @decimals 2
 * @default 1.00
 * @parent ShowInSavefileList
 *
 * @param OtherWindowClass
 * @text Display setting of another window
 * @desc Set this to display thumbnails in a separate window.
 * Enter the target window class name.
 * @type string
 * @default 
 *
 * @param ThumbOWPosX
 * @text Thumbnail X coordinate window
 * @desc Set X coordinate to show in a separate window using Javascript.
 * rect = range in the window, width = thumbnail width
 * @type string
 * @default rect.x + rect.width - width;
 * @parent OtherWindowClass
 *
 * @param ThumbOWPosY
 * @text Thumbnail Y coordinate window
 * @desc Set Y coordinate to show in a separate window using Javascript.
 * rect = range in the window, height = thumbnail height
 * @type string
 * @default rect.y + 5
 * @parent OtherWindowClass
 *
 * @param ThumbOWScale
 * @text Thumbnail scale value
 * @desc Sets the scale to show in a separate window.
 * Width / height for “Thumbnail Save Settings” is 1.
 * @type number
 * @min 0
 * @decimals 2
 * @default 1.00
 * @parent OtherWindowClass
 *
 * @help
 * ===========================================================================
 *【!Attention!】
 * ※This plugin doesn't work if MV version is less than 1.6.1.
 * ===========================================================================
 *【Function】
 * Adds a function to save current map image as thumbnail to save data for save/load screen.
 * 
 * Thumbnail is performed automatically when the menu screen is opened.
 * 
 * Thumbnails are not shown in the data saved through “auto save function” of community-1.3.
 * 
 * ---------------------------------------------------------------------------
 *【Plugin parameters】
 * ・「Automatic thumbnail generation」
 *   If set to false, thumbnails will be used manually.
 *   Use the following script call for event command.
 * -------------------------------------
 * SceneManager.snapForThumbnail();
 * -------------------------------------
 * 
 * ・「Image quality setting」 「Size setting: Width」 「Size setting: Height」
 *   Larger the size, the better thumbnail quality displayed.
 *   Please note that the data will be enlarged.
 * 
 * ・「Display in file list」
 *   Show thumbnails in the default list window.
 *   Set to false if there is nothing to display.
 * 
 * ・「Display setting of another window」
 *   Also possible to display a window added by another plugin instead of the file list.
 *   You can display it by setting the class name of the window you want to show.
 *   For example, if you set Window_Help- thumbnail of save data is displayed in help window.
 *   (Since it refers to SceneManager._scene._listWindow, it won't work if it does not exist.)
 * 
 * ---------------------------------------------------------------------------
 *【Changelog】
 * [2019/01/04] [1.0.0] public release
 * [2019/12/**] [1.1.0] "Display in file list", "Display setting of another window"
 *   Got fixed.
 * [2020/05/28] [1.1.1] Checks "image encryption" during deployment
 *   Bug fixed when showing thumbnails in the deployed game
 *
 * ===========================================================================
 * [Blog]   : http://mata-tuku.ldblog.jp/
 * [Twitter]: https://twitter.com/Noritake0424
 * [Github] : https://github.com/Yakinori0424/RPGMakerMVPlugins
 * ---------------------------------------------------------------------------
 * Licensed under MIT License. Feel free to use.
 * http://opensource.org/licenses/mit-license.php
*/

(function() {
    'use strict';

    //------------------------------------------------------------------------

    /**
     * 対象のオブジェクト上の関数を別の関数に差し替えます.
     *
     * @method monkeyPatch
     * @param {Object} target 対象のオブジェクト
     * @param {String} methodName オーバーライドする関数名
     * @param {Function} newMethod 新しい関数を返す関数
     */
    function monkeyPatch(target, methodName, newMethod) {
        target[methodName] = newMethod(target[methodName]);
    };


    //------------------------------------------------------------------------

    /**
     * Jsonをパースし, プロパティの値を変換して返す
     *
     * @method jsonParamsParse
     * @param {String} json JSON文字列
     * @return {Object} パース後のオブジェクト
     */
    function jsonParamsParse(json) {
        return JSON.parse(json, parseRevive);
    };

    function parseRevive(key, value) {
        if (key === '') { return value; }
        try {
            return JSON.parse(value, parseRevive);
        } catch (e) {
            return value;
        }
    };

    /**
     * Jsonをパースして変換後, 配列ならば連想配列に変換して返す
     *
     * @method jsonParamsParse
     * @param {String} json JSON文字列
     * @param {String} keyName 連想配列のキーとする要素のあるプロパティ名
     * @param {String} valueName 連想配列の値とする要素のあるプロパティ名
     * @return {Object} パース後の連想配列
     */
    function parseArrayToHash(json, keyName, valueName) {
        let hash = {};
        const array = jsonParamsParse(json);
        if (Array.isArray(array)) {
            for (let i = 0, l = array.length; i < l; i++) {
                const key = array[i][keyName];
                if (key && key !== '') {
                    hash[key] = array[i][valueName] || null;
                }
            }
        }
        return hash;
    };


    //------------------------------------------------------------------------
    // パラメータを受け取る.
    const pluginName = 'YKNR_SaveThumbnail';
    const parameters = PluginManager.parameters(pluginName);
    const isAutoSnap = parameters['AutoSnapForThumbnail'] === 'true';
    const thumbQuality = parseInt(parameters['ThumbQuality']);
    const thumbSaveWidth = parseInt(parameters['ThumbSaveWidth']);
    const thumbSaveHeight = parseInt(parameters['ThumbSaveHeight']);
    const isShowInList = parameters['ShowInSavefileList'] === 'true';
    const thumbItemPosX = parameters['ThumbItemPosX'] || '0';
    const thumbItemPosY = parameters['ThumbItemPosY'] || '0';
    const thumbItemScale = parseFloat(parameters['ThumbItemScale']);
    const otherWindowClass = parameters['OtherWindowClass'];
    const thumbOtherPosX = parameters['ThumbOWPosX'] || '0';
    const thumbOtherPosY = parameters['ThumbOWPosY'] || '0';
    const thumbOtherScale = parseFloat(parameters['ThumbOWScale']);


    //------------------------------------------------------------------------

    /**
     * セーブデータのサムネイルで使用するユニークなキーを返します
     *
     * @param {number} savefileId セーブファイルのID
     * @return {string} 
    */
    function generateThumbUniqueKey(savefileId) {
        if (DataManager.isThisGameFile(savefileId)) {
            const info = DataManager.loadSavefileInfo(savefileId);
            return savefileId + ':' + info.timestamp;
        }
        return undefined;
    };


    //------------------------------------------------------------------------

    /**
     * Takes a snapshot of the game screen and returns a new bitmap object.\
     * 出力するビットマップの幅と高さを指定できるよう, Bitmap.snap を元に拡張しています.\
     * 幅/高さが未指定の場合は, 従来のように Graphics.width, Graphics.height となります.\
     * また, 出力前の元々の幅と高さをさらに指定することで,\
     * その値を元にビットマップの幅と高さに合わせて拡大率を調整します.\
     * こちらの指定がない場合は, ビットマップの幅と高さと同値となり, 拡大率を変えません.
     *
     * @static
     * @param {Stage} stage The stage object
     * @param {number} dw 出力するビットマップの幅
     * @param {number} dh 出力するビットマップの高さ
     * @param {number} cw 元の幅
     * @param {number} ch 元の高さ
     * @return {Bitmap} リサイズされたビットマップ
     */
    Bitmap.snap2 = function(stage, dw = Graphics.width, dh = Graphics.height, cw = dw, ch = dh) {
        const bitmap = new Bitmap(dw, dh);
        if (stage) {
            const context = bitmap._context;
            const renderTexture = PIXI.RenderTexture.create(dw, dh);
            const last_sx = stage.scale.x;
            const last_sy = stage.scale.y;
            stage.scale.x = dw / cw;
            stage.scale.y = dh / ch;
            Graphics._renderer.render(stage, renderTexture);
            stage.worldTransform.identity();
            stage.scale.x = last_sx;
            stage.scale.y = last_sy;
            let canvas = null;
            if (Graphics.isWebGL()) {
                canvas = Graphics._renderer.extract.canvas(renderTexture);
            } else {
                canvas = renderTexture.baseTexture._canvasRenderTarget.canvas;
            }
            context.drawImage(canvas, 0, 0);
            renderTexture.destroy({ destroyBase: true });
            bitmap._setDirty();
        }
        return bitmap;
    };


    //------------------------------------------------------------------------

    monkeyPatch(Decrypter, 'checkImgIgnore', function($) {
        return function(url) {
            // Base64形式なら暗号化の対象外にする
            if (url.includes('data:image/jpeg;base64')) {
                return true;
            }
            return $.call(this, url);
        };
    });


    //------------------------------------------------------------------------

    /**
     * セーブファイルがこのゲームの何番目のものか取得します.
     *
     * @param {Object} info セーブデータ
     * @return {number} 
     */
    DataManager.getSavefileId = function(info) {
        const globalInfo = this.loadGlobalInfo();
        if (globalInfo) {
            for (let id = 1, l = globalInfo.length; id < l; id++) {
                if (this.isThisGameFile(id)) {
                    if (this.isEqualSavefile(info, globalInfo[id])) {
                        return id;
                    }
                }
            }
        }
        return -1;
    };

    /**
     * セーブファイルが同じものか判定します.
     *
     * @param {Object} a セーブデータA
     * @param {Object} b セーブデータB
     * @return {boolean} 
     */
    DataManager.isEqualSavefile = function(a, b) {
        // NOTE : thumbnailは長くなりがちなので比較しなくてよいかなという判断
        return (a.globalId === b.globalId
            && a.title === b.title
            && a.timestamp === b.timestamp
            && a.playtime === b.playtime
            // && a.thumbnail === b.thumbnail
            && a.characters.equals(b.characters)
            && a.faces.equals(b.faces)
        );
    };


    //------------------------------------------------------------------------

    /**
     * Base64形式用のキャッシュキーを返します.\
     * データURIは長くなるので, ユニークなキーを指定して代用します.
     *
     * @param {number|string} cacheKey 任意のキー
     * @param {number} hue 色相
     * @return {string} 
     */
    ImageManager._generateBase64CacheKey = function(cacheKey, hue) {
        return 'Base64:' + cacheKey + ':' + hue;
    };

    /**
     * ビットマップをjpgのBase64形式文字列に変換します
     *
     * @param {Bitmap} bitmap ビットマップ
     * @return {string} Base64形式の文字列を返します
     */
    ImageManager.toBase64 = function(bitmap) {
        const minetype = 'image/jpeg';
        const quality = thumbQuality / 100;
        return bitmap._canvas.toDataURL(minetype, quality);
    };

    /**
     * Base64形式の文字列からビットマップをロードします.\
     * キャッシュに対応しています.
     *
     * @param {string} src Base64形式の文字列
     * @param {number|string} cacheKey キャッシュに使用する任意のキー
     * @param {number} hue 色相
     * @return {Bitmap} 
     */
    ImageManager.loadBase64Bitmap = function(src, cacheKey, hue = 0) {
        const b64cacheKey = this._generateBase64CacheKey(cacheKey, hue);
        let bitmap = this._imageCache.get(b64cacheKey);
        if (!bitmap) {
            bitmap = Bitmap.load(src);
            if (this._callCreationHook) {
                // community-1.3 の プログレスバー 対応
                this._callCreationHook(bitmap);
            }
            bitmap.addLoadListener(function() {
                bitmap.rotateHue(hue);
            });
            this._imageCache.add(b64cacheKey, bitmap);
        } else if (!bitmap.isReady()) {
            bitmap.decode();
        }
        return bitmap;
    };

    /**
     * Base64形式の文字列からビットマップをリクエストします.\
     * キャッシュに対応しています.
     *
     * @param {string} src Base64形式の文字列
     * @param {number|string} cacheKey キャッシュに使用する任意のキー
     * @param {number} hue 色相
     * @return {Bitmap} 
     */
    ImageManager.requestBase64Bitmap = function(src, cacheKey, hue = 0) {
        const b64cacheKey = this._generateBase64CacheKey(cacheKey, hue);
        let bitmap = this._imageCache.get(b64cacheKey);
        if (!bitmap) {
            bitmap = Bitmap.request(src);
            if (this._callCreationHook) {
                // community-1.3 の プログレスバー 対応
                this._callCreationHook(bitmap);
            }
            bitmap.addLoadListener(function() {
                bitmap.rotateHue(hue);
            });
            this._imageCache.add(b64cacheKey, bitmap);
            this._requestQueue.enqueue(b64cacheKey, bitmap);
        } else {
            this._requestQueue.raisePriority(b64cacheKey);
        }
        return bitmap;
    };


    //------------------------------------------------------------------------

    /**
     * セーブファイルからサムネイルをロードします.
     *
     * @param {number} savefileId セーブファイルのID
     * @param {number} hue 色相
     * @return {Bitmap} 
     */
    ImageManager.loadThumbnail = function(savefileId) {
        const info = DataManager.loadSavefileInfo(savefileId);
        const cacheKey = generateThumbUniqueKey(savefileId);
        if (info && info.thumbnail && cacheKey) {
            return ImageManager.loadBase64Bitmap(info.thumbnail, cacheKey);
        }
        return this.loadEmptyBitmap();
    };

    /**
     * セーブファイルからサムネイルをリクエストします.
     *
     * @param {number} savefileId セーブファイルのID
     * @param {number} hue 色相
     * @return {Bitmap} 
     */
    ImageManager.requestThumbnail = function(savefileId) {
        const info = DataManager.loadSavefileInfo(savefileId);
        const cacheKey = generateThumbUniqueKey(savefileId);
        if (info && info.thumbnail && cacheKey) {
            return this.requestBase64Bitmap(info.thumbnail, cacheKey);
        }
        return this.loadEmptyBitmap();
    };

    /**
     * セーブ/ロード画面用のサムネイル読み込み中のビットマップを返します.
     *
     * @param {number} width
     * @param {number} height
     * @return {Bitmap} 
     */
    ImageManager.loadBusyThumbBitmap = function(width, height) {
        const cacheKey = 'busyThumb:' + width + '_' + height;
        let empty = this._imageCache.get(cacheKey);
        if (!empty) {
            empty = new Bitmap(width, height);
            empty.fillAll('#000000');
            this._imageCache.add(cacheKey, empty);
        }
        return empty;
    };

    /**
     * サムネイルの自動撮影を行うか判定.
     * 
     * @return {boolean}
     */
    SceneManager.isAutoSnapForThumbnail = function() {
        if (!isAutoSnap || !$gameSystem.isSaveEnabled()) {
            return false;
        }
        // 現在のシーンがマップ画面以外であれば false.
        if (!this._scene || this._scene.constructor !== Scene_Map) {
            return false;
        }
        // 次のシーンが指定のいずれかであれば true.
        //const scenes = [Scene_Menu, Scene_Load, Scene_Save];
        const scenes = [Scene_Menu];
        return scenes.some((scene) => this.isNextScene(scene));
    };

    monkeyPatch(SceneManager, 'snapForBackground', function($) {
        return function() {
            $.call(this);
            if (this.isAutoSnapForThumbnail()) {
                this.snapForThumbnail();
            }
        };
    });

    /**
     * マップ画面を指定のサイズのビットマップを保存します.
     */
    SceneManager.snapForThumbnail = function() {
        if (this._scene) {
            const cw = Graphics.width;
            const ch = Graphics.height;
            this._thumbnailBitmap = Bitmap.snap2(this._scene, thumbSaveWidth, thumbSaveHeight, cw, ch);
        }
    };

    /**
     * サムネイルのビットマップを削除します.
     */
    SceneManager.clearThumbnail = function() {
        this._thumbnailBitmap = null;
    };

    /**
     * サムネイル用に保存したビットマップのBase64形式の文字列を返します.
     * 
     * @return {string} 
     */
    SceneManager.thumbnailBase64 = function() {
        if (this._thumbnailBitmap) {
            return ImageManager.toBase64(this._thumbnailBitmap);
        }
        return '';
    };

    monkeyPatch(DataManager, 'makeSavefileInfo', function($) {
        return function() {
            let info = $.call(this);
            info.thumbnail = SceneManager.thumbnailBase64();
            if (!info.thumbnail) {
                delete info.thumbnail;
            }
            return info;
        };
    });

    monkeyPatch(DataManager, 'loadSavefileImages', function($) {
        return function(info) {
            $.call(this, info);
            if (info.thumbnail) {
                ImageManager.requestThumbnail(info);
            }
        };
    });


    //------------------------------------------------------------------------

    /**
     * Base64形式の文字列データから画像を読み込んで描画する.
     * 
     * @param {string} src Base64形式の文字列
     * @param {number|string} cacheKey キャッシュに使用する任意のキー
     * @param {number} x 描画 X 座標
     * @param {number} y 描画 Y 座標
     * @param {number} width 描画する幅
     * @param {number} height 描画する高さ
     * @param {Function} onDrawAfter 描画後の処理
     */
    Window_Base.prototype.drawBase64Data = function(src, cacheKey, x, y, width = 0, height = 0, onDrawAfter = null) {
        const bitmap = ImageManager.loadBase64Bitmap(src, cacheKey);
        const lastOpacity = this.contents.paintOpacity;
        if (!bitmap.isReady() && width > 0 && height > 0) {
            this.contents.fillRect(x, y, width, height, '#000000');
        }
        bitmap.addLoadListener(() => {
            this._onLoadBase64Data(bitmap, x, y, lastOpacity, width, height, onDrawAfter = null);
        });
    };

    /**
     * drawBase64Data のイベントリスナー関数.
     * 
     * @param {Bitmap} bitmap Base64形式から生成されたビットマップ
     * @param {number} x 描画 X 座標
     * @param {number} y 描画 Y 座標
     * @param {number} lastOpacity 描画前の透明度
     * @param {number} width 描画する幅
     * @param {number} height 描画する高さ
     * @param {Function} onDrawAfter 描画後の処理
     */
    Window_Base.prototype._onLoadBase64Data = function(bitmap, x, y, lastOpacity, width, height, onDrawAfter = null) {
        const bw = bitmap.width;
        const bh = bitmap.height;
        width = width || bw;
        height = height || bh;
        //const lastOpacity = this.contents.paintOpacity;
        this.contents.paintOpacity = lastOpacity;
        this.contents.blt(bitmap, 0, 0, bw, bh, x, y, width, height);
        if (onDrawAfter) {
            onDrawAfter();
        }
        //this.contents.paintOpacity = lastOpacity;
    };

    /**
     * Base64形式の文字列データから画像を読み込んで描画する.\
     * 読み込みの遅延により描画が遅れると, 高速スクロールさせることで\
     * 描画位置や透明度がずれることがあるのでその対策込みで再定義.
     * 
     * @param {string} src Base64形式の文字列
     * @param {number|string} cacheKey キャッシュに使用する任意のキー
     * @param {number} x 描画 X 座標
     * @param {number} y 描画 Y 座標
     * @param {number} width 描画する幅
     * @param {number} height 描画する高さ
     * @param {Function} onDrawAfter 描画後の処理
     */
    Window_Selectable.prototype.drawBase64Data = function(src, cacheKey, x, y, width = 0, height = 0, onDrawAfter = null) {
        const bitmap = ImageManager.loadBase64Bitmap(src, cacheKey);
        const lastOpacity = this.contents.paintOpacity;
        const lastTopRow = this.topRow();
        const lastLeftCol = Math.floor(this._scrollX / this.itemWidth());
        if (!bitmap.isReady() && width > 0 && height > 0) {
            this.contents.fillRect(x, y, width, height, '#000000');
        }
        bitmap.addLoadListener(() => {
            if (this.topRow() !== lastTopRow || Math.floor(this._scrollX / this.itemWidth()) !== lastLeftCol) {
                return;
            }
            this._onLoadBase64Data(bitmap, x, y, lastOpacity, width, height, onDrawAfter = null);
        });
    };


    //------------------------------------------------------------------------

    // リストウィンドウ内に, サムネイル表示を行う処理を追加します
    if (isShowInList) {
        Window_SavefileList.prototype.thumbnailX = eval('(function(rect, width) { return %1; });'.format(thumbItemPosX));
        Window_SavefileList.prototype.thumbnailY = eval('(function(rect, height) { return %1; });'.format(thumbItemPosY));

        monkeyPatch(Window_SavefileList.prototype, 'initialize', function($) {
            return function(x, y, width, height) {
                $.call(this, x, y, width, height);
                this.createThumbnail();
            };
        });

        Window_SavefileList.prototype.createThumbnail = function() {
            const contentsIndex = this.children.indexOf(this._windowContentsSprite);
            this._thumbContainer = new PIXI.Container();
            this.addChildAt(this._thumbContainer, contentsIndex);
            let thumb;
            for (let i = 0, l = this.maxVisibleItems(); i < l; i++) {
                thumb = new Sprite();
                thumb.scale.x = thumbItemScale;
                thumb.scale.y = thumbItemScale;
                thumb.bitmap = null;
                thumb.visible = false;
                this._thumbContainer.addChild(thumb);
            }
            this.refreshThumbnailParts();
        };

        monkeyPatch(Window_SavefileList.prototype, '_refreshContents', function($) {
            return function() {
                $.call(this);
                this.refreshThumbnailParts();
            };
        });

        Window_SavefileList.prototype.refreshThumbnailParts = function() {
            if (this._thumbContainer) {
                this._thumbContainer.x = this.padding;
                this._thumbContainer.y = this.padding;
            }
        };

        monkeyPatch(Window_SavefileList.prototype, 'refresh', function($) {
            return function() {
                this.clearThumbnail();
                $.call(this);
            };
        });

        Window_SavefileList.prototype.clearThumbnail = function() {
            const thumbs = this._thumbContainer.children;
            let thumb;
            for (let i = 0, l = thumbs.length; i < l; i++) {
                thumb = thumbs[i];
                thumb.bitmap = null;
                thumb.visible = false;
            }
        };

        monkeyPatch(Window_SavefileList.prototype, 'drawContents', function($) {
            return function(info, rect, valid) {
                $.call(this, info, rect, valid);
                let thumbRect = new Rectangle();
                thumbRect.width = Math.floor(thumbSaveWidth * thumbItemScale);
                thumbRect.height = Math.floor(thumbSaveHeight * thumbItemScale);
                thumbRect.x = this.thumbnailX(rect, thumbRect.width);
                thumbRect.y = this.thumbnailY(rect, thumbRect.height);
                this.drawThumbnail(info, thumbRect, valid);
            };
        });

        /**
         * サムネイルを描画する
         * 
         * @param {Object} info セーブファイルのインフォデータ
         * @param {Rectangle} thumbRect 
         * @param {boolean} valid 
         */
        Window_SavefileList.prototype.drawThumbnail = function(info, thumbRect, valid) {
            const savefileId = DataManager.getSavefileId(info);
            if (savefileId > 0 && info.thumbnail) {
                let sprite = this._thumbContainer.children.find((s) => !s.visible);
                sprite.visible = true;
                sprite.x = thumbRect.x;
                sprite.y = thumbRect.y;
                const thunmbBitmap = ImageManager.loadThumbnail(savefileId);
                if (!thunmbBitmap.isReady()) {
                    // 読み込み終わるまで別のビットマップを表示
                    const empty = ImageManager.loadBusyThumbBitmap(thumbRect.width, thumbRect.height);
                    sprite.bitmap = empty;
                }
                thunmbBitmap.addLoadListener(() => {
                    // 読み込み終わったときにリスト表示範囲内であれば描画
                    if (this.topIndex() < savefileId &&
                        this.topIndex() + this.maxPageItems() >= savefileId) {
                        sprite.bitmap = thunmbBitmap;
                        sprite.bitmap.paintOpacity = valid ? 255 : this.translucentOpacity();
                    }
                });
            }
        };
    }

    // 任意のウィンドウに, サムネイル表示を行う処理を追加します
    if (otherWindowClass) {
        /** @type {Window_Base} */
        const AnyWindowClass = eval(otherWindowClass);

        if (!AnyWindowClass || !AnyWindowClass.prototype || !(AnyWindowClass.prototype instanceof Window_Base)) {
            throw new Error(AnyWindowClass + ': This is not a class extended \'Window_Base\' class');
        }

        AnyWindowClass.prototype._thumbnailX = eval('(function(rect, width) { return %1; });'.format(thumbOtherPosX));
        AnyWindowClass.prototype._thumbnailY = eval('(function(rect, height) { return %1; });'.format(thumbOtherPosY));

        monkeyPatch(AnyWindowClass.prototype, 'initialize', function($) {
            return function() {
                $.call(this, ...arguments);
                if (SceneManager._scene instanceof Scene_File) {
                    this._createThumbnail();
                }
            };
        });

        AnyWindowClass.prototype._createThumbnail = function() {
            const contentsIndex = this.children.indexOf(this._windowContentsSprite);
            this._thumbContainer = new PIXI.Container();
            this.addChildAt(this._thumbContainer, contentsIndex);
            this._thumbSprite = new Sprite();
            this._thumbSprite.scale.x = thumbItemScale;
            this._thumbSprite.scale.y = thumbItemScale;
            this._thumbSprite.bitmap = null;
            this._thumbSprite.visible = false;
            this._thumbContainer.addChild(this._thumbSprite);
            // contents からはみ出ないためのマスクをつける
            this._maskGraphic = new PIXI.Graphics();
            this._thumbContainer.addChild(this._maskGraphic);
            this._thumbContainer.mask = this._maskGraphic;
            this._refreshThumbnailParts();
        };

        monkeyPatch(AnyWindowClass.prototype, '_refreshContents', function($) {
            return function() {
                $.call(this);
                this._refreshThumbnailParts();
            };
        });

        AnyWindowClass.prototype._refreshThumbnailParts = function() {
            if (this._thumbContainer) {
                this._thumbContainer.x = this.padding;
                this._thumbContainer.y = this.padding;
            }
            if (this._maskGraphic) {
                this._maskGraphic.clear();
                this._maskGraphic.beginFill('#000000');
                this._maskGraphic.drawRect(0, 0, this.contentsWidth(), this.contentsHeight());
                this._maskGraphic.endFill();
            }
        };

        monkeyPatch(AnyWindowClass.prototype, 'update', function($) {
            return function() {
                if ($) {
                    $.call(this);
                }
                if (SceneManager._scene instanceof Scene_File) {
                    this._updateThumbnail();
                }
            };
        });

        AnyWindowClass.prototype._updateThumbnail = function() {
            /** @type {Window_SavefileList} */
            const list = SceneManager._scene._listWindow;
            if (list) {
                const savefileId = list.index() + 1;
                if (savefileId !== this._savefileId) {
                    this._savefileId = savefileId;
                    const rect = new Rectangle(0, 0, this.contentsWidth(), this.contentsHeight());
                    let thumbRect = new Rectangle();
                    thumbRect.width = Math.floor(thumbSaveWidth * thumbOtherScale);
                    thumbRect.height = Math.floor(thumbSaveHeight * thumbOtherScale);
                    thumbRect.x = this._thumbnailX(rect, thumbRect.width);
                    thumbRect.y = this._thumbnailY(rect, thumbRect.height);
                    this._drawThumbnail(thumbRect);
                }
            }
        };

        AnyWindowClass.prototype._drawThumbnail = function(thumbRect) {
            const savefileId = this._savefileId;
            const info = DataManager.loadSavefileInfo(savefileId);
            if (this._savefileId > 0 && info && info.thumbnail) {
                const valid = DataManager.isThisGameFile(savefileId);
                this._thumbSprite.visible = true;
                this._thumbSprite.x = thumbRect.x;
                this._thumbSprite.y = thumbRect.y;
                const thunmbBitmap = ImageManager.loadThumbnail(savefileId);
                if (!thunmbBitmap.isReady()) {
                    // 読み込み終わるまで別のビットマップを表示
                    const empty = ImageManager.loadBusyThumbBitmap(thumbRect.width, thumbRect.height);
                    this._thumbSprite.bitmap = empty;
                }
                thunmbBitmap.addLoadListener(() => {
                    // 読み込み終わって位置が変わっていないなら描画
                    if (savefileId === this._savefileId) {
                        this._thumbSprite.bitmap = thunmbBitmap;
                        this._thumbSprite.bitmap.paintOpacity = valid ? 255 : this.translucentOpacity();
                    }
                });
            } else {
                this._thumbSprite.visible = false;
                this._thumbSprite.bitmap = null;
            }
        };
    }


    //------------------------------------------------------------------------

    // community-1.3 の オートセーブ 対応
    if (DataManager.autoSaveGame) {
        monkeyPatch(DataManager, 'autoSaveGame', function($) {
            return function() {
                if (this._autoSaveFileId !== 0 && !this.isEventTest() && $gameSystem.isSaveEnabled()) {
                    SceneManager.clearThumbnail();
                }
                $.call(this);
            };
        });
    }

})();
