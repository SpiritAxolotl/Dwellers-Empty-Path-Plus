//=============================================================================
// TDS Bitmap Fonts
// Version: 1.6
//=============================================================================
// Add to Imported List
var Imported = Imported || {};
Imported.TDS_BitmapFonts = true;
// Initialize Alias Object
var _TDS_ = _TDS_ || {};
_TDS_.BitmapFonts = _TDS_.BitmapFonts || {};
//=============================================================================
/*:
 * @plugindesc
 * This plugin allows you to create and set images as fonts.
 * This plugin is made exclusively for Archeia and her projects.
 *
 * @author TDS
 *
 * @help
 * ============================================================================
 * * Text Codes
 * ============================================================================
 *
 *  This text code will allow you to set the bitmap font tone for
 *  messages:
 *
 *    \BC[red, green, blue]
 *
 *     (Red, Green, and Blue are values of strength from -255 to 255)
 *
 *    Example:
 *
 *    \BC[255,0,0]Show me some RED!\BC[]And Now back to normal.
 */
//=============================================================================
function BitmapFontManager() {
    throw new Error("This is a static class");
}
(BitmapFontManager._fonts = {}),
(BitmapFontManager._fontsLoaded = false),
(BitmapFontManager.doesBitmapFontExist = function (t) {
    return void 0 !== this._fonts[t];
}),
(BitmapFontManager.getFontData = function (t) {
    return this._fonts[t];
}),
(BitmapFontManager.hexToRGB = function (t, a) {
    return (t = t.replace("#", "")), [parseInt(t.substring(0, 2), 16), parseInt(t.substring(2, 4), 16), parseInt(t.substring(4, 6), 16)];
}),
(BitmapFontManager.makeBitmapFontObject = function (t, a, e) {
    null == e && (e = []);
    var i = { name: t, size: a, color: e },
        n = this._fonts[t];
    if (n)
        for (var o = Object.keys(n.settings.fonts), s = 0; s < o.length; s++) {
            var r = o[s],
                p = n.settings.fonts[r].fontRange,
                m = n.settings.fonts[r].forceTone;
            if (a >= p[0] && a <= p[1]) {
                if (((i.atlas = n.atlases[r]), e.length > 0)) {
                    var h = ImageManager.loadBitmapFontImage(t, n.atlases[r].bitmapName),
                        c = new Bitmap(h.width, h.height);
                    c.blt(h, 0, 0, h.width, h.height, 0, 0), m ? c.forceTone(e[0], e[1], e[2]) : c.adjustTone(e[0], e[1], e[2]), (i.bitmap = c);
                } else i.bitmap = ImageManager.loadBitmapFontImage(t, n.atlases[r].bitmapName);
                (i.fontHeight = n.settings.fonts[r].fontHeight), (i.spaceWidth = n.settings.fonts[r].spaceWidth);
                break;
            }
        }
    return i;
}),
(BitmapFontManager.processAtlasData = function (t) {
    for (
        var a = { characters: {}, bitmapName: t.meta.image.slice(0, -4) },
            e = { _scx0: " ", _scx1: "\\", _scx2: "/", _scx3: ":", _scx4: "*", _scx5: "?", _scx6: "<", _scx7: ">", _scx8: "|", _scx9: ".", _scx10: '"' },
            i = Object.keys(t.frames),
            n = 0;
        n < i.length;
        n++
    ) {
        var o = i[n].slice(0, -4),
            s = t.frames[i[n]];
        2 === (o = e[o] ? e[o] : o).length && (o = o[0].toLowerCase()), (a.characters[o] = {}), (a.characters[o].rect = s.frame), (a.characters[o].originalRect = s.spriteSourceSize), (a.characters[o].sourceSize = s.sourceSize);
    }
    return a;
}),
(BitmapFontManager.createFontObject = async function (fontfiles) {
    const actuallyThis = this;
    const rootpath = "./fonts/Bitmap Fonts/GameFont/";
    const fontdir = "GameFont";
    const fonts = {};
    fonts[fontdir] = { settings: null, atlases: {} };
    
    async function fetchFont(filepath) {
        try {
            const response = await fetch(filepath);
            const text = await response.text();
            const fontData = JsonEx.parse(text, "utf8");
            return fontData;
        } catch (error) {
            console.error(error);
        }
    }
    
    async function iterateFilesystem(files) {
        for (let i=0; i<files.length; i++) {
            let fontfile = rootpath + files[i];
            let fontfileExt = fontfile.match(/\.[^\.]+$/)[0];
            let fontfileName = fontfile.split("/").pop().split(".")[0];
            if ("settings" !== fontfileName.toLowerCase()) {
                if (fontfileExt === ".png")
                    ImageManager.loadBitmapFontImage(fontdir, fontfileName, 0);
                else if (".json" === fontfileExt) {
                    let fontData = await fetchFont(fontfile);
                    fonts[fontdir].atlases[fontfileName] = actuallyThis.processAtlasData(fontData);
                }
            } else {
                let fontData = await fetchFont(fontfile);
                fonts[fontdir].settings = fontData;
            }
        }
    }
    
    await iterateFilesystem(fontfiles);
    this._fonts = fonts;
    this._fontsLoaded = true;
}),
(BitmapFontManager.loadAllBitmapFonts = function () {
    //this sucks but we're hardcoding it because of browser bs
    //REMEMBER TO ADD TO THE INDEX.HTML PRELOADS
    const files = [
        "Settings.json",
        "Temmie_Lettering03.json",
        "Temmie_Lettering03.png",
        "Temmie_Lettering04.json",
        "Temmie_Lettering04.png"
    ];
    this.createFontObject(files);
}),
(ImageManager.loadBitmapFontImage = function (t, a, e) {
    return this.loadBitmap("fonts/Bitmap Fonts/" + t + "/", a, e, !1);
}),
(_TDS_.BitmapFonts.Scene_Boot_initialize = Scene_Boot.prototype.initialize),
(Scene_Boot.prototype.initialize = function () {
    _TDS_.BitmapFonts.Scene_Boot_initialize.call(this);
    BitmapFontManager.loadAllBitmapFonts();
    const timeout = Date.now();
    while (!BitmapFontManager._fontsLoaded && Date.now()-5000 < timeout) {
        setTimeout(0.25);
        continue;
    }
    if (!BitmapFontManager._fontsLoaded) {
        const disclaimer = document.createElement("article");
        disclaimer.textContent = "Uh oh! The bitmap font failed to load! Please contact @spaxolotl on Discord so he can fix this. If you're on Windows, you can click on one of the links at the bottom to download an executable for the game.";
        document.body.appendChild(disclaimer);
    }
}),
(_TDS_.BitmapFonts.Bitmap_initialize = Bitmap.prototype.initialize),
(_TDS_.BitmapFonts.Bitmap_drawText = Bitmap.prototype.drawText),
(_TDS_.BitmapFonts.Bitmap_measureTextWidth = Bitmap.prototype.measureTextWidth),
(Bitmap.prototype.initialize = function (t, a) {
    _TDS_.BitmapFonts.Bitmap_initialize.call(this, t, a), (this._bitmapFont = null), (this._useBitmapFont = !0), (this._bitmapFontColor = null);
}),
Object.defineProperty(Bitmap.prototype, "bitmapFontColor", {
    get: function () {
        return this._bitmapFontColor;
    },
    set: function (t) {
        Array.isArray(t) ? t.equals(this._bitmapFontColor) || ((this._bitmapFontColor = t), this.updateBitmapFont()) : this._bitmapFontColor !== t && ((this._bitmapFontColor = t), this.updateBitmapFont());
    },
    configurable: !0,
}),
(Bitmap.prototype.isUsingBitmapFont = function () {
    return this._useBitmapFont;
}),
(Bitmap.prototype.measureTextWidth = function (t, a = !1) {
    return this.isUsingBitmapFont() ? this.measureBitmapFontText(t, a).width : _TDS_.BitmapFonts.Bitmap_measureTextWidth.call(this, t);
}),
(Bitmap.prototype.measureBitmapFontText = function (t, a = !1) {
    a && this.updateBitmapFont();
    var e = { width: 0, height: 0 },
        i = this._bitmapFont;
    if (i && void 0 !== t) {
        e.height = i.fontHeight;
        for (var n = t.toString().split(""), o = 0; o < n.length; o++) {
            var s = i.atlas.characters[n[o]];
            e.width += s ? s.rect.w : i.spaceWidth;
        }
    }
    return e;
}),
(Bitmap.prototype.drawText = function (t, a, e, i, n, o) {
    this.isUsingBitmapFont() ? this.drawBitmapFontText(t, a, e, i, n, o) : _TDS_.BitmapFonts.Bitmap_drawText.call(this, t, a, e, i, n, o);
}),
(Bitmap.prototype.updateBitmapFont = function () {
    if (BitmapFontManager.doesBitmapFontExist(this.fontFace))
        if (this._bitmapFont) {
            var t = this._bitmapFont;
            (t.name === this.fontFace && t.size === this.fontSize && t.color.equals(this._bitmapFontColor)) || (this._bitmapFont = BitmapFontManager.makeBitmapFontObject(this.fontFace, this.fontSize, this._bitmapFontColor));
        } else this._bitmapFont = BitmapFontManager.makeBitmapFontObject(this.fontFace, this.fontSize, this._bitmapFontColor);
    else this._bitmapFont = null;
}),
(Bitmap.prototype.drawBitmapFontText = function (t, a, e, i, n, o) {
    this.updateBitmapFont();
    var s = this._bitmapFont;
    if (s && void 0 !== t) {
        var r = s.bitmap,
            p = a,
            m = e + n - (n - 0.7 * s.fontHeight) / 2;
        if ("center" === o) p += (i - this.measureTextWidth(t)) / 2;
        if ("right" === o) p += i - this.measureTextWidth(t);
        for (var h = t.toString().split(""), c = 0, l = 0; l < h.length; l++) {
            var B = h[l],
                F = s.atlas.characters[B];
            if (F) {
                var _ = F.sourceSize.h - s.fontHeight,
                    f = F.rect,
                    g = (n - s.fontHeight) / 4,
                    u = m - f.h + _ + g;
                this.blt(r, f.x, f.y, f.w, f.h, p + c, u), (c += f.w);
            } else c += s.spaceWidth;
        }
    }
}),
(Bitmap.prototype.forceTone = function (t, a, e) {
    if ((t || a || e) && this.width > 0 && this.height > 0) {
        for (var i = this._context, n = i.getImageData(0, 0, this.width, this.height), o = n.data, s = 0; s < o.length; s += 4) (o[s + 0] = t), (o[s + 1] = a), (o[s + 2] = e);
        i.putImageData(n, 0, 0), this._setDirty();
    }
}),
(_TDS_.BitmapFonts.Window_Base_resetFontSettings = Window_Base.prototype.resetFontSettings),
(_TDS_.BitmapFonts.Window_Base_processEscapeCharacter = Window_Base.prototype.processEscapeCharacter),
(Window_Base.prototype.resetFontSettings = function () {
    _TDS_.BitmapFonts.Window_Base_resetFontSettings.call(this), this.contents.updateBitmapFont();
}),
(Window_Base.prototype.obtainMultiEscapeParam = function (textState) {
    var arr = /^\[([^\]]*)\]/.exec(textState.text.slice(textState.index)),
        params = [];
    return arr && ((textState.index += arr[0].length), (params = eval(arr[0]))), params;
}),
(Window_Base.prototype.processEscapeCharacter = function (t, a) {
    switch (t) {
        case "BC":
            var e = this.obtainMultiEscapeParam(a);
            this.contents.bitmapFontColor = this.obtainBitmapFontColor(e);
    }
    _TDS_.BitmapFonts.Window_Base_processEscapeCharacter.call(this, t, a);
}),
(Window_Base.prototype.obtainBitmapFontColor = function (t) {
    return t.length > 0 ? (1 === t.length ? BitmapFontManager.hexToRGB(this.textColor(t[0])) : t) : null;
}),
(Window_Base.prototype.processNormalCharacter = function (t) {
    var a = t.text[t.index++],
        e = this.textWidth(a);
    this.contents.drawText(a, t.x, t.y, 2 * e, t.height), (t.x += e);
});
