// 05 Context
DOT = function(obj, prop){
  if (obj === null)
    return undefined;
  if (obj.hasOwnProperty(prop))
    return obj[prop];
  return DOT(obj.__proto__, prop);
}

// 05 Context
DOTCALL = function(obj, prop, args){
  var propReturn = DOT(obj, prop);

  if (typeof propReturn === 'function')
    return propReturn.apply(obj, args);
  return propReturn;
}

// 06 Prototypes
NEW = function(constructor, args){
  var obj = {};
  obj.__proto__ = constructor.prototype;
  constructor.apply(obj, args);
  return obj;
}

INSTANCEOF = function(obj, constructor){
  if (obj === null)
    return false;
  if (obj.__proto__ === constructor.prototype)
    return true;
  return INSTANCEOF(obj.__proto__, constructor);
}
