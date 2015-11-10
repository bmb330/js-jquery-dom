/*!
 * jQuery++ - 1.0.1
 * http://jquerypp.com
 * Copyright (c) 2014 Bitovi
 * Tue, 02 Dec 2014 04:14:15 GMT
 * Licensed MIT
 * Download from: http://bitbuilder.herokuapp.com/jquerypp.custom.js?plugins=jquerypp%2Fevent%2Fdrag&plugins=jquerypp%2Fevent%2Fresize
 */
(function($) {

    // ## jquerypp/lang/vector/vector.js
    var __m4 = (function($) {
        var getSetZero = function(v) {
            return v !== undefined ? (this.array[0] = v) : this.array[0]
        },
            getSetOne = function(v) {
                return v !== undefined ? (this.array[1] = v) : this.array[1]
            };

        $.Vector = function(arr) {
            var array = $.isArray(arr) ? arr : $.makeArray(arguments);
            this.update(array);
        };
        $.Vector.prototype =

        {

            app: function(f) {
                var i, newArr = [];

                for (i = 0; i < this.array.length; i++) {
                    newArr.push(f(this.array[i], i));
                }
                return new $.Vector(newArr);
            },

            plus: function() {
                var i, args = arguments[0] instanceof $.Vector ? arguments[0].array : $.makeArray(arguments),
                    arr = this.array.slice(0),
                    vec = new $.Vector();
                for (i = 0; i < args.length; i++) {
                    arr[i] = (arr[i] ? arr[i] : 0) + args[i];
                }
                return vec.update(arr);
            },

            minus: function() {
                var i, args = arguments[0] instanceof $.Vector ? arguments[0].array : $.makeArray(arguments),
                    arr = this.array.slice(0),
                    vec = new $.Vector();
                for (i = 0; i < args.length; i++) {
                    arr[i] = (arr[i] ? arr[i] : 0) - args[i];
                }
                return vec.update(arr);
            },

            equals: function() {
                var i, args = arguments[0] instanceof $.Vector ? arguments[0].array : $.makeArray(arguments),
                    arr = this.array.slice(0),
                    vec = new $.Vector();
                for (i = 0; i < args.length; i++) {
                    if (arr[i] != args[i]) {
                        return null;
                    }
                }
                return vec.update(arr);
            },

            x: getSetZero,

            left: getSetZero,

            width: getSetZero,

            y: getSetOne,

            top: getSetOne,

            height: getSetOne,

            toString: function() {
                return "(" + this.array.join(', ') + ")";
            },

            update: function(array) {
                var i;
                if (this.array) {
                    for (i = 0; i < this.array.length; i++) {
                        delete this.array[i];
                    }
                }
                this.array = array;
                for (i = 0; i < array.length; i++) {
                    this[i] = this.array[i];
                }
                return this;
            }
        };

        $.Event.prototype.vector = function() {
            // Get the first touch element for touch events
            var touches = "ontouchend" in document && this.originalEvent.touches && this.originalEvent.touches.length ? this.originalEvent.changedTouches[0] : this;
            if (this.originalEvent.synthetic) {
                var doc = document.documentElement,
                    body = document.body;
                return new $.Vector(touches.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0),
                    touches.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0));
            } else {
                return new $.Vector(touches.pageX, touches.pageY);
            }
        };

        $.fn.offsetv = function() {
            if (this[0] == window) {
                return new $.Vector(window.pageXOffset ? window.pageXOffset : document.documentElement.scrollLeft, window.pageYOffset ? window.pageYOffset : document.documentElement.scrollTop);
            } else {
                var offset = this.offset() || {};
                return new $.Vector(offset.left, offset.top);
            }
        };

        $.fn.dimensionsv = function(which) {
            if (this[0] == window || !which) {
                return new $.Vector(this.width(), this.height());
            } else {
                return new $.Vector(this[which + "Width"](), this[which + "Height"]());
            }
        };

        return $;
    })($);

    // ## jquerypp/event/livehack/livehack.js
    var __m5 = (function($) {

        var event = $.event,

            //helper that finds handlers by type and calls back a function, this is basically handle
            // events - the events object
            // types - an array of event types to look for
            // callback(type, handlerFunc, selector) - a callback
            // selector - an optional selector to filter with, if there, matches by selector
            //     if null, matches anything, otherwise, matches with no selector
            findHelper = function(events, types, callback, selector) {
                var t, type, typeHandlers, all, h, handle,
                    namespaces, namespace,
                    match;
                for (t = 0; t < types.length; t++) {
                    type = types[t];
                    all = type.indexOf(".") < 0;
                    if (!all) {
                        namespaces = type.split(".");
                        type = namespaces.shift();
                        namespace = new RegExp("(^|\\.)" + namespaces.slice(0).sort().join("\\.(?:.*\\.)?") + "(\\.|$)");
                    }
                    typeHandlers = (events[type] || []).slice(0);

                    for (h = 0; h < typeHandlers.length; h++) {
                        handle = typeHandlers[h];

                        match = (all || namespace.test(handle.namespace));

                        if (match) {
                            if (selector) {
                                if (handle.selector === selector) {
                                    callback(type, handle.origHandler || handle.handler);
                                }
                            } else if (selector === null) {
                                callback(type, handle.origHandler || handle.handler, handle.selector);
                            } else if (!handle.selector) {
                                callback(type, handle.origHandler || handle.handler);

                            }
                        }


                    }
                }
            };


        event.find = function(el, types, selector) {
            var events = ($._data(el) || {}).events,
                handlers = [],
                t, liver, live;

            if (!events) {
                return handlers;
            }
            findHelper(events, types, function(type, handler) {
                handlers.push(handler);
            }, selector);
            return handlers;
        };

        event.findBySelector = function(el, types) {
            var events = $._data(el).events,
                selectors = {},
                //adds a handler for a given selector and event
                add = function(selector, event, handler) {
                    var select = selectors[selector] || (selectors[selector] = {}),
                        events = select[event] || (select[event] = []);
                    events.push(handler);
                };

            if (!events) {
                return selectors;
            }
            //first check live:

            //then check straight binds
            findHelper(events, types, function(type, handler, selector) {
                add(selector || "", type, handler);
            }, null);

            return selectors;
        };
        event.supportTouch = "ontouchend" in document;

        $.fn.respondsTo = function(events) {
            if (!this.length) {
                return false;
            } else {
                //add default ?
                return event.find(this[0], $.isArray(events) ? events : [events]).length > 0;
            }
        };
        $.fn.triggerHandled = function(event, data) {
            event = (typeof event == "string" ? $.Event(event) : event);
            this.trigger(event, data);
            return event.handled;
        };

        event.setupHelper = function(types, startingEvent, onFirst) {
            if (!onFirst) {
                onFirst = startingEvent;
                startingEvent = null;
            }
            var add = function(handleObj) {
                var bySelector,
                    selector = handleObj.selector || "",
                    namespace = handleObj.namespace ? '.' + handleObj.namespace : '';

                if (selector) {
                    bySelector = event.find(this, types, selector);
                    if (!bySelector.length) {
                        $(this).delegate(selector, startingEvent + namespace, onFirst);
                    }
                } else {
                    //var bySelector = event.find(this, types, selector);
                    if (!event.find(this, types, selector).length) {
                        event.add(this, startingEvent + namespace, onFirst, {
                                selector: selector,
                                delegate: this
                            });
                    }

                }

            },
                remove = function(handleObj) {
                    var bySelector, selector = handleObj.selector || "";
                    if (selector) {
                        bySelector = event.find(this, types, selector);
                        if (!bySelector.length) {
                            $(this).undelegate(selector, startingEvent, onFirst);
                        }
                    } else {
                        if (!event.find(this, types, selector).length) {
                            event.remove(this, startingEvent, onFirst, {
                                    selector: selector,
                                    delegate: this
                                });
                        }
                    }
                };
            $.each(types, function() {
                event.special[this] = {
                    add: add,
                    remove: remove,
                    setup: function() {},
                    teardown: function() {}
                };
            });
        };

        return $;
    })($);

    // ## jquerypp/event/reverse/reverse.js
    var __m6 = (function($) {
        $.event.reverse = function(name, attributes) {
            var bound = $(),
                count = 0,
                dispatch = $.event.handle || $.event.dispatch;

            $.event.special[name] = {
                setup: function() {
                    // add and sort the resizers array
                    // don't add window because it can't be compared easily
                    if (this !== window) {
                        bound.push(this);
                        $.unique(bound);
                    }
                    // returns false if the window
                    return this !== window;
                },
                teardown: function() {
                    // we shouldn't have to sort
                    bound = bound.not(this);
                    // returns false if the window
                    return this !== window;
                },
                add: function(handleObj) {
                    var origHandler = handleObj.handler;
                    handleObj.origHandler = origHandler;

                    handleObj.handler = function(ev, data) {
                        var isWindow = this === window;
                        if (attributes && attributes.handler) {
                            var result = attributes.handler.apply(this, arguments);
                            if (result === true) {
                                return;
                            }
                        }

                        // if this is the first handler for this event ...
                        if (count === 0) {
                            // prevent others from doing what we are about to do
                            count++;
                            var where = data === false ? ev.target : this

                            // trigger all this element's handlers
                            dispatch.call(where, ev, data);
                            if (ev.isPropagationStopped()) {
                                count--;
                                return;
                            }

                            // get all other elements within this element that listen to move
                            // and trigger their resize events
                            var index = bound.index(this),
                                length = bound.length,
                                child, sub;

                            // if index == -1 it's the window
                            while (++index < length && (child = bound[index]) && (isWindow || $.contains(where, child))) {

                                // call the event
                                dispatch.call(child, ev, data);

                                if (ev.isPropagationStopped()) {
                                    // move index until the item is not in the current child
                                    while (++index < length && (sub = bound[index])) {
                                        if (!$.contains(child, sub)) {
                                            // set index back one
                                            index--;
                                            break
                                        }
                                    }
                                }
                            }

                            // prevent others from responding
                            ev.stopImmediatePropagation();
                            count--;
                        } else {
                            handleObj.origHandler.call(this, ev, data);
                        }
                    }
                }
            };

            // automatically bind on these
            $([document, window]).bind(name, function() {});

            return $.event.special[name];
        }

        return $;
    })($);

    // ## jquerypp/event/drag/core/core.js
    var __m3 = (function($) {

        if (!$.event.special.move) {
            $.event.reverse('move');
        }

        //modify live
        //steal the live handler ....
        var bind = function(object, method) {
            var args = Array.prototype.slice.call(arguments, 2);
            return function() {
                var args2 = [this].concat(args, $.makeArray(arguments));
                return method.apply(object, args2);
            };
        },
            event = $.event,
            // function to clear the window selection if there is one
            clearSelection = window.getSelection ? function() {
                window.getSelection().removeAllRanges()
            } : function() {},

            supportTouch = "ontouchend" in document,
            // Use touch events or map it to mouse events
            startEvent = supportTouch ? "touchstart" : "mousedown",
            stopEvent = supportTouch ? "touchend" : "mouseup",
            moveEvent = supportTouch ? "touchmove" : "mousemove",
            // On touchmove events the default (scrolling) event has to be prevented
            preventTouchScroll = function(ev) {
                ev.preventDefault();
            };


        $.Drag = function() {};


        $.extend($.Drag, {
                lowerName: "drag",
                current: null,
                distance: 0,

                mousedown: function(ev, element) {
                    var isLeftButton = ev.button === 0 || ev.button == 1,
                        doEvent = isLeftButton || supportTouch;

                    if (!doEvent || this.current) {
                        return;
                    }

                    //create Drag
                    var drag = new $.Drag(),
                        delegate = ev.delegateTarget || element,
                        selector = ev.handleObj.selector,
                        self = this;
                    this.current = drag;

                    drag.setup({
                            element: element,
                            delegate: ev.delegateTarget || element,
                            selector: ev.handleObj.selector,
                            moved: false,
                            _distance: this.distance,
                            callbacks: {
                                dragdown: event.find(delegate, ["dragdown"], selector),
                                draginit: event.find(delegate, ["draginit"], selector),
                                dragover: event.find(delegate, ["dragover"], selector),
                                dragmove: event.find(delegate, ["dragmove"], selector),
                                dragout: event.find(delegate, ["dragout"], selector),
                                dragend: event.find(delegate, ["dragend"], selector),
                                dragcleanup: event.find(delegate, ["dragcleanup"], selector)
                            },
                            destroyed: function() {
                                self.current = null;
                            }
                        }, ev);
                }
            });


        $.extend($.Drag.prototype, {
                setup: function(options, ev) {
                    $.extend(this, options);

                    this.element = $(this.element);
                    this.event = ev;
                    this.moved = false;
                    this.allowOtherDrags = false;
                    var mousemove = bind(this, this.mousemove),
                        mouseup = bind(this, this.mouseup);
                    this._mousemove = mousemove;
                    this._mouseup = mouseup;
                    this._distance = options.distance ? options.distance : 0;

                    //where the mouse is located
                    this.mouseStartPosition = ev.vector();

                    $(document).bind(moveEvent, mousemove);
                    $(document).bind(stopEvent, mouseup);
                    if (supportTouch) {
                        // On touch devices we want to disable scrolling
                        $(document).bind(moveEvent, preventTouchScroll);
                    }

                    if (!this.callEvents('down', this.element, ev)) {
                        this.noSelection(this.delegate);
                        //this is for firefox
                        clearSelection();
                    }
                },



                destroy: function() {
                    // Unbind the mouse handlers attached for dragging
                    $(document).unbind(moveEvent, this._mousemove);
                    $(document).unbind(stopEvent, this._mouseup);
                    if (supportTouch) {
                        // Enable scrolling again for touch devices when the drag is done
                        $(document).unbind(moveEvent, preventTouchScroll);
                    }

                    if (!this.moved) {
                        this.event = this.element = null;
                    }

                    if (!supportTouch) {
                        this.selection(this.delegate);
                    }
                    this.destroyed();
                },
                mousemove: function(docEl, ev) {
                    if (!this.moved) {
                        var dist = Math.sqrt(Math.pow(ev.pageX - this.event.pageX, 2) + Math.pow(ev.pageY - this.event.pageY, 2));
                        // Don't initialize the drag if it hasn't been moved the minimum distance
                        if (dist < this._distance) {
                            return false;
                        }
                        // Otherwise call init and indicate that the drag has moved
                        this.init(this.element, ev);
                        this.moved = true;
                    }

                    this.element.trigger('move', this);
                    var pointer = ev.vector();
                    if (this._start_position && this._start_position.equals(pointer)) {
                        return;
                    }
                    this.draw(pointer, ev);
                },

                mouseup: function(docEl, event) {
                    //if there is a current, we should call its dragstop
                    if (this.moved) {
                        this.end(event);
                    }
                    this.destroy();
                },


                noSelection: function(elm) {
                    elm = elm || this.delegate
                    document.documentElement.onselectstart = function() {
                        // Disables selection
                        return false;
                    };
                    document.documentElement.unselectable = "on";
                    this.selectionDisabled = (this.selectionDisabled ? this.selectionDisabled.add(elm) : $(elm));
                    this.selectionDisabled.css('-moz-user-select', '-moz-none');
                },


                selection: function() {
                    if (this.selectionDisabled) {
                        document.documentElement.onselectstart = function() {};
                        document.documentElement.unselectable = "off";
                        this.selectionDisabled.css('-moz-user-select', '');
                    }
                },

                init: function(element, event) {
                    element = $(element);
                    //the element that has been clicked on
                    var startElement = (this.movingElement = (this.element = $(element)));
                    //if a mousemove has come after the click
                    //if the drag has been cancelled
                    this._cancelled = false;
                    this.event = event;


                    this.mouseElementPosition = this.mouseStartPosition.minus(this.element.offsetv()); //where the mouse is on the Element
                    this.callEvents('init', element, event);

                    // Check what they have set and respond accordingly if they canceled
                    if (this._cancelled === true) {
                        return;
                    }
                    // if they set something else as the element
                    this.startPosition = startElement != this.movingElement ? this.movingElement.offsetv() : this.currentDelta();

                    this.makePositioned(this.movingElement);
                    // Adjust the drag elements z-index to a high value
                    this.oldZIndex = this.movingElement.css('zIndex');
                    this.movingElement.css('zIndex', 1000);
                    if (!this._only && this.constructor.responder) {
                        // calls $.Drop.prototype.compile if there is a drop element
                        this.constructor.responder.compile(event, this);
                    }
                },
                makePositioned: function(that) {
                    var style, pos = that.css('position');

                    // Position properly, set top and left to 0px for Opera
                    if (!pos || pos == 'static') {
                        style = {
                            position: 'relative'
                        };

                        if (window.opera) {
                            style.top = '0px';
                            style.left = '0px';
                        }
                        that.css(style);
                    }
                },
                callEvents: function(type, element, event, drop) {
                    var i, cbs = this.callbacks[this.constructor.lowerName + type];
                    for (i = 0; i < cbs.length; i++) {
                        cbs[i].call(element, event, this, drop);
                    }
                    return cbs.length;
                },

                currentDelta: function() {
                    return new $.Vector(parseInt(this.movingElement.css('left'), 10) || 0, parseInt(this.movingElement.css('top'), 10) || 0);
                },
                //draws the position of the dragmove object
                draw: function(pointer, event) {
                    // only drag if we haven't been cancelled;
                    if (this._cancelled) {
                        return;
                    }
                    clearSelection();

                    // the offset between the mouse pointer and the representative that the user asked for
                    this.location = pointer.minus(this.mouseElementPosition);

                    // call move events
                    this.move(event);
                    if (this._cancelled) {
                        return;
                    }
                    if (!event.isDefaultPrevented()) {
                        this.position(this.location);
                    }

                    // fill in
                    if (!this._only && this.constructor.responder) {
                        this.constructor.responder.show(pointer, this, event);
                    }
                },

                position: function(newOffsetv) { //should draw it on the page
                    var style, dragged_element_css_offset = this.currentDelta(),
                        //  the drag element's current left + top css attributes
                        // the vector between the movingElement's page and css positions
                        // this can be thought of as the original offset
                        dragged_element_position_vector = this.movingElement.offsetv().minus(dragged_element_css_offset);
                    this.required_css_position = newOffsetv.minus(dragged_element_position_vector);

                    this.offsetv = newOffsetv;
                    style = this.movingElement[0].style;
                    if (!this._cancelled && !this._horizontal) {
                        style.top = this.required_css_position.top() + "px";
                    }
                    if (!this._cancelled && !this._vertical) {
                        style.left = this.required_css_position.left() + "px";
                    }
                },
                move: function(event) {
                    this.callEvents('move', this.element, event);
                },
                over: function(event, drop) {
                    this.callEvents('over', this.element, event, drop);
                },
                out: function(event, drop) {
                    this.callEvents('out', this.element, event, drop);
                },

                end: function(event) {
                    // If canceled do nothing
                    if (this._cancelled) {
                        return;
                    }
                    // notify the responder - usually a $.Drop instance
                    if (!this._only && this.constructor.responder) {
                        this.constructor.responder.end(event, this);
                    }

                    this.callEvents('end', this.element, event);

                    if (this._revert) {
                        var self = this;
                        // animate moving back to original position
                        this.movingElement.animate({
                                top: this.startPosition.top() + "px",
                                left: this.startPosition.left() + "px"
                            }, function() {
                                self.cleanup.apply(self, arguments);
                            });
                    } else {
                        this.cleanup(event);
                    }
                    this.event = null;
                },

                cleanup: function(event) {
                    this.movingElement.css({
                            zIndex: this.oldZIndex
                        });
                    if (this.movingElement[0] !== this.element[0] && !this.movingElement.has(this.element[0]).length && !this.element.has(this.movingElement[0]).length) {
                        this.movingElement.css({
                                display: 'none'
                            });
                    }
                    if (this._removeMovingElement) {
                        // Remove the element when using drag.ghost()
                        this.movingElement.remove();
                    }

                    if (event) {
                        this.callEvents('cleanup', this.element, event);
                    }

                    this.movingElement = this.element = this.event = null;
                },

                cancel: function() {
                    this._cancelled = true;
                    if (!this._only && this.constructor.responder) {
                        // clear the drops
                        this.constructor.responder.clear(this.event.vector(), this, this.event);
                    }
                    this.destroy();

                },

                ghost: function(parent) {
                    // create a ghost by cloning the source element and attach the clone to the dom after the source element
                    var ghost = this.movingElement.clone().css('position', 'absolute');
                    if (parent) {
                        $(parent).append(ghost);
                    } else {
                        $(this.movingElement).after(ghost)
                    }
                    ghost.width(this.movingElement.width()).height(this.movingElement.height());
                    // put the ghost in the right location ...
                    ghost.offset(this.movingElement.offset())

                    // store the original element and make the ghost the dragged element
                    this.movingElement = ghost;
                    this.noSelection(ghost)
                    this._removeMovingElement = true;
                    return ghost;
                },

                representative: function(element, offsetX, offsetY) {
                    this._offsetX = offsetX || 0;
                    this._offsetY = offsetY || 0;

                    var p = this.mouseStartPosition;
                    // Just set the representative as the drag element
                    this.movingElement = $(element);
                    this.movingElement.css({
                            top: (p.y() - this._offsetY) + "px",
                            left: (p.x() - this._offsetX) + "px",
                            display: 'block',
                            position: 'absolute'
                        }).show();
                    this.noSelection(this.movingElement)
                    this.mouseElementPosition = new $.Vector(this._offsetX, this._offsetY);
                    return this;
                },

                revert: function(val) {
                    this._revert = val === undefined ? true : val;
                    return this;
                },

                vertical: function() {
                    this._vertical = true;
                    return this;
                },

                horizontal: function() {
                    this._horizontal = true;
                    return this;
                },

                only: function(only) {
                    return (this._only = (only === undefined ? true : only));
                },


                distance: function(val) {
                    if (val !== undefined) {
                        this._distance = val;
                        return this;
                    } else {
                        return this._distance
                    }
                }
            });

        event.setupHelper([

                'dragdown',

                'draginit',

                'dragover',

                'dragmove',

                'dragout',

                'dragend',

                'dragcleanup'
            ], startEvent, function(e) {
                $.Drag.mousedown.call($.Drag, e, this);
            });

        return $;
    })($, __m4, __m5, __m6);

    // ## jquerypp/dom/styles/styles.js
    var __m8 = (function($) {
        var getComputedStyle = document.defaultView && document.defaultView.getComputedStyle,
            // The following variables are used to convert camelcased attribute names
            // into dashed names, e.g. borderWidth to border-width
            rupper = /([A-Z])/g,
            rdashAlpha = /-([a-z])/ig,
            fcamelCase = function(all, letter) {
                return letter.toUpperCase();
            },
            // Returns the computed style for an elementn
            getStyle = function(elem) {
                if (getComputedStyle) {
                    return getComputedStyle(elem, null);
                } else if (elem.currentStyle) {
                    return elem.currentStyle;
                }
            },
            // Checks for float px and numeric values
            rfloat = /float/i,
            rnumpx = /^-?\d+(?:px)?$/i,
            rnum = /^-?\d/;

        // Returns a list of styles for a given element
        $.styles = function(el, styles) {
            if (!el) {
                return null;
            }
            var currentS = getStyle(el),
                oldName, val, style = el.style,
                results = {},
                i = 0,
                left, rsLeft, camelCase, name;

            // Go through each style
            for (; i < styles.length; i++) {
                name = styles[i];
                oldName = name.replace(rdashAlpha, fcamelCase);

                if (rfloat.test(name)) {
                    name = $.support.cssFloat ? "float" : "styleFloat";
                    oldName = "cssFloat";
                }

                // If we have getComputedStyle available
                if (getComputedStyle) {
                    // convert camelcased property names to dashed name
                    name = name.replace(rupper, "-$1").toLowerCase();
                    // use getPropertyValue of the current style object
                    val = currentS.getPropertyValue(name);
                    // default opacity is 1
                    if (name === "opacity" && val === "") {
                        val = "1";
                    }
                    results[oldName] = val;
                } else {
                    // Without getComputedStyles
                    camelCase = name.replace(rdashAlpha, fcamelCase);
                    results[oldName] = currentS[name] || currentS[camelCase];

                    // convert to px
                    if (!rnumpx.test(results[oldName]) && rnum.test(results[oldName])) {
                        // Remember the original values
                        left = style.left;
                        rsLeft = el.runtimeStyle.left;

                        // Put in the new values to get a computed value out
                        el.runtimeStyle.left = el.currentStyle.left;
                        style.left = camelCase === "fontSize" ? "1em" : (results[oldName] || 0);
                        results[oldName] = style.pixelLeft + "px";

                        // Revert the changed values
                        style.left = left;
                        el.runtimeStyle.left = rsLeft;
                    }

                }
            }

            return results;
        };


        $.fn.styles = function() {
            // Pass the arguments as an array to $.styles
            return $.styles(this[0], $.makeArray(arguments));
        };

        return $;
    })($);

    // ## jquerypp/event/drag/step/step.js
    var __m7 = (function($) {
        var round = function(x, m) {
            return Math.round(x / m) * m;
        }

        $.Drag.prototype.

        step = function(amount, container, center) {
            //on draws ... make sure this happens
            if (typeof amount == 'number') {
                amount = {
                    x: amount,
                    y: amount
                }
            }
            container = container || $(document.body);
            this._step = amount;

            var styles = container.styles("borderTopWidth", "paddingTop", "borderLeftWidth", "paddingLeft");
            var top = parseInt(styles.borderTopWidth) + parseInt(styles.paddingTop),
                left = parseInt(styles.borderLeftWidth) + parseInt(styles.paddingLeft);

            this._step.offset = container.offsetv().plus(left, top);
            this._step.center = center;
            return this;
        };

        (function() {
            var oldPosition = $.Drag.prototype.position;
            $.Drag.prototype.position = function(offsetPositionv) {
                //adjust required_css_position accordingly
                if (this._step) {
                    var step = this._step,
                        center = step.center && step.center.toLowerCase(),
                        movingSize = this.movingElement.dimensionsv('outer'),
                        lot = step.offset.top() - (center && center != 'x' ? movingSize.height() / 2 : 0),
                        lof = step.offset.left() - (center && center != 'y' ? movingSize.width() / 2 : 0);

                    if (this._step.x) {
                        offsetPositionv.left(Math.round(lof + round(offsetPositionv.left() - lof, this._step.x)))
                    }
                    if (this._step.y) {
                        offsetPositionv.top(Math.round(lot + round(offsetPositionv.top() - lot, this._step.y)))
                    }
                }

                oldPosition.call(this, offsetPositionv)
            }
        })();

        return $;
    })($, __m3, __m8);

    // ## jquerypp/event/drag/limit/limit.js
    var __m9 = (function($) {

        $.Drag.prototype

        .limit = function(container, center) {
            //on draws ... make sure this happens
            var styles = container.styles('borderTopWidth', 'paddingTop', 'borderLeftWidth', 'paddingLeft'),
                paddingBorder = new $.Vector(
                    parseInt(styles.borderLeftWidth, 10) + parseInt(styles.paddingLeft, 10) || 0, parseInt(styles.borderTopWidth, 10) + parseInt(styles.paddingTop, 10) || 0);

            this._limit = {
                offset: container.offsetv().plus(paddingBorder),
                size: container.dimensionsv(),
                center: center === true ? 'both' : center
            };
            return this;
        };

        var oldPosition = $.Drag.prototype.position;
        $.Drag.prototype.position = function(offsetPositionv) {
            //adjust required_css_position accordingly
            if (this._limit) {
                var limit = this._limit,
                    center = limit.center && limit.center.toLowerCase(),
                    movingSize = this.movingElement.dimensionsv('outer'),
                    halfHeight = center && center != 'x' ? movingSize.height() / 2 : 0,
                    halfWidth = center && center != 'y' ? movingSize.width() / 2 : 0,
                    lot = limit.offset.top(),
                    lof = limit.offset.left(),
                    height = limit.size.height(),
                    width = limit.size.width();

                //check if we are out of bounds ...
                //above
                if (offsetPositionv.top() + halfHeight < lot) {
                    offsetPositionv.top(lot - halfHeight);
                }
                //below
                if (offsetPositionv.top() + movingSize.height() - halfHeight > lot + height) {
                    offsetPositionv.top(lot + height - movingSize.height() + halfHeight);
                }
                //left
                if (offsetPositionv.left() + halfWidth < lof) {
                    offsetPositionv.left(lof - halfWidth);
                }
                //right
                if (offsetPositionv.left() + movingSize.width() - halfWidth > lof + width) {
                    offsetPositionv.left(lof + width - movingSize.left() + halfWidth);
                }
            }

            oldPosition.call(this, offsetPositionv);
        };

        return $;
    })($, __m3, __m8);

    // ## jquerypp/dom/within/within.js
    var __m12 = (function($) {
        // Checks if x and y coordinates are within a box with left, top, width and height
        var withinBox = function(x, y, left, top, width, height) {
            return (y >= top &&
                y < top + height &&
                x >= left &&
                x < left + width);
        }

        $.fn.within = function(left, top, useOffsetCache) {
            var ret = []
            this.each(function() {
                var q = jQuery(this);

                if (this == document.documentElement) {
                    return ret.push(this);
                }

                // uses either the cached offset or .offset()
                var offset = useOffsetCache ?
                    $.data(this, "offsetCache") || $.data(this, "offsetCache", q.offset()) :
                    q.offset();

                // Check if the given coordinates are within the area of the current element
                var res = withinBox(left, top, offset.left, offset.top,
                    this.offsetWidth, this.offsetHeight);

                if (res) {
                    // Add it to the results
                    ret.push(this);
                }
            });

            return this.pushStack($.unique(ret), "within", left + "," + top);
        }

        $.fn.withinBox = function(left, top, width, height, useOffsetCache) {
            var ret = []
            this.each(function() {
                var q = jQuery(this);

                if (this == document.documentElement) return ret.push(this);

                // use cached offset or .offset()
                var offset = useOffsetCache ?
                    $.data(this, "offset") ||
                    $.data(this, "offset", q.offset()) :
                    q.offset();

                var ew = q.width(),
                    eh = q.height(),
                    // Checks if the element offset is within the given box
                    res = !((offset.top > top + height) || (offset.top + eh < top) || (offset.left > left + width) || (offset.left + ew < left));

                if (res)
                    ret.push(this);
            });
            return this.pushStack($.unique(ret), "withinBox", $.makeArray(arguments).join(","));
        }

        return $;
    })($);

    // ## jquerypp/dom/compare/compare.js
    var __m13 = (function($) {

        // See http://ejohn.org/blog/comparing-document-position/
        $.fn.compare = function(element) { //usually
            try {
                // Firefox 3 throws an error with XUL - we can't use compare then
                element = element.jquery ? element[0] : element;
            } catch (e) {
                return null;
            }

            // make sure we aren't coming from XUL element
            if (window.HTMLElement) {
                var s = HTMLElement.prototype.toString.call(element)
                if (s == '[xpconnect wrapped native prototype]' || s == '[object XULElement]' || s === '[object Window]') {
                    return null;
                }
            }

            if (this[0].compareDocumentPosition) {
                // For browsers that support it, use compareDocumentPosition
                // https://developer.mozilla.org/en/DOM/Node.compareDocumentPosition
                return this[0].compareDocumentPosition(element);
            }

            // this[0] contains element
            if (this[0] == document && element != document) return 8;

            var number =
            // this[0] contains element
            (this[0] !== element && this[0].contains(element) && 16) +
            // element contains this[0]
            (this[0] != element && element.contains(this[0]) && 8),
                docEl = document.documentElement;

            // Use the sourceIndex
            if (this[0].sourceIndex) {
                // this[0] precedes element
                number += (this[0].sourceIndex < element.sourceIndex && 4)
                // element precedes foo[0]
                number += (this[0].sourceIndex > element.sourceIndex && 2)
                // The nodes are in different documents
                number += (this[0].ownerDocument !== element.ownerDocument ||
                    (this[0] != docEl && this[0].sourceIndex <= 0) ||
                    (element != docEl && element.sourceIndex <= 0)) && 1
            }

            return number;
        }

        return $;
    })($);

    // ## jquerypp/event/drop/drop.js
    var __m11 = (function($) {
        var event = $.event;

        var eventNames = [

            "dropover",

            "dropon",

            "dropout",

            "dropinit",

            "dropmove",

            "dropend"
        ];


        $.Drop = function(callbacks, element) {
            $.extend(this, callbacks);
            this.element = $(element);
        }
        // add the elements ...
        $.each(eventNames, function() {
            event.special[this] = {
                add: function(handleObj) {
                    //add this element to the compiles list
                    var el = $(this),
                        current = (el.data("dropEventCount") || 0);
                    el.data("dropEventCount", current + 1)
                    if (current == 0) {
                        $.Drop.addElement(this);
                    }
                },
                remove: function() {
                    var el = $(this),
                        current = (el.data("dropEventCount") || 0);
                    el.data("dropEventCount", current - 1)
                    if (current <= 1) {
                        $.Drop.removeElement(this);
                    }
                }
            }
        });

        $.extend($.Drop, {

                lowerName: "drop",
                _rootElements: [], //elements that are listening for drops
                _elements: $(), //elements that can be dropped on
                last_active: [],
                endName: "dropon",
                // adds an element as a 'root' element
                // this element might have events that we need to respond to
                addElement: function(el) {
                    // check other elements
                    for (var i = 0; i < this._rootElements.length; i++) {
                        if (el == this._rootElements[i]) return;
                    }
                    this._rootElements.push(el);
                },
                removeElement: function(el) {
                    for (var i = 0; i < this._rootElements.length; i++) {
                        if (el == this._rootElements[i]) {
                            this._rootElements.splice(i, 1)
                            return;
                        }
                    }
                },

                sortByDeepestChild: function(a, b) {
                    // Use jQuery.compare to compare two elements
                    var compare = a.element.compare(b.element);
                    if (compare & 16 || compare & 4) return 1;
                    if (compare & 8 || compare & 2) return -1;
                    return 0;
                },

                isAffected: function(point, moveable, responder) {
                    return ((responder.element != moveable.element) && (responder.element.within(point[0], point[1], responder._cache).length == 1));
                },

                deactivate: function(responder, mover, event) {
                    mover.out(event, responder)
                    responder.callHandlers(this.lowerName + 'out', responder.element[0], event, mover)
                },

                activate: function(responder, mover, event) { //this is where we should call over
                    mover.over(event, responder)
                    responder.callHandlers(this.lowerName + 'over', responder.element[0], event, mover);
                },
                move: function(responder, mover, event) {
                    responder.callHandlers(this.lowerName + 'move', responder.element[0], event, mover)
                },

                compile: function(event, drag) {
                    // if we called compile w/o a current drag
                    if (!this.dragging && !drag) {
                        return;
                    } else if (!this.dragging) {
                        this.dragging = drag;
                        this.last_active = [];
                    }
                    var el,
                        drops,
                        selector,
                        dropResponders,
                        newEls = [],
                        dragging = this.dragging;

                    // go to each root element and look for drop elements
                    for (var i = 0; i < this._rootElements.length; i++) { //for each element
                        el = this._rootElements[i]

                        // gets something like {"": ["dropinit"], ".foo" : ["dropover","dropmove"] }
                        var drops = $.event.findBySelector(el, eventNames)

                        // get drop elements by selector
                        for (selector in drops) {
                            dropResponders = selector ? jQuery(selector, el) : [el];

                            // for each drop element
                            for (var e = 0; e < dropResponders.length; e++) {

                                // add the callbacks to the element's Data
                                // there already might be data, so we merge it
                                if (this.addCallbacks(dropResponders[e], drops[selector], dragging)) {
                                    newEls.push(dropResponders[e])
                                };
                            }
                        }
                    }
                    // once all callbacks are added, call init on everything ...
                    this.add(newEls, event, dragging)
                },

                // adds the drag callbacks object to the element or merges other callbacks ...
                // returns true or false if the element is new ...
                // onlyNew lets only new elements add themselves
                addCallbacks: function(el, callbacks, onlyNew) {
                    var origData = $.data(el, "_dropData");
                    if (!origData) {
                        $.data(el, "_dropData", new $.Drop(callbacks, el));
                        return true;
                    } else if (!onlyNew) {
                        var origCbs = origData;
                        // merge data
                        for (var eventName in callbacks) {
                            origCbs[eventName] = origCbs[eventName] ?
                                origCbs[eventName].concat(callbacks[eventName]) :
                                callbacks[eventName];
                        }
                        return false;
                    }
                },
                // calls init on each element's drags. 
                // if its cancelled it's removed
                // adds to the current elements ...
                add: function(newEls, event, drag, dragging) {
                    var i = 0,
                        drop;

                    while (i < newEls.length) {
                        drop = $.data(newEls[i], "_dropData");
                        drop.callHandlers(this.lowerName + 'init', newEls[i], event, drag)
                        if (drop._canceled) {
                            newEls.splice(i, 1)
                        } else {
                            i++;
                        }
                    }
                    this._elements.push.apply(this._elements, newEls)
                },
                show: function(point, moveable, event) {
                    var element = moveable.element;
                    if (!this._elements.length) return;

                    var respondable,
                        affected = [],
                        propagate = true,
                        i = 0,
                        j,
                        la,
                        toBeActivated,
                        aff,
                        oldLastActive = this.last_active,
                        responders = [],
                        self = this,
                        drag;

                    // what's still affected ... we can also move element out here
                    while (i < this._elements.length) {
                        drag = $.data(this._elements[i], "_dropData");

                        if (!drag) {
                            this._elements.splice(i, 1)
                        } else {
                            i++;
                            if (self.isAffected(point, moveable, drag)) {
                                affected.push(drag);
                            }
                        }
                    }

                    // we should only trigger on lowest children
                    affected.sort(this.sortByDeepestChild);
                    event.stopRespondPropagate = function() {
                        propagate = false;
                    }

                    toBeActivated = affected.slice();

                    // all these will be active
                    this.last_active = affected;

                    // deactivate everything in last_active that isn't active
                    for (j = 0; j < oldLastActive.length; j++) {
                        la = oldLastActive[j];
                        i = 0;
                        while ((aff = toBeActivated[i])) {
                            if (la == aff) {
                                toBeActivated.splice(i, 1);
                                break;
                            } else {
                                i++;
                            }
                        }
                        if (!aff) {
                            this.deactivate(la, moveable, event);
                        }
                        if (!propagate) return;
                    }
                    for (var i = 0; i < toBeActivated.length; i++) {
                        this.activate(toBeActivated[i], moveable, event);
                        if (!propagate) return;
                    }

                    // activate everything in affected that isn't in last_active
                    for (i = 0; i < affected.length; i++) {
                        this.move(affected[i], moveable, event);

                        if (!propagate) return;
                    }
                },
                end: function(event, moveable) {
                    var la,
                        endName = this.lowerName + 'end',
                        onEvent = $.Event(this.endName, event),
                        dropData;

                    // call dropon
                    // go through the actives ... if you are over one, call dropped on it
                    for (var i = 0; i < this.last_active.length; i++) {
                        la = this.last_active[i]
                        if (this.isAffected(event.vector(), moveable, la) && la[this.endName]) {
                            la.callHandlers(this.endName, null, onEvent, moveable);
                        }

                        if (onEvent.isPropagationStopped()) {
                            break;
                        }
                    }
                    // call dropend
                    for (var r = 0; r < this._elements.length; r++) {
                        dropData = $.data(this._elements[r], "_dropData");
                        dropData && dropData.callHandlers(endName, null, event, moveable);
                    }

                    this.clear();
                },

                clear: function() {
                    this._elements.each(function() {
                        // remove temporary drop data
                        $.removeData(this, "_dropData")
                    })
                    this._elements = $();
                    delete this.dragging;
                }
            })
        $.Drag.responder = $.Drop;

        $.extend($.Drop.prototype, {

                callHandlers: function(method, el, ev, drag) {
                    var length = this[method] ? this[method].length : 0
                    for (var i = 0; i < length; i++) {
                        this[method][i].call(el || this.element[0], ev, this, drag)
                    }
                },

                cache: function(value) {
                    this._cache = value != null ? value : true;
                },

                cancel: function() {
                    this._canceled = true;
                }
            });

        return $;
    })($, __m3, __m12, __m13);

    // ## jquerypp/event/drag/scroll/scroll.js
    var __m10 = (function($) { //needs drop to determine if respondable

        $.Drag.prototype.

        scrolls = function(elements, options) {
            var elements = $(elements);

            for (var i = 0; i < elements.length; i++) {
                this.constructor.responder._elements.push(elements.eq(i).data("_dropData", new $.Scrollable(elements[i], options))[0])
            }
        },

        $.Scrollable = function(element, options) {
            this.element = jQuery(element);
            this.options = $.extend({
                    // when  we should start scrolling
                    distance: 30,
                    // how far we should move
                    delta: function(diff, distance) {
                        return (distance - diff) / 2;
                    },
                    direction: "xy"
                }, options);
            this.x = this.options.direction.indexOf("x") != -1;
            this.y = this.options.direction.indexOf("y") != -1;
        }
        $.extend($.Scrollable.prototype, {
                init: function(element) {
                    this.element = jQuery(element);
                },
                callHandlers: function(method, el, ev, drag) {
                    this[method](el || this.element[0], ev, this, drag)
                },
                dropover: function() {

                },
                dropon: function() {
                    this.clear_timeout();
                },
                dropout: function() {
                    this.clear_timeout();
                },
                dropinit: function() {

                },
                dropend: function() {},
                clear_timeout: function() {
                    if (this.interval) {
                        clearTimeout(this.interval)
                        this.interval = null;
                    }
                },
                distance: function(diff) {
                    return (30 - diff) / 2;
                },
                dropmove: function(el, ev, drop, drag) {

                    //if we were about to call a move, clear it.
                    this.clear_timeout();

                    //position of the mouse
                    var mouse = ev.vector(),

                        //get the object we are going to get the boundries of
                        location_object = $(el == document.documentElement ? window : el),

                        //get the dimension and location of that object
                        dimensions = location_object.dimensionsv('outer'),
                        position = location_object.offsetv(),

                        //how close our mouse is to the boundries
                        bottom = position.y() + dimensions.y() - mouse.y(),
                        top = mouse.y() - position.y(),
                        right = position.x() + dimensions.x() - mouse.x(),
                        left = mouse.x() - position.x(),

                        //how far we should scroll
                        dx = 0,
                        dy = 0,
                        distance = this.options.distance;

                    //check if we should scroll
                    if (bottom < distance && this.y) {
                        dy = this.options.delta(bottom, distance);
                    } else if (top < distance && this.y) {
                        dy = -this.options.delta(top, distance);
                    }

                    if (right < distance && this.options && this.x) {
                        dx = this.options.delta(right, distance);
                    } else if (left < distance && this.x) {
                        dx = -this.options.delta(left, distance);
                    }

                    //if we should scroll
                    if (dx || dy) {
                        //set a timeout that will create a mousemove on that object
                        var self = this;
                        this.interval = setTimeout(function() {
                            self.move($(el), drag.movingElement, dx, dy, ev, ev.clientX, ev.clientY, ev.screenX, ev.screenY)
                        }, 15)
                    }
                },

                move: function(scroll_element, drag_element, dx, dy, ev) {
                    scroll_element.scrollTop(scroll_element.scrollTop() + dy);
                    scroll_element.scrollLeft(scroll_element.scrollLeft() + dx);

                    drag_element.trigger(
                        $.event.fix({
                                type: "mousemove",
                                clientX: ev.clientX,
                                clientY: ev.clientY,
                                screenX: ev.screenX,
                                screenY: ev.screenY,
                                pageX: ev.pageX,
                                pageY: ev.pageY
                            }))
                    //drag_element.synthetic('mousemove',{clientX: x, clientY: y, screenX: sx, screenY: sy})
                }
            })

        return $;
    })($, __m11);

    // ## jquerypp/event/drag/drag.js
    var __m1 = (function($) {
        return $;
    })($, __m3, __m7, __m9, __m10);

    // ## jquerypp/event/resize/resize.js
    var __m14 = (function($) {
        var
        // bind on the window window resizes to happen
        win = $(window),
            windowWidth = 0,
            windowHeight = 0,
            timer;

        $(function() {
            windowWidth = win.width();
            windowHeight = win.height();
        });

        $.event.reverse('resize', {
                handler: function(ev, data) {
                    var isWindow = this === window;

                    // if we are the window and a real resize has happened
                    // then we check if the dimensions actually changed
                    // if they did, we will wait a brief timeout and
                    // trigger resize on the window
                    // this is for IE, to prevent window resize 'infinate' loop issues
                    if (isWindow && ev.originalEvent) {
                        var width = win.width(),
                            height = win.height();

                        if ((width != windowWidth || height != windowHeight)) {
                            //update the new dimensions
                            windowWidth = width;
                            windowHeight = height;
                            clearTimeout(timer)
                            timer = setTimeout(function() {
                                win.trigger("resize");
                            }, 1);

                        }
                        return true;
                    }
                }
            });

        return $;
    })(__m6);
})(jQuery);