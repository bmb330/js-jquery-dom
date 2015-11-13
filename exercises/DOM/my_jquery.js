(function() {
  $ = function(selector) {
    if (!(this instanceof $)) {
      return new $(selector);
    }

    var elements = document.querySelectorAll(selector);
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
    find: function(selector) {},
    next: function() {},
    prev: function() {},
    parent: function() {},
    children: function() {},
    attr: function(attrName, value) {},
    css: function(cssPropName, value) {},
    width: function() {},
    offset: function() {
      var offset = this[0].getBoundingClientRect();
      return {
        top: offset.top + window.pageYOffset,
        left: offset.left + window.pageXOffset
      };
    },
    hide: function() {},
    show: function() {},

    // Events
    bind: function(eventName, handler) {},
    unbind: function(eventName, handler) {},
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
    append: function(element) {}
  });

  $.buildFragment = function(html) {};
})();
