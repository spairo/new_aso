(function ($, undefined) {
    var ataa_ui_coreCSS = "";
    var ataa_ui_coreLink = document.createElement("link");
    ataa_ui_coreLink.setAttribute('rel', 'stylesheet');
    ataa_ui_coreLink.setAttribute('type', 'text/css');
    ataa_ui_coreLink.setAttribute('href', ataa_ui_coreCSS);
    var ataa_ui_coreHead = document.getElementsByTagName('head')[0];
    if (!ataa_ui_coreHead) {
        ataa_ui_coreHead = document.body.parentNode.appendChild(document.createElement('head'))
    }
    ataa_ui_coreHead.appendChild(ataa_ui_coreLink);
    $.ui = $.ui || {};
    if ($.ui.version) {
        return
    }
    $.extend($.ui, {
        version: "1.8.9",
        keyCode: {
            ALT: 18,
            BACKSPACE: 8,
            CAPS_LOCK: 20,
            COMMA: 188,
            COMMAND: 91,
            COMMAND_LEFT: 91,
            COMMAND_RIGHT: 93,
            CONTROL: 17,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            INSERT: 45,
            LEFT: 37,
            MENU: 93,
            NUMPAD_ADD: 107,
            NUMPAD_DECIMAL: 110,
            NUMPAD_DIVIDE: 111,
            NUMPAD_ENTER: 108,
            NUMPAD_MULTIPLY: 106,
            NUMPAD_SUBTRACT: 109,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            PERIOD: 190,
            RIGHT: 39,
            SHIFT: 16,
            SPACE: 32,
            TAB: 9,
            UP: 38,
            WINDOWS: 91
        }
    });
    $.fn.extend({
        _focus: $.fn.focus,
        focus: function (delay, fn) {
            return typeof delay === "number" ? this.each(function () {
                var elem = this;
                setTimeout(function () {
                    $(elem).focus();
                    if (fn) {
                        fn.call(elem)
                    }
                }, delay)
            }) : this._focus.apply(this, arguments)
        },
        scrollParent: function () {
            var scrollParent;
            if (($.browser.msie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
                scrollParent = this.parents().filter(function () {
                    return (/(relative|absolute|fixed)/).test($.curCSS(this, 'position', 1)) && (/(auto|scroll)/).test($.curCSS(this, 'overflow', 1) + $.curCSS(this, 'overflow-y', 1) + $.curCSS(this, 'overflow-x', 1))
                }).eq(0)
            } else {
                scrollParent = this.parents().filter(function () {
                    return (/(auto|scroll)/).test($.curCSS(this, 'overflow', 1) + $.curCSS(this, 'overflow-y', 1) + $.curCSS(this, 'overflow-x', 1))
                }).eq(0)
            }
            return (/fixed/).test(this.css('position')) || !scrollParent.length ? $(document) : scrollParent
        },
        zIndex: function (zIndex) {
            if (zIndex !== undefined) {
                return this.css("zIndex", zIndex)
            }
            if (this.length) {
                var elem = $(this[0]),
                    position, value;
                while (elem.length && elem[0] !== document) {
                    position = elem.css("position");
                    if (position === "absolute" || position === "relative" || position === "fixed") {
                        value = parseInt(elem.css("zIndex"), 10);
                        if (!isNaN(value) && value !== 0) {
                            return value
                        }
                    }
                    elem = elem.parent()
                }
            }
            return 0
        },
        disableSelection: function () {
            return this.bind(($.support.selectstart ? "selectstart" : "mousedown") + ".ui-disableSelection", function (event) {
                event.preventDefault()
            })
        },
        enableSelection: function () {
            return this.unbind(".ui-disableSelection")
        }
    });
    $.each(["Width", "Height"], function (i, name) {
        var side = name === "Width" ? ["Left", "Right"] : ["Top", "Bottom"],
            type = name.toLowerCase(),
            orig = {
                innerWidth: $.fn.innerWidth,
                innerHeight: $.fn.innerHeight,
                outerWidth: $.fn.outerWidth,
                outerHeight: $.fn.outerHeight
            };

        function reduce(elem, size, border, margin) {
            $.each(side, function () {
                size -= parseFloat($.curCSS(elem, "padding" + this, true)) || 0;
                if (border) {
                    size -= parseFloat($.curCSS(elem, "border" + this + "Width", true)) || 0
                }
                if (margin) {
                    size -= parseFloat($.curCSS(elem, "margin" + this, true)) || 0
                }
            });
            return size
        }
        $.fn["inner" + name] = function (size) {
            if (size === undefined) {
                return orig["inner" + name].call(this)
            }
            return this.each(function () {
                $(this).css(type, reduce(this, size) + "px")
            })
        };
        $.fn["outer" + name] = function (size, margin) {
            if (typeof size !== "number") {
                return orig["outer" + name].call(this, size)
            }
            return this.each(function () {
                $(this).css(type, reduce(this, size, true, margin) + "px")
            })
        }
    });

    function visible(element) {
        return !$(element).parents().andSelf().filter(function () {
            return $.curCSS(this, "visibility") === "hidden" || $.expr.filters.hidden(this)
        }).length
    }
    $.extend($.expr[":"], {
        data: function (elem, i, match) {
            return !!$.data(elem, match[3])
        },
        focusable: function (element) {
            var nodeName = element.nodeName.toLowerCase(),
                tabIndex = $.attr(element, "tabindex");
            if ("area" === nodeName) {
                var map = element.parentNode,
                    mapName = map.name,
                    img;
                if (!element.href || !mapName || map.nodeName.toLowerCase() !== "map") {
                    return false
                }
                img = $("img[usemap=#" + mapName + "]")[0];
                return !!img && visible(img)
            }
            return (/input|select|textarea|button|object/.test(nodeName) ? !element.disabled : "a" == nodeName ? element.href || !isNaN(tabIndex) : !isNaN(tabIndex)) && visible(element)
        },
        tabbable: function (element) {
            var tabIndex = $.attr(element, "tabindex");
            return (isNaN(tabIndex) || tabIndex >= 0) && $(element).is(":focusable")
        }
    });
    $(function () {
        var body = document.body,
            div = body.appendChild(div = document.createElement("div"));
        $.extend(div.style, {
            minHeight: "100px",
            height: "auto",
            padding: 0,
            borderWidth: 0
        });
        $.support.minHeight = div.offsetHeight === 100;
        $.support.selectstart = "onselectstart" in div;
        body.removeChild(div).style.display = "none"
    });
    $.extend($.ui, {
        plugin: {
            add: function (module, option, set) {
                var proto = $.ui[module].prototype;
                for (var i in set) {
                    proto.plugins[i] = proto.plugins[i] || [];
                    proto.plugins[i].push([option, set[i]])
                }
            },
            call: function (instance, name, args) {
                var set = instance.plugins[name];
                if (!set || !instance.element[0].parentNode) {
                    return
                }
                for (var i = 0; i < set.length; i++) {
                    if (instance.options[set[i][0]]) {
                        set[i][1].apply(instance.element, args)
                    }
                }
            }
        },
        contains: function (a, b) {
            return document.compareDocumentPosition ? a.compareDocumentPosition(b) & 16 : a !== b && a.contains(b)
        },
        hasScroll: function (el, a) {
            if ($(el).css("overflow") === "hidden") {
                return false
            }
            var scroll = (a && a === "left") ? "scrollLeft" : "scrollTop",
                has = false;
            if (el[scroll] > 0) {
                return true
            }
            el[scroll] = 1;
            has = (el[scroll] > 0);
            el[scroll] = 0;
            return has
        },
        isOverAxis: function (x, reference, size) {
            return (x > reference) && (x < (reference + size))
        },
        isOver: function (y, x, top, left, height, width) {
            return $.ui.isOverAxis(y, top, height) && $.ui.isOverAxis(x, left, width)
        }
    })
})(jQuery);
(function ($, undefined) {
    if ($.cleanData) {
        var _cleanData = $.cleanData;
        $.cleanData = function (elems) {
            for (var i = 0, elem;
            (elem = elems[i]) != null; i++) {
                $(elem).triggerHandler("remove")
            }
            _cleanData(elems)
        }
    } else {
        var _remove = $.fn.remove;
        $.fn.remove = function (selector, keepData) {
            return this.each(function () {
                if (!keepData) {
                    if (!selector || $.filter(selector, [this]).length) {
                        $("*", this).add([this]).each(function () {
                            $(this).triggerHandler("remove")
                        })
                    }
                }
                return _remove.call($(this), selector, keepData)
            })
        }
    }
    $.widget = function (name, base, prototype) {
        var namespace = name.split(".")[0],
            fullName;
        name = name.split(".")[1];
        fullName = namespace + "-" + name;
        if (!prototype) {
            prototype = base;
            base = $.Widget
        }
        $.expr[":"][fullName] = function (elem) {
            return !!$.data(elem, name)
        };
        $[namespace] = $[namespace] || {};
        $[namespace][name] = function (options, element) {
            if (arguments.length) {
                this._createWidget(options, element)
            }
        };
        var basePrototype = new base();
        basePrototype.options = $.extend(true, {}, basePrototype.options);
        $[namespace][name].prototype = $.extend(true, basePrototype, {
            namespace: namespace,
            widgetName: name,
            widgetEventPrefix: $[namespace][name].prototype.widgetEventPrefix || name,
            widgetBaseClass: fullName
        }, prototype);
        $.widget.bridge(name, $[namespace][name])
    };
    $.widget.bridge = function (name, object) {
        $.fn[name] = function (options) {
            var isMethodCall = typeof options === "string",
                args = Array.prototype.slice.call(arguments, 1),
                returnValue = this;
            options = !isMethodCall && args.length ? $.extend.apply(null, [true, options].concat(args)) : options;
            if (isMethodCall && options.charAt(0) === "_") {
                return returnValue
            }
            if (isMethodCall) {
                this.each(function () {
                    var instance = $.data(this, name),
                        methodValue = instance && $.isFunction(instance[options]) ? instance[options].apply(instance, args) : instance;
                    if (methodValue !== instance && methodValue !== undefined) {
                        returnValue = methodValue;
                        return false
                    }
                })
            } else {
                this.each(function () {
                    var instance = $.data(this, name);
                    if (instance) {
                        instance.option(options || {})._init()
                    } else {
                        $.data(this, name, new object(options, this))
                    }
                })
            }
            return returnValue
        }
    };
    $.Widget = function (options, element) {
        if (arguments.length) {
            this._createWidget(options, element)
        }
    };
    $.Widget.prototype = {
        widgetName: "widget",
        widgetEventPrefix: "",
        options: {
            disabled: false
        },
        _createWidget: function (options, element) {
            $.data(element, this.widgetName, this);
            this.element = $(element);
            this.options = $.extend(true, {}, this.options, this._getCreateOptions(), options);
            var self = this;
            this.element.bind("remove." + this.widgetName, function () {
                self.destroy()
            });
            this._create();
            this._trigger("create");
            this._init()
        },
        _getCreateOptions: function () {
            return $.metadata && $.metadata.get(this.element[0])[this.widgetName]
        },
        _create: function () {},
        _init: function () {},
        destroy: function () {
            this.element.unbind("." + this.widgetName).removeData(this.widgetName);
            this.widget().unbind("." + this.widgetName).removeAttr("aria-disabled").removeClass(this.widgetBaseClass + "-disabled " + "ui-state-disabled")
        },
        widget: function () {
            return this.element
        },
        option: function (key, value) {
            var options = key;
            if (arguments.length === 0) {
                return $.extend({}, this.options)
            }
            if (typeof key === "string") {
                if (value === undefined) {
                    return this.options[key]
                }
                options = {};
                options[key] = value
            }
            this._setOptions(options);
            return this
        },
        _setOptions: function (options) {
            var self = this;
            $.each(options, function (key, value) {
                self._setOption(key, value)
            });
            return this
        },
        _setOption: function (key, value) {
            this.options[key] = value;
            if (key === "disabled") {
                this.widget()[value ? "addClass" : "removeClass"](this.widgetBaseClass + "-disabled" + " " + "ui-state-disabled").attr("aria-disabled", value)
            }
            return this
        },
        enable: function () {
            return this._setOption("disabled", false)
        },
        disable: function () {
            return this._setOption("disabled", true)
        },
        _trigger: function (type, event, data) {
            var callback = this.options[type];
            event = $.Event(event);
            event.type = (type === this.widgetEventPrefix ? type : this.widgetEventPrefix + type).toLowerCase();
            data = data || {};
            if (event.originalEvent) {
                for (var i = $.event.props.length, prop; i;) {
                    prop = $.event.props[--i];
                    event[prop] = event.originalEvent[prop]
                }
            }
            this.element.trigger(event, data);
            return !($.isFunction(callback) && callback.call(this.element[0], event, data) === false || event.isDefaultPrevented())
        }
    }
})(jQuery);
(function ($, undefined) {
    $.widget("ui.mouse", {
        options: {
            cancel: ':input,option',
            distance: 1,
            delay: 0
        },
        _mouseInit: function () {
            var self = this;
            this.element.bind('mousedown.' + this.widgetName, function (event) {
                return self._mouseDown(event)
            }).bind('click.' + this.widgetName, function (event) {
                if (true === $.data(event.target, self.widgetName + '.preventClickEvent')) {
                    $.removeData(event.target, self.widgetName + '.preventClickEvent');
                    event.stopImmediatePropagation();
                    return false
                }
            });
            this.started = false
        },
        _mouseDestroy: function () {
            this.element.unbind('.' + this.widgetName)
        },
        _mouseDown: function (event) {
            event.originalEvent = event.originalEvent || {};
            if (event.originalEvent.mouseHandled) {
                return
            }(this._mouseStarted && this._mouseUp(event));
            this._mouseDownEvent = event;
            var self = this,
                btnIsLeft = (event.which == 1),
                elIsCancel = (typeof this.options.cancel == "string" ? $(event.target).parents().add(event.target).filter(this.options.cancel).length : false);
            if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
                return true
            }
            this.mouseDelayMet = !this.options.delay;
            if (!this.mouseDelayMet) {
                this._mouseDelayTimer = setTimeout(function () {
                    self.mouseDelayMet = true
                }, this.options.delay)
            }
            if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
                this._mouseStarted = (this._mouseStart(event) !== false);
                if (!this._mouseStarted) {
                    event.preventDefault();
                    return true
                }
            }
            this._mouseMoveDelegate = function (event) {
                return self._mouseMove(event)
            };
            this._mouseUpDelegate = function (event) {
                return self._mouseUp(event)
            };
            $(document).bind('mousemove.' + this.widgetName, this._mouseMoveDelegate).bind('mouseup.' + this.widgetName, this._mouseUpDelegate);
            event.preventDefault();
            event.originalEvent.mouseHandled = true;
            return true
        },
        _mouseMove: function (event) {
            if ($.browser.msie && !(document.documentMode >= 9) && !event.button) {
                return this._mouseUp(event)
            }
            if (this._mouseStarted) {
                this._mouseDrag(event);
                return event.preventDefault()
            }
            if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
                this._mouseStarted = (this._mouseStart(this._mouseDownEvent, event) !== false);
                (this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event))
            }
            return !this._mouseStarted
        },
        _mouseUp: function (event) {
            $(document).unbind('mousemove.' + this.widgetName, this._mouseMoveDelegate).unbind('mouseup.' + this.widgetName, this._mouseUpDelegate);
            if (this._mouseStarted) {
                this._mouseStarted = false;
                if (event.target == this._mouseDownEvent.target) {
                    $.data(event.target, this.widgetName + '.preventClickEvent', true)
                }
                this._mouseStop(event)
            }
            return false
        },
        _mouseDistanceMet: function (event) {
            return (Math.max(Math.abs(this._mouseDownEvent.pageX - event.pageX), Math.abs(this._mouseDownEvent.pageY - event.pageY)) >= this.options.distance)
        },
        _mouseDelayMet: function (event) {
            return this.mouseDelayMet
        },
        _mouseStart: function (event) {},
        _mouseDrag: function (event) {},
        _mouseStop: function (event) {},
        _mouseCapture: function (event) {
            return true
        }
    })
})(jQuery);
(function ($, undefined) {
    $.ui = $.ui || {};
    var horizontalPositions = /left|center|right/,
        verticalPositions = /top|center|bottom/,
        center = "center",
        _position = $.fn.position,
        _offset = $.fn.offset;
    $.fn.position = function (options) {
        if (!options || !options.of) {
            return _position.apply(this, arguments)
        }
        options = $.extend({}, options);
        var target = $(options.of),
            targetElem = target[0],
            collision = (options.collision || "flip").split(" "),
            offset = options.offset ? options.offset.split(" ") : [0, 0],
            targetWidth, targetHeight, basePosition;
        if (targetElem.nodeType === 9) {
            targetWidth = target.width();
            targetHeight = target.height();
            basePosition = {
                top: 0,
                left: 0
            }
        } else if (targetElem.setTimeout) {
            targetWidth = target.width();
            targetHeight = target.height();
            basePosition = {
                top: target.scrollTop(),
                left: target.scrollLeft()
            }
        } else if (targetElem.preventDefault) {
            options.at = "left top";
            targetWidth = targetHeight = 0;
            basePosition = {
                top: options.of.pageY,
                left: options.of.pageX
            }
        } else {
            targetWidth = target.outerWidth();
            targetHeight = target.outerHeight();
            basePosition = target.offset()
        }
        $.each(["my", "at"], function () {
            var pos = (options[this] || "").split(" ");
            if (pos.length === 1) {
                pos = horizontalPositions.test(pos[0]) ? pos.concat([center]) : verticalPositions.test(pos[0]) ? [center].concat(pos) : [center, center]
            }
            pos[0] = horizontalPositions.test(pos[0]) ? pos[0] : center;
            pos[1] = verticalPositions.test(pos[1]) ? pos[1] : center;
            options[this] = pos
        });
        if (collision.length === 1) {
            collision[1] = collision[0]
        }
        offset[0] = parseInt(offset[0], 10) || 0;
        if (offset.length === 1) {
            offset[1] = offset[0]
        }
        offset[1] = parseInt(offset[1], 10) || 0;
        if (options.at[0] === "right") {
            basePosition.left += targetWidth
        } else if (options.at[0] === center) {
            basePosition.left += targetWidth / 2
        }
        if (options.at[1] === "bottom") {
            basePosition.top += targetHeight
        } else if (options.at[1] === center) {
            basePosition.top += targetHeight / 2
        }
        basePosition.left += offset[0];
        basePosition.top += offset[1];
        return this.each(function () {
            var elem = $(this),
                elemWidth = elem.outerWidth(),
                elemHeight = elem.outerHeight(),
                marginLeft = parseInt($.curCSS(this, "marginLeft", true)) || 0,
                marginTop = parseInt($.curCSS(this, "marginTop", true)) || 0,
                collisionWidth = elemWidth + marginLeft + (parseInt($.curCSS(this, "marginRight", true)) || 0),
                collisionHeight = elemHeight + marginTop + (parseInt($.curCSS(this, "marginBottom", true)) || 0),
                position = $.extend({}, basePosition),
                collisionPosition;
            if (options.my[0] === "right") {
                position.left -= elemWidth
            } else if (options.my[0] === center) {
                position.left -= elemWidth / 2
            }
            if (options.my[1] === "bottom") {
                position.top -= elemHeight
            } else if (options.my[1] === center) {
                position.top -= elemHeight / 2
            }
            position.left = Math.round(position.left);
            position.top = Math.round(position.top);
            collisionPosition = {
                left: position.left - marginLeft,
                top: position.top - marginTop
            };
            $.each(["left", "top"], function (i, dir) {
                if ($.ui.position[collision[i]]) {
                    $.ui.position[collision[i]][dir](position, {
                        targetWidth: targetWidth,
                        targetHeight: targetHeight,
                        elemWidth: elemWidth,
                        elemHeight: elemHeight,
                        collisionPosition: collisionPosition,
                        collisionWidth: collisionWidth,
                        collisionHeight: collisionHeight,
                        offset: offset,
                        my: options.my,
                        at: options.at
                    })
                }
            });
            if ($.fn.bgiframe) {
                elem.bgiframe()
            }
            elem.offset($.extend(position, {
                using: options.using
            }))
        })
    };
    $.ui.position = {
        fit: {
            left: function (position, data) {
                var win = $(window),
                    over = data.collisionPosition.left + data.collisionWidth - win.width() - win.scrollLeft();
                position.left = over > 0 ? position.left - over : Math.max(position.left - data.collisionPosition.left, position.left)
            },
            top: function (position, data) {
                var win = $(window),
                    over = data.collisionPosition.top + data.collisionHeight - win.height() - win.scrollTop();
                position.top = over > 0 ? position.top - over : Math.max(position.top - data.collisionPosition.top, position.top)
            }
        },
        flip: {
            left: function (position, data) {
                if (data.at[0] === center) {
                    return
                }
                var win = $(window),
                    over = data.collisionPosition.left + data.collisionWidth - win.width() - win.scrollLeft(),
                    myOffset = data.my[0] === "left" ? -data.elemWidth : data.my[0] === "right" ? data.elemWidth : 0,
                    atOffset = data.at[0] === "left" ? data.targetWidth : -data.targetWidth,
                    offset = -2 * data.offset[0];
                position.left += data.collisionPosition.left < 0 ? myOffset + atOffset + offset : over > 0 ? myOffset + atOffset + offset : 0
            },
            top: function (position, data) {
                if (data.at[1] === center) {
                    return
                }
                var win = $(window),
                    over = data.collisionPosition.top + data.collisionHeight - win.height() - win.scrollTop(),
                    myOffset = data.my[1] === "top" ? -data.elemHeight : data.my[1] === "bottom" ? data.elemHeight : 0,
                    atOffset = data.at[1] === "top" ? data.targetHeight : -data.targetHeight,
                    offset = -2 * data.offset[1];
                position.top += data.collisionPosition.top < 0 ? myOffset + atOffset + offset : over > 0 ? myOffset + atOffset + offset : 0
            }
        }
    };
    if (!$.offset.setOffset) {
        $.offset.setOffset = function (elem, options) {
            if (/static/.test($.curCSS(elem, "position"))) {
                elem.style.position = "relative"
            }
            var curElem = $(elem),
                curOffset = curElem.offset(),
                curTop = parseInt($.curCSS(elem, "top", true), 10) || 0,
                curLeft = parseInt($.curCSS(elem, "left", true), 10) || 0,
                props = {
                    top: (options.top - curOffset.top) + curTop,
                    left: (options.left - curOffset.left) + curLeft
                };
            if ('using' in options) {
                options.using.call(elem, props)
            } else {
                curElem.css(props)
            }
        };
        $.fn.offset = function (options) {
            var elem = this[0];
            if (!elem || !elem.ownerDocument) {
                return null
            }
            if (options) {
                return this.each(function () {
                    $.offset.setOffset(this, options)
                })
            }
            return _offset.call(this)
        }
    }
}(jQuery));