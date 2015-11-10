(function() {
  $ = function(selector) {
    if (!(this instanceof $)) {
      return new $(selector);
    }
    var elements;
    if (typeof selector === "string") {
      elements = document.querySelectorAll(selector);
    } else if ($.isArray(selector)) {
      elements = selector;
    }
    [].push.apply(this, elements);
  };
  $.extend = function(target, object) {
    for (var prop in object) {
      if (object.hasOwnProperty(prop)) {
        target[prop] = object[prop];
      }
    }
    return target;
  };
  var isArrayLike = function(obj) {
    return obj && typeof obj === "object" && (obj.length === 0 || typeof obj.length === "number" && obj.length > 0 && obj.length - 1 in obj);
  };
  $.extend($, {
    isArray: function(obj) {
      return Object.prototype.toString.call(obj) === "[object Array]";
    },
    each: function(collection, cb) {
      if (isArrayLike(collection)) {
        for (var i = 0; i < collection.length; i++) {
          if (cb.call(this, i, collection[i]) === false) {
            break;
          }
        }
      } else {
        for (var prop in collection) {
          if (collection.hasOwnProperty(prop)) {
            if (cb.call(this, prop, collection[prop]) === false) {
              break;
            }
          }
        }
      }
      return collection;
    },
    makeArray: function(arr) {
      if ($.isArray(arr)) {
        return arr;
      }
      var array = [];
      $.each(arr, function(i, item) {
        array[i] = item;
      });
      return array;
    },
    proxy: function(fn, context) {
      return function() {
        return fn.apply(context, arguments);
      };
    },
    fn: $.prototype
  });
  var getText = function(childNodes) {
    var text = "";
    $.each(childNodes, function(i, child) {
      if (child.nodeType === 3) {
        text += child.nodeValue;
      } else {
        text += getText(child.childNodes);
      }
    });
    return text;
  };
  var makeTraverser = function(traverser) {
    return function() {
      var elements = [], args = arguments;
      $.each(this, function(i, element) {
        var els = traverser.apply(element, args);
        if (isArrayLike(els)) {
          elements.push.apply(elements, els);
        } else if (els) {
          elements.push(els);
        }
      });
      return $(elements);
    };
  };
  var moveWith = function(el, propertyName) {
    var cur = el[propertyName];
    while (cur && cur.nodeType != 1) {
      cur = cur[propertyName];
    }
    return cur;
  };
  $.extend($.prototype, {
    html: function(newHtml) {
      if(arguments.length) {
        return $.each(this, function(i, element) {
          element.innerHTML = newHtml;
        });
      } else {
        return this[0].innerHTML;
      }
    },
    val: function(newVal) {
      if(arguments.length) {
        return $.each(this, function(i, element) {
          element.value = newVal;
        });
      } else {
        return this[0].value;
      }
    },
    text: function(newText) {
      if (arguments.length) {
        this.html("");
        return $.each(this, function(i, element) {
          var textNode = document.createTextNode(newText);
          element.appendChild(textNode);
        });
      } else {
        return getText(this[0].childNodes);
      }
    },
    find: makeTraverser(function(selector) {
      return this.querySelectorAll(selector);
    }),
    children: makeTraverser(function() {
      return this.children;
    }),
    parent: makeTraverser(function() {
      return this.parentNode;
    }),
    next: makeTraverser(function() {
      return moveWith(this, "nextSibling");
    }),
    prev: makeTraverser(function() {
      return moveWith(this, "previousSibling");
    }),
    attr: function(attrName, value) {
      if (arguments.length == 2) {
        return $.each(this, function(i, element) {
          element.setAttribute(attrName, value);
        });
      } else {
        return this[0] && this[0].getAttribute(attrName);
      }
    },
    css: function(cssPropName, value) {
      if (arguments.length == 2) {
        return $.each(this, function(i, element) {
          element.style[cssPropName] = value;
        });
      } else {
        return this[0] && document.defaultView.getComputedStyle(this[0]).getPropertyValue(cssPropName);
      }
    },
    width: function() {
      var paddingLeft = parseInt(this.css("padding-left"), 10),
      paddingRight = parseInt(this.css("padding-right"), 10);
      return this[0].clientWidth - paddingLeft - paddingRight;
    },
    offset: function() {
      var offset = this[0].getBoundingClientRect();
      return {
        top: offset.top + window.pageYOffset,
        left: offset.left + window.pageXOffset
      };
    },
    hide: function() {
      return this.css("display", "none");
    },
    show: function() {
      return this.css("display", "");
    },
    bind: function(eventName, handler) {
      return $.each(this, function(i, element) {
        element.addEventListener(eventName, handler, false);
      });
    },
    unbind: function(eventName, handler) {
      return $.each(this, function(i, element) {
        element.removeEventListener(eventName, handler, false);
      });
    },
    has: function() {
      var div = document.createElement("div"), matches = div.matches || div.webkitMatchesSelector || div.mozMatchesSelector;
      return makeTraverser(function(selector) {
        if (matches.call(this, selector)) {
          return this;
        }
      });
    }(),
    on: function(eventType, selector, handler) {
      var delegator = function(ev) {
        var cur = ev.target;
        do {
          if ($([ cur ]).has(selector).length) {
            handler.call(cur, ev);
          }
          cur = cur.parentNode;
        } while (cur && cur !== ev.currentTarget);
      };
      return $.each(this, function(i, element) {
        var events = $([ element ]).data("events"), eventTypeEvents;
        if (!events) {
          $([ element ]).data("events", events = {});
        }
        if (!(eventTypeEvents = events[eventType])) {
          eventTypeEvents = events[eventType] = {};
        }
        if (!eventTypeEvents[selector]) {
          eventTypeEvents[selector] = [];
        }
        eventTypeEvents[selector].push({
          handler: handler,
          delegator: delegator
        });
        element.addEventListener(eventType, delegator, false);
      });
    },
    off: function(eventType, selector, handler) {
      return $.each(this, function(i, element) {
        var events = $([ element ]).data("events");
        if (events[eventType] && events[eventType][selector]) {
          var delegates = events[eventType][selector], i = 0;
          while (i < delegates.length) {
            if (delegates[i].handler === handler) {
              element.removeEventListener(eventType, delegates[i].delegator, false);
              delegates.splice(i, 1);
            } else {
              i++;
            }
          }
        }
      });
    },
    data: function(propName, data) {
      if (arguments.length == 2) {
        return $.each(this, function(i, el) {
          var id = el[expando];
          if (!id) {
            id = ids++;
            el[expando] = id;
            elementIdDataMap[id] = {};
          }
          elementIdDataMap[id][propName] = data;
        });
      } else {
        var el = this[0], id = el[expando];
        return id && elementIdDataMap[id][propName];
      }
    },
    addClass: function(className) {
      var classTest = new RegExp("(^| )" + className + "($| )");
      return $.each(this, function(i, element) {
        if (!classTest.test(element.className)) {
          element.className = element.className + " " + className;
        }
      });
    },
    removeClass: function(className) {
      var classTest = new RegExp("(^| )" + className + "($| )");
      return $.each(this, function(i, element) {
        element.className = element.className.replace(classTest, "");
      });
    },
    append: function(element) {
      this[0].appendChild($.buildFragment(element));
    }
  });
  var elementIdDataMap = {}, ids = 1, expando = "my$" + Math.random();
  $.buildFragment = function(html) {
    if (typeof html === "string") {
      var matchData = html.match(/<(\w+)/), firstTag = matchData ? matchData[1] : "div", parentNodes = {
        li: "ul",
        tr: "table"
      }, parentTag = parentNodes[firstTag] || "div", parentNode = document.createElement(parentTag), frag = document.createDocumentFragment();
      parentNode.innerHTML = html;
      $.each($.makeArray(parentNode.childNodes), function(i, node) {
        frag.appendChild(node);
      });
      return frag;
    } else {
      return html;
    }
  };
})();