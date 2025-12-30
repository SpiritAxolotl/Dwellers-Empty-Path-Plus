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

// Initialize fonts storage
BitmapFontManager._fonts = {};

/**
 * Check if a bitmap font exists
 */
BitmapFontManager.doesBitmapFontExist = function(fontName) {
    return this._fonts[fontName] !== undefined;
};

/**
 * Get font data by name
 */
BitmapFontManager.getFontData = function(fontName) {
    return this._fonts[fontName];
};

/**
 * Convert hex color to RGB array
 */
BitmapFontManager.hexToRGB = function(hexColor, alpha) {
    hexColor = hexColor.replace("#", "");
    return [
        parseInt(hexColor.substring(0, 2), 16),
        parseInt(hexColor.substring(2, 4), 16),
        parseInt(hexColor.substring(4, 6), 16)
    ];
};

/**
 * Create a bitmap font object with specified parameters
 */
BitmapFontManager.makeBitmapFontObject = function(fontName, fontSize, colorTone) {
    if (colorTone == null) {
        colorTone = [];
    }
    
    var fontObject = {
        name: fontName,
        size: fontSize,
        color: colorTone
    };
    
    var fontData = this._fonts[fontName];
    
    if (fontData) {
        var fontKeys = Object.keys(fontData.settings.fonts);
        
        for (var i = 0; i < fontKeys.length; i++) {
            var fontKey = fontKeys[i];
            var fontRange = fontData.settings.fonts[fontKey].fontRange;
            var forceTone = fontData.settings.fonts[fontKey].forceTone;
            
            // Check if font size is within range
            if (fontSize >= fontRange[0] && fontSize <= fontRange[1]) {
                fontObject.atlas = fontData.atlases[fontKey];
                
                // Apply color tone if specified
                if (colorTone.length > 0) {
                    var originalBitmap = ImageManager.loadBitmapFontImage(fontName, fontData.atlases[fontKey].bitmapName);
                    var tintedBitmap = new Bitmap(originalBitmap.width, originalBitmap.height);
                    
                    tintedBitmap.blt(originalBitmap, 0, 0, originalBitmap.width, originalBitmap.height, 0, 0);
                    
                    if (forceTone) {
                        tintedBitmap.forceTone(colorTone[0], colorTone[1], colorTone[2]);
                    } else {
                        tintedBitmap.adjustTone(colorTone[0], colorTone[1], colorTone[2]);
                    }
                    
                    fontObject.bitmap = tintedBitmap;
                } else {
                    fontObject.bitmap = ImageManager.loadBitmapFontImage(fontName, fontData.atlases[fontKey].bitmapName);
                }
                
                fontObject.fontHeight = fontData.settings.fonts[fontKey].fontHeight;
                fontObject.spaceWidth = fontData.settings.fonts[fontKey].spaceWidth;
                break;
            }
        }
    }
    
    return fontObject;
};

/**
 * Process atlas data from JSON
 */
BitmapFontManager.processAtlasData = function(atlasData) {
    var processedAtlas = {
        characters: {},
        bitmapName: atlasData.meta.image.slice(0, -4)
    };
    
    // Special character mappings for file system compatibility
    var specialCharMap = {
        _scx0: " ",
        _scx1: "\\",
        _scx2: "/",
        _scx3: ":",
        _scx4: "*",
        _scx5: "?",
        _scx6: "<",
        _scx7: ">",
        _scx8: "|",
        _scx9: ".",
        _scx10: '"'
    };
    
    var frameKeys = Object.keys(atlasData.frames);
    
    for (var i = 0; i < frameKeys.length; i++) {
        var charKey = frameKeys[i].slice(0, -4);
        var frameData = atlasData.frames[frameKeys[i]];
        
        // Map special characters
        charKey = specialCharMap[charKey] ? specialCharMap[charKey] : charKey;
        
        // Handle two-character keys
        if (charKey.length === 2) {
            charKey = charKey[0].toLowerCase();
        }
        
        processedAtlas.characters[charKey] = {};
        processedAtlas.characters[charKey].rect = frameData.frame;
        processedAtlas.characters[charKey].originalRect = frameData.spriteSourceSize;
        processedAtlas.characters[charKey].sourceSize = frameData.sourceSize;
    }
    
    return processedAtlas;
};

/**
 * Create font object from font directory
 */
BitmapFontManager.createFontObject = function(fontName) {
    var fontDirectory = "fonts/Bitmap Fonts/" + fontName + "/";
    
    var files = [
        { type: "settings", name: "Settings", ext: ".json" },
        { type: "atlas", name: "Temmie_Lettering03", ext: ".json" },
        { type: "image", name: "Temmie_Lettering03", ext: ".png" },
        { type: "atlas", name: "Temmie_Lettering04", ext: ".json" },
        { type: "image", name: "Temmie_Lettering04", ext: ".png" }
    ];
    
    this._fonts[fontName] = {
        settings: null,
        atlases: {},
        _pendingLoads: files.filter(f => f.ext === ".json").length
    };
    
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        
        if (file.ext === ".json") {
            var dataName = "$dataBitmapFont_" + fontName + "_" + file.name;
            window[dataName] = null;
            
            // Load the JSON file
            DataManager.loadDataFile(dataName, "Bitmap Fonts/" + fontName + "/" + file.name + file.ext);
            
            // Store reference for later processing
            if (file.type === "settings") {
                this._fonts[fontName]._settingsDataName = dataName;
            } else if (file.type === "atlas") {
                if (!this._fonts[fontName]._atlasDataNames) {
                    this._fonts[fontName]._atlasDataNames = {};
                }
                this._fonts[fontName]._atlasDataNames[file.name] = dataName;
            }
        } else if (file.ext === ".png") {
            // Images can be loaded immediately
            ImageManager.loadBitmapFontImage(fontName, file.name, 0);
        }
    }
};

/**
 * Process loaded font data (call this after data is loaded)
 */
BitmapFontManager.processLoadedFontData = function(fontName) {
    var fontData = this._fonts[fontName];
    if (!fontData) return false;
    
    // Check if settings are loaded
    if (fontData._settingsDataName) {
        var settingsData = window[fontData._settingsDataName];
        if (settingsData) {
            fontData.settings = settingsData;
        } else {
            return false; // Not ready yet
        }
    }
    
    // Check if atlases are loaded
    if (fontData._atlasDataNames) {
        var atlasNames = Object.keys(fontData._atlasDataNames);
        for (var i = 0; i < atlasNames.length; i++) {
            var atlasName = atlasNames[i];
            var dataName = fontData._atlasDataNames[atlasName];
            var atlasData = window[dataName];
            
            if (atlasData) {
                fontData.atlases[atlasName] = this.processAtlasData(atlasData);
            } else {
                return false; // Not ready yet
            }
        }
    }
    
    // Clean up temporary data
    delete fontData._settingsDataName;
    delete fontData._atlasDataNames;
    delete fontData._pendingLoads;
    
    return true; // All data loaded successfully
};

/**
 * Check if all fonts are loaded
 */
BitmapFontManager.isReady = function() {
    var fontNames = Object.keys(this._fonts);
    for (var i = 0; i < fontNames.length; i++) {
        var fontData = this._fonts[fontNames[i]];
        if (fontData._pendingLoads !== undefined) {
            // Font still has pending loads, try to process
            if (!this.processLoadedFontData(fontNames[i])) {
                return false;
            }
        }
    }
    return true;
};

/**
 * Load all bitmap fonts from directory
 */
BitmapFontManager.loadAllBitmapFonts = function() {
    var fontFolders = ["GameFont"];
    
    for (var i = 0; i < fontFolders.length; i++) {
        this.createFontObject(fontFolders[i]);
    }
};

/**
 * Load bitmap font image
 */
ImageManager.loadBitmapFontImage = function(fontName, imageName, hue) {
    return this.loadBitmap("fonts/Bitmap Fonts/" + fontName + "/", imageName, hue, false);
};

//=============================================================================
// Scene_Boot
//=============================================================================

_TDS_.BitmapFonts.Scene_Boot_initialize = Scene_Boot.prototype.initialize;
_TDS_.BitmapFonts.Scene_Boot_isReady = Scene_Boot.prototype.isReady;

Scene_Boot.prototype.initialize = function() {
    _TDS_.BitmapFonts.Scene_Boot_initialize.call(this);
    BitmapFontManager.loadAllBitmapFonts();
};

Scene_Boot.prototype.isReady = function() {
    if (!_TDS_.BitmapFonts.Scene_Boot_isReady.call(this)) {
        return false;
    }
    return BitmapFontManager.isReady();
};

//=============================================================================
// Bitmap
//=============================================================================

_TDS_.BitmapFonts.Bitmap_initialize = Bitmap.prototype.initialize;
_TDS_.BitmapFonts.Bitmap_drawText = Bitmap.prototype.drawText;
_TDS_.BitmapFonts.Bitmap_measureTextWidth = Bitmap.prototype.measureTextWidth;

Bitmap.prototype.initialize = function(width, height) {
    _TDS_.BitmapFonts.Bitmap_initialize.call(this, width, height);
    this._bitmapFont = null;
    this._useBitmapFont = true;
    this._bitmapFontColor = null;
};

Object.defineProperty(Bitmap.prototype, "bitmapFontColor", {
    get: function() {
        return this._bitmapFontColor;
    },
    set: function(value) {
        if (Array.isArray(value)) {
            if (!value.equals(this._bitmapFontColor)) {
                this._bitmapFontColor = value;
                this.updateBitmapFont();
            }
        } else {
            if (this._bitmapFontColor !== value) {
                this._bitmapFontColor = value;
                this.updateBitmapFont();
            }
        }
    },
    configurable: true
});

Bitmap.prototype.isUsingBitmapFont = function() {
    return this._useBitmapFont;
};

Bitmap.prototype.measureTextWidth = function(text, forceUpdate = false) {
    if (this.isUsingBitmapFont()) {
        return this.measureBitmapFontText(text, forceUpdate).width;
    } else {
        return _TDS_.BitmapFonts.Bitmap_measureTextWidth.call(this, text);
    }
};

Bitmap.prototype.measureBitmapFontText = function(text, forceUpdate = false) {
    if (forceUpdate) {
        this.updateBitmapFont();
    }
    
    var measurements = { width: 0, height: 0 };
    var fontData = this._bitmapFont;
    
    if (fontData && text !== undefined) {
        measurements.height = fontData.fontHeight;
        var characters = text.toString().split("");
        
        for (var i = 0; i < characters.length; i++) {
            var charData = fontData.atlas.characters[characters[i]];
            measurements.width += charData ? charData.rect.w : fontData.spaceWidth;
        }
    }
    
    return measurements;
};

Bitmap.prototype.drawText = function(text, x, y, maxWidth, lineHeight, align) {
    if (this.isUsingBitmapFont()) {
        this.drawBitmapFontText(text, x, y, maxWidth, lineHeight, align);
    } else {
        _TDS_.BitmapFonts.Bitmap_drawText.call(this, text, x, y, maxWidth, lineHeight, align);
    }
};

Bitmap.prototype.updateBitmapFont = function() {
    if (BitmapFontManager.doesBitmapFontExist(this.fontFace)) {
        if (this._bitmapFont) {
            var currentFont = this._bitmapFont;
            if (!(currentFont.name === this.fontFace &&
                  currentFont.size === this.fontSize &&
                  currentFont.color.equals(this._bitmapFontColor))) {
                this._bitmapFont = BitmapFontManager.makeBitmapFontObject(
                    this.fontFace,
                    this.fontSize,
                    this._bitmapFontColor
                );
            }
        } else {
            this._bitmapFont = BitmapFontManager.makeBitmapFontObject(
                this.fontFace,
                this.fontSize,
                this._bitmapFontColor
            );
        }
    } else {
        this._bitmapFont = null;
    }
};

Bitmap.prototype.drawBitmapFontText = function(text, x, y, maxWidth, lineHeight, align) {
    this.updateBitmapFont();
    var fontData = this._bitmapFont;
    
    if (fontData && text !== undefined) {
        var fontBitmap = fontData.bitmap;
        var drawX = x;
        var drawY = y + lineHeight - (lineHeight - 0.7 * fontData.fontHeight) / 2;
        
        if (align === "center") {
            drawX += (maxWidth - this.measureTextWidth(text)) / 2;
        }
        if (align === "right") {
            drawX += maxWidth - this.measureTextWidth(text);
        }
        
        var characters = text.toString().split("");
        var currentX = 0;
        
        for (var i = 0; i < characters.length; i++) {
            var character = characters[i];
            var charData = fontData.atlas.characters[character];
            
            if (charData) {
                var heightDiff = charData.sourceSize.h - fontData.fontHeight;
                var charRect = charData.rect;
                var yOffset = (lineHeight - fontData.fontHeight) / 4;
                var charY = drawY - charRect.h + heightDiff + yOffset;
                
                this.blt(fontBitmap, charRect.x, charRect.y, charRect.w, charRect.h, drawX + currentX, charY);
                currentX += charRect.w;
            } else {
                currentX += fontData.spaceWidth;
            }
        }
    }
};

/**
 * Force a specific RGB tone on the bitmap (replaces colors)
 */
Bitmap.prototype.forceTone = function(red, green, blue) {
    if ((red || green || blue) && this.width > 0 && this.height > 0) {
        var context = this._context;
        var imageData = context.getImageData(0, 0, this.width, this.height);
        var pixels = imageData.data;
        
        for (var i = 0; i < pixels.length; i += 4) {
            pixels[i + 0] = red;   // Red channel
            pixels[i + 1] = green; // Green channel
            pixels[i + 2] = blue;  // Blue channel
        }
        
        context.putImageData(imageData, 0, 0);
        this._setDirty();
    }
};

//=============================================================================
// Window_Base
//=============================================================================

_TDS_.BitmapFonts.Window_Base_resetFontSettings = Window_Base.prototype.resetFontSettings;
_TDS_.BitmapFonts.Window_Base_processEscapeCharacter = Window_Base.prototype.processEscapeCharacter;

Window_Base.prototype.resetFontSettings = function() {
    _TDS_.BitmapFonts.Window_Base_resetFontSettings.call(this);
    this.contents.updateBitmapFont();
};

Window_Base.prototype.obtainMultiEscapeParam = function(textState) {
    var match = /^\[([^\]]*)\]/.exec(textState.text.slice(textState.index));
    var params = [];
    
    if (match) {
        textState.index += match[0].length;
        params = eval(match[0]);
    }
    
    return params;
};

Window_Base.prototype.processEscapeCharacter = function(code, textState) {
    switch (code) {
        case "BC":
            var colorParams = this.obtainMultiEscapeParam(textState);
            this.contents.bitmapFontColor = this.obtainBitmapFontColor(colorParams);
            break;
    }
    _TDS_.BitmapFonts.Window_Base_processEscapeCharacter.call(this, code, textState);
};

Window_Base.prototype.obtainBitmapFontColor = function(params) {
    if (params.length > 0) {
        if (params.length === 1) {
            return BitmapFontManager.hexToRGB(this.textColor(params[0]));
        } else {
            return params;
        }
    } else {
        return null;
    }
};

Window_Base.prototype.processNormalCharacter = function(textState) {
    var character = textState.text[textState.index++];
    var characterWidth = this.textWidth(character);
    this.contents.drawText(character, textState.x, textState.y, 2 * characterWidth, textState.height);
    textState.x += characterWidth;
};