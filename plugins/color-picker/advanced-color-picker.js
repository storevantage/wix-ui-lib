(function ($, window, document, undefined) {
	'use strict';
	
	var pluginName = 'AdvancedColorPicker';
	
	var defaults = {
		initColor : '#20872',
		palettePicker : "acpPalettePicker",
		paletteSlider : "acpPaletteSlider",
		slider : "acpSlider",
		selector : "acpSelector",
        template: "<div id=\"acpPalettePicker\" class=\"acp-picker-palette\"><div id=\"acpSelector\" class=\"acp-selector\"></div></div><div id=\"acpPaletteSlider\" class=\"acp-slider-palette\"><div id=\"acpSlider\" class=\"acp-slider\"></div></div>",
		draggable : false,
        readout : "acpReadoutWrapper",
        readoutInput: "acpReadoutInput",
        readouts: ['H', 'S', 'L', 'HEX'],
        palettePickerSize : 150,
        paletteSliderHeight: 150,
        sliderHeight : 12,
        selectorSize : 10
	};
	
	// Contain the present location of the slider bar
	var _sliderPosY = 0;

	// The actual plugin constructor
	function Plugin(element, options) {
		this.$el = $(element);
		this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
		this._name = pluginName;
		this.init();
	};

    Plugin.prototype.convertColor = function (color) {

        if (color.indexOf("rgb") != -1) {
            var start = color.indexOf("(");
            var rgbColor = color.substring(start + 1, color.length - 1);
            var rgbParts = rgbColor.split(',');
            return rgbToHex(parseInt(rgbParts[0]), parseInt(rgbParts[1]), parseInt(rgbParts[2]));
        }

        return color;
    };

	Plugin.prototype.init = function () {

        this.setContent();
        this.setConstants();

        var hex = this.paddingHex(this.convertColor(this.options.initColor));
        this.renderSlider();
		this.setSliderPos((this.convertHexToHslParts(hex)).h);

        this.renderPicker(this.getHslColor(hex, true));
		this.setSelectorPos(this.convertHexToHslParts(hex));

        this.$el.find('#' + this.options.readoutInput + "_" + this.options.readouts[3]).val(hex);
        this.updateHslReadoutValues(this.getHslColor(hex));
		this.bindEvents();
	};

    Plugin.prototype.setContent = function () {
        $(this.options.template).appendTo(this.$el);

        var readoutsWrapper = $('<div>', {
            class: 'readouts'
        });

        for (var i = 0; i < (this.options.readouts.length - 1); i++) {
            this.createReadout(this.options.readouts[i]).appendTo(readoutsWrapper);
        }

        this.createReadout(this.options.readouts[i], '#').appendTo(readoutsWrapper);

        this.$el.append(readoutsWrapper);
    };

    Plugin.prototype.paddingHex = function (hex) {

        var hexStr = hex.toString().replace('#', '');

        while (hexStr.length < 6) {
            hexStr = '0' + hexStr;
        }

        return hexStr;
    }

    Plugin.prototype.createReadout = function (name, lbl) {
        var opt = this.options;

        var lbl = lbl || name;
        var readoutLabel = $('<label>').text(lbl);

        var readoutInput = $('<input>', {
            id: opt.readoutInput + "_" + name ,
            class: "acp-readout-input"
        }).appendTo(readoutLabel);

        return $('<div>', {
            id: opt.readout + "_" + name,
            class: "acp-readout"
        }).append(readoutLabel);
    }

    Plugin.prototype.updateHslReadoutValues = function (hslParts) {
        var opt = this.options;

        this.$el.find('#' + opt.readoutInput + "_" + opt.readouts[0]).val(Math.floor(hslParts.h));
        this.$el.find('#' + opt.readoutInput + "_" + opt.readouts[1]).val(Math.floor(hslParts.s));
        this.$el.find('#' + opt.readoutInput + "_" + opt.readouts[2]).val(Math.floor(hslParts.l));
    };

    Plugin.prototype.getHslColor = function(colorHex, parse) {
        var hslParts = this.convertHexToHslParts(colorHex);
        hslParts = this.multHslParts(hslParts);

        return parse? this.parseHslColor(hslParts) : hslParts;
    };

    Plugin.prototype.multHslParts = function(hslParts) {
        return {
            h: hslParts.h *360,
            s: hslParts.s * 100,
            l: hslParts.l * 100
        };
    }

    Plugin.prototype.setConstants = function () {
        this._SLIDER_PALETTE_HEIGHT = this.options.paletteSliderHeight;
        this._PICKER_PALETTE_HEIGHT = this.options.palettePickerSize;
        this._PICKER_PALETTE_WIDTH = this.options.palettePickerSize;
        this._SLIDER_OFFSET = this.options.sliderHeight / 2;
        this._SELECTOR_OFFSET_X = this.options.selectorSize / 2;
        this._SELECTOR_OFFSET_Y = this.options.selectorSize / 2;
    };
	
	Plugin.prototype.renderPicker = function (color) {
		var opt = this.options;
        var palettePicker = this.$el.find('#' + opt.palettePicker);
		if (window.ieG) {
			var photoshopG2 = ieG('left', [{
							offset : '0%',
							color : color,
							opacity : '1'
						}, {
							offset : '100%',
							color : 'white',
							opacity : '1'
						}
					]);
            palettePicker.css("background-image", 'url("' + photoshopG1 + '"),url("' + photoshopG2 + '")');
		} else {
            palettePicker.css("background-image", '-webkit-linear-gradient(bottom, black, rgba(0,0,0,0)),-webkit-linear-gradient(left, ' + color + ', white)');
            palettePicker.css("background-image", '-moz-linear-gradient(bottom, black, rgba(0,0,0,0)),-moz-linear-gradient(left, ' + color + ', white)');
		}
	};
	
	Plugin.prototype.renderSlider = function () {
		var opt = this.options;
        var sliderPlt = this.$el.find('#' + opt.paletteSlider);

		if (window.ieG) {
            sliderPlt.css("background-image", 'url("' + hslGrad + '")');
		} else {
            sliderPlt.css("background-image", '-webkit-linear-gradient(top, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)');
            sliderPlt.css("background-image", '-moz-linear-gradient(top, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)');
		}
	};
	
	Plugin.prototype.colorFromPosPicker = function (pos) {
        var hVal = (this._sliderPosY/ (this._SLIDER_PALETTE_HEIGHT - 1)) * 360;
		var sVal = 100 - pos.x * 100;
		var lVal = (pos.y * -50) + (50 * pos.x) + 50 - (pos.y * pos.x * 50);
		
		return { h : hVal, s : sVal, l : lVal };
	};
	
	Plugin.prototype.colorFromPosSlider = function (pos) {
		return {h : pos.y * 360, s : 100, l : 50 };
	};
	
	Plugin.prototype.convertHexToHslParts = function (colorHex) {
        colorHex = this.paddingHex(colorHex);

		var colorRgb = hexToRgb(colorHex);
		var colorHsl = rgbToHsv(colorRgb.r, colorRgb.g, colorRgb.b);

		return {
			h : colorHsl[0],
			s : colorHsl[1],
			l : colorHsl[2]
		};
	};
	
	Plugin.prototype.setSelectorPos = function (hslParts) {
		var opt = this.options;
        var pos = { x : 0, y : 0 };

		pos.x = ((100 - hslParts.s * 100) / 100);
		pos.y = Math.floor(((hslParts.l * 100 + (-50 * pos.x) - 50) / ((-50 * pos.x) - 50)) * (this._PICKER_PALETTE_HEIGHT - 1));
      	pos.x = Math.floor(pos.x * (this._PICKER_PALETTE_WIDTH - 1));

        var selector = this.$el.find('#' + opt.selector);

        selector.css("top", parseInt(pos.y - this._SELECTOR_OFFSET_Y) + 'px');
        selector.css("left", parseInt(pos.x - this._SELECTOR_OFFSET_X) + 'px');
	};

    Plugin.prototype.setSliderPos = function (hPart) {
		var opt = this.options;

		this._sliderPosY =  (hPart * (this._SLIDER_PALETTE_HEIGHT - 1));

        this.$el.find('#' + opt.slider).css("top", this._sliderPosY - this._SLIDER_OFFSET);
	};
	
	Plugin.prototype.parseHslColor = function (hsl) {
		return 'hsl(' + hsl.h + ', ' + hsl.s + '% , ' + hsl.l + '%)';
	};
	
	Plugin.prototype.offsetPosFromEvent = function (e) {
		return {
			x : (e.offsetX || (e.clientX - e.target.offsetLeft)),
			y : (e.offsetY || (e.clientY - e.target.offsetTop))
		};
	};

//    Plugin.prototype.isHexInput = function (el) {
//        return (el.id === (this.options.readoutInput + "_" +  opt.readouts[3]));
//    };

    Plugin.prototype.RenderByHslInputs = function () {
        var opt = this.options;
        var hsl = { h: 0, s: 0, l:0 };
        hsl.h = this.$el.find('#' + opt.readoutInput + "_" + opt.readouts[0]).val();
        hsl.s = this.$el.find('#' + opt.readoutInput + "_" + opt.readouts[1]).val();
        hsl.l = this.$el.find('#' + opt.readoutInput + "_" + opt.readouts[2]).val();

        this.SetHexValue(hsl);

        var hslFormat = this.parseHslColor(hsl);
        this.renderPicker(hslFormat);

        hsl.h /= 360;
        hsl.s /= 100;
        hsl.l /= 100;

        this.setSliderPos(hsl.h);
        this.setSelectorPos(hsl);
    };

    Plugin.prototype.SetHexValue = function (hslParts) {
        var opt = this.options;

        var rgb = hslToRgb(hslParts.h, hslParts.s, hslParts.l);
        this.$el.find('#' + opt.readoutInput + "_" + opt.readouts[3]).val(rgbToHex(rgb.r, rgb.g, rgb.b));
    };

	Plugin.prototype.bindEvents = function () {
        this.$el.find('#' + this.options.paletteSlider).click( function(e) {
            var opt = this.options;

            if (e.target.className === opt.slider) {
                return;
            }

            var pos = this.offsetPosFromEvent(e);

            this.$el.find('#' + opt.slider).css("top", (pos.y - this._SLIDER_OFFSET) + 'px');
            this._sliderPosY = pos.y;

            pos.x = pos.x / (e.target.clientWidth - 1);
            pos.y = pos.y / (e.target.clientHeight - 1);

            var color = this.colorFromPosSlider(pos);

            this.renderPicker(this.parseHslColor(color));

            this.updateHslReadoutValues(color);
            this.SetHexValue(color);
            this.$el.trigger('colorChanged', this.parseHslColor(color));
        }.bind(this));

        this.$el.find('#' + this.options.palettePicker).click( function(e) {
            var opt = this.options;

            if (e.target.className === opt.selector) {
                return;
            }

            var pos = this.offsetPosFromEvent(e);
            var selector = this.$el.find('#' + opt.selector);

            selector.css("top", (pos.y - this._SELECTOR_OFFSET_Y) + 'px');
            selector.css("left", (pos.x - this._SELECTOR_OFFSET_X) + 'px');

            pos.x = pos.x / (e.target.clientWidth - 1);
            pos.y = pos.y / (e.target.clientHeight - 1);

            var color = this.colorFromPosPicker(pos);

            this.updateHslReadoutValues(color);
            this.SetHexValue(color);
            this.$el.trigger('colorChanged', this.parseHslColor(color));

        }.bind(this));

        this.$el.find('.' +  "acp-readout-input").keyup( function (e) {
            if (e.target.id === (this.options.readoutInput + "_" + this.options.readouts[3])) {
                var hex = this.$el.find('#' + this.options.readoutInput + "_" + this.options.readouts[3]).val();

                hex = this.paddingHex(hex);
                var hslParts = this.convertHexToHslParts(hex);
                this.updateHslReadoutValues(this.multHslParts(hslParts));

                this.setSliderPos(hslParts.h);

                this.renderPicker(this.parseHslColor(this.multHslParts(hslParts)));
                this.setSelectorPos(hslParts);
            }
            else {
                this.RenderByHslInputs();
            }
        }.bind(this));

	};

	$.fn[pluginName] = function (options) {
		return this.each(function () {
			if (!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName,
					new Plugin(this, options));
			}
		});
	};
	
})(jQuery, window, document);
