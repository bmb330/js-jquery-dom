(function() {
  $ = function(selector) {
    if (!(this instanceof $)) {
      return new $(selector);
    }

    var elements;

    if (typeof selector === 'string') {
      elements = document.querySelectorAll(selector)
    }
    else {
      elements = selector;
    }

    Array.prototype.push.apply(this, elements);
    this.length = elements.length;
  };

  $.extend = function(target, object) {
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        target[key] = object[key];
      }
    }
    return target;
  };

  // Static methods
  var isArrayLike = function(obj) {
    if (typeof obj.length === 'number')
      if (obj.length === 0 || (obj.length > 0 && obj.length - 1 in obj))
        return true;
    return false
  };

  $.extend($, {
    isArray: function(obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    },
    each: function(collection, cb) {
      if (isArrayLike(collection)) {
        for (var i = 0; i < collection.length; i++) {
          cb.call(collection[i], i, collection[i]);
        }
      }
      else {
        for (prop in collection) {
          if (collection.hasOwnProperty(prop)) {
            cb.call(collection[prop], prop, collection[prop]);
          }
        }
      }
      return collection;
    },
    makeArray: function(arr) {
      var new_arr = [];
      $.each(arr, function(index, val) {
        new_arr.push(val);
      });
      return new_arr;
    },
    proxy: function(fn, context) {
      return function() {
        return fn.apply(context, arguments);
      };
    }
  });

  var getText = function(el) {
    var txt = '';
    $.each(el.childNodes, function(i, childNode) {
      if (childNode.nodeType === Node.TEXT_NODE) {
        txt += childNode.nodeValue;
      }
      else if (childNode.nodeType === Node.ELEMENT_NODE) {
        txt += getText(childNode);
      }
    });
    return txt;
  };

  var makeTraverser = function(cb) {
    return function() {
      var elements = [];
      var args = arguments;

      $.each(this, function(i, el) {
        var ret = cb.apply(el, args);

        if (ret && isArrayLike(ret))
          Array.prototype.push.apply(elements, ret);
        else if (ret)
          elements.push(ret);
      });

      return $(elements);
    };
  };

  $.extend($.prototype, {
    html: function(newHtml) {
      if (arguments.length) {
        return $.each(this, function(i, el) {
          el.innerHTML = newHtml;
        });
      }
      else {
        return this[0].innerHTML;
      }
    },
    val: function(newVal) {
      if (arguments.length) {
        return $.each(this, function(i, el) {
          el.value = newVal;
        });
      }
      else {
        return this[0].value;
      }
    },
    text: function(newText) {
      if (arguments.length) {
        this.html('');
        return $.each(this, function(i, el) {
          el.appendChild(document.createTextNode(newText));
        });
      }
      else {
        return this[0] && getText(this[0]);
      }
    },
    find: function(selector) {
      var elements = [];
      $.each(this, function(i, el) {
        Array.prototype.push.apply(elements, el.querySelectorAll(selector));
      });
      return $(elements);
    },
    next: makeTraverser(function() {
      var curr = this.nextSibling;

      while (curr && curr.nodeType !== Node.ELEMENT_NODE) {
        curr = curr.nextSibling;
      }

      if (curr) {
        return curr;
      }
    }),
    prev: makeTraverser(function() {
      var curr = this.previousSibling;

      while (curr && curr.nodeType !== Node.ELEMENT_NODE) {
        curr = curr.previousSibling;
      }

      if (curr) {
        return curr;
      }
    }),
    parent: makeTraverser(function() {
      return this.parentNode;
    }),
    children: makeTraverser(function() {
      return this.children;
    }),
    attr: function(attrName, value) {
      if (arguments.length > 1) {
        return $.each(this,function(i, el) {
          el.setAttribute(attrName, value);
        });
      }
      else {
        return this[0] && this[0].getAttribute(attrName);
      }
    },
    css: function(cssPropName, value) {
      if (arguments.length > 1) {
        return $.each(this, function(i, el) {
          el.style[cssPropName] = value;
        });
      }
      else {
        return this[0] && document.defaultView.getComputedStyle(this[0]).getPropertyValue(cssPropName);
      }
    },
    width: function() {
      var leftPadding = this.css('padding-left');
      var rightPadding = this.css('padding-right');
      return this[0].clientWidth - parseInt(leftPadding) - parseInt(rightPadding);
    },
    offset: function() {
      var offset = this[0].getBoundingClientRect();
      return {
        top: offset.top + window.pageYOffset,
        left: offset.left + window.pageXOffset
      };
    },
    hide: function() {
      return this.css('display', 'none');
    },
    show: function() {
      return this.css('display', '');
    },

    // Events
    bind: function(eventName, handler) {
      return $.each(this, function(i, el) {
        el.addEventListener(eventName, handler, false);
      });
    },
    unbind: function(eventName, handler) {
      return $.each(this, function(i, el) {
        el.removeEventListener(eventName, handler, false);
      });
    },
    has: function(selector) {
      var elements = [];
	
      $.each(this, function(i, el) {
        if(el.matches(selector)) {
          elements.push(el);
        }
      });
    
      return $( elements );
    },
    on: function(eventType, selector, handler) {
      return this.bind(eventType, function(ev){
        var cur = ev.target;
        do {
          if ($([ cur ]).has(selector).length) {
            handler.call(cur, ev);
          }
          cur = cur.parentNode;
        } while (cur && cur !== ev.currentTarget);
      });
    },
    off: function(eventType, selector, handler) {},
    data: function(propName, data) {},

    // Extra
    addClass: function(className) {},
    removeClass: function(className) {},
    append: function(element) {},
  });

  $.fn = $.prototype

  $.buildFragment = function(html) {};
})();
