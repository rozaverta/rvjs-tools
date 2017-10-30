
// tools

let IsBrowser = false, IsNodeJs = false;

try {
	IsBrowser = (new Function("try{return this===window}catch(e){return false}"))();
}
catch(e) {
	IsBrowser = typeof window !== "undefined" && window.setTimeout === setTimeout;
}

try {
	IsNodeJs = (new Function("try{return this===global}catch(e){return false}"))();
}
catch(e) {
	IsNodeJs = typeof global !== "undefined" && global.setTimeout === setTimeout;
}

if( !IsNodeJs ) {
	IsNodeJs = !! (typeof module !== 'undefined' && module.exports)
}

// html node

const ToString = Object.prototype.toString;
const isEvent = typeof Event !== 'undefined';

let tof = typeof Node;
let isNodeNative = tof === 'object', isNodeFunctionNative = false;

if( ! isNodeNative && tof === 'function' && typeof document !== "undefined" ) {
	isNodeNative = document.createElement("span") instanceof Node;
	isNodeFunctionNative = isNodeNative;
}

// polyfils

// array

if(!Array.isArray)
{
	Array.isArray = function(arg) {
		return ToString.call(arg) === '[object Array]';
	};
}

if (!Array.prototype.filter)
{
	Array.prototype.filter = function(fun/*, thisArg*/) {
		'use strict';

		if (this === void 0 || this === null) {
			throw new TypeError();
		}

		var t = Object(this);
		var len = t.length >>> 0;
		if (typeof fun !== 'function') {
			throw new TypeError();
		}

		var res = [];
		var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
		for (var i = 0; i < len; i++) {
			if (i in t) {
				var val = t[i];

				// ПРИМЕЧАНИЕ: Технически, здесь должен быть Object.defineProperty на
				//             следующий индекс, поскольку push может зависеть от
				//             свойств на Object.prototype и Array.prototype.
				//             Но этот метод новый и коллизии должны быть редкими,
				//             так что используем более совместимую альтернативу.
				if (fun.call(thisArg, val, i, t)) {
					res.push(val);
				}
			}
		}

		return res;
	};
}

// matches, closest

if(IsBrowser && window.Element)
{
	let proto = Element.prototype;

	if( !proto.matches )
	{
		proto.matches =
			proto.matchesSelector ||
			proto.mozMatchesSelector ||
			proto.msMatchesSelector ||
			proto.oMatchesSelector ||
			proto.webkitMatchesSelector ||
			function(selector) {
				var matches = (this.document || this.ownerDocument).querySelectorAll(selector), i = matches.length;
				while (--i >= 0 && matches.item(i) !== this) {}
				return i > -1;
			};
	}

	if( !proto.closest )
	{
		proto.closest =
			function(selector) {
				var node = this;
				while(node) {
					if (node.matches(selector)) return node;
					else node = node.parentElement;
				}
				return null;
			};
	}
}

// Object is Polyfill
// @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is

if( ! Object.is )
{
	Object.is = function(x, y) {
		// SameValue algorithm
		if (x === y) { // Steps 1-5, 7-10
			// Steps 6.b-6.e: +0 != -0
			return x !== 0 || 1 / x === 1 / y;
		}
		else {
			// Step 6.a: NaN == NaN
			return x !== x && y !== y;
		}
	};
}

// @see https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if( ! Object.assign )
{
	Object.defineProperty(Object, 'assign', {

		enumerable: false,
		configurable: true,
		writable: true,
		value: function(target, firstSource) {

			'use strict';
			if (target === undefined || target === null) {
				throw new TypeError('Cannot convert first argument to object');
			}

			var to = Object(target);
			for (var i = 1; i < arguments.length; i++) {
				var nextSource = arguments[i];
				if (nextSource === undefined || nextSource === null) {
					continue;
				}

				var keysArray = Object.keys(Object(nextSource));
				for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
					var nextKey = keysArray[nextIndex];
					var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
					if (desc !== undefined && desc.enumerable) {
						to[nextKey] = nextSource[nextKey];
					}
				}
			}

			return to;
		}
	});
}

if (!String.prototype.trim)
{
	// Вырезаем BOM и неразрывный пробел
	String.prototype.trim = function() {
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	};
}

if (!Array.prototype.map)
{
	Array.prototype.map = function(callback, thisArg) {

		var T, A, k;

		if (this == null) {
			throw new TypeError(' this is null or not defined');
		}

		// 1. Положим O равным результату вызова ToObject с передачей ему
		//    значения |this| в качестве аргумента.
		var O = Object(this);

		// 2. Положим lenValue равным результату вызова внутреннего метода Get
		//    объекта O с аргументом "length".
		// 3. Положим len равным ToUint32(lenValue).
		var len = O.length >>> 0;

		// 4. Если вызов IsCallable(callback) равен false, выкидываем исключение TypeError.
		// Смотрите (en): http://es5.github.com/#x9.11
		// Смотрите (ru): http://es5.javascript.ru/x9.html#x9.11
		if (typeof callback !== 'function') {
			throw new TypeError(callback + ' is not a function');
		}

		// 5. Если thisArg присутствует, положим T равным thisArg; иначе положим T равным undefined.
		if (arguments.length > 1) {
			T = thisArg;
		}

		// 6. Положим A равным новому масиву, как если бы он был создан выражением new Array(len),
		//    где Array является стандартным встроенным конструктором с этим именем,
		//    а len является значением len.
		A = new Array(len);

		// 7. Положим k равным 0
		k = 0;

		// 8. Пока k < len, будем повторять
		while (k < len) {

			var kValue, mappedValue;

			// a. Положим Pk равным ToString(k).
			//   Это неявное преобразование для левостороннего операнда в операторе in
			// b. Положим kPresent равным результату вызова внутреннего метода HasProperty
			//    объекта O с аргументом Pk.
			//   Этот шаг может быть объединён с шагом c
			// c. Если kPresent равен true, то
			if (k in O) {

				// i. Положим kValue равным результату вызова внутреннего метода Get
				//    объекта O с аргументом Pk.
				kValue = O[k];

				// ii. Положим mappedValue равным результату вызова внутреннего метода Call
				//     функции callback со значением T в качестве значения this и списком
				//     аргументов, содержащим kValue, k и O.
				mappedValue = callback.call(T, kValue, k, O);

				// iii. Вызовем внутренний метод DefineOwnProperty объекта A с аргументами
				// Pk, Описатель Свойства
				// { Value: mappedValue,
				//   Writable: true,
				//   Enumerable: true,
				//   Configurable: true }
				// и false.

				// В браузерах, поддерживающих Object.defineProperty, используем следующий код:
				// Object.defineProperty(A, k, {
				//   value: mappedValue,
				//   writable: true,
				//   enumerable: true,
				//   configurable: true
				// });

				// Для лучшей поддержки браузерами, используем следующий код:
				A[k] = mappedValue;
			}
			// d. Увеличим k на 1.
			k++;
		}

		// 9. Вернём A.
		return A;
	};
}

const Tools = {

	get isBrowser()
	{
		return IsBrowser
	},

	get isNode()
	{
		return IsNodeJs
	},

	/**
	 * @return {boolean}
	 */
	isNumber(value)
	{
		let tof = typeof value;

		if( tof != 'number' )
		{
			if( tof == 'string' )
			{
				value /= 1;
			}
			else {
				return false
			}
		}

		return ! isNaN(value) && isFinite(value)
	},

	/**
	 * @return {boolean}
	 */
	isScalar(value)
	{
		if( value === null || value === undefined)
		{
			return true
		}

		let type = typeof value;
		return type == 'string' || type == 'number' || type == 'boolean';
	},

	/**
	 * @return {boolean}
	 */
	isWindowElement(element)
	{
		if( ! IsBrowser )
		{
			return false
		}

		if( window === element )
		{
			return true
		}

		let type = ToString.call(element);
		if( type === "[object Window]" || type === "[object DOMWindow]" )
		{
			return true
		}

		if ('self' in element)
		{
			//`'self' in element` is true if
			//the property exists on the object _or_ the prototype
			//`element.hasOwnProperty('self')` is true only if
			//the property exists on the object
			let self, hasSelf = element.hasOwnProperty('self');

			try {
				if(hasSelf)
				{
					self = element.self;
				}
				delete element.self;
				if (hasSelf)
				{
					element.self = self;
				}
			}
			catch (e) {
				//IE 7&8 throw an error when window.self is deleted
				return true;
			}
		}

		return false
	},

	isHtmlNodeElement(object)
	{
		if(isNodeNative) {
			return object instanceof Node
		}
		else if(IsBrowser) {
			return object && typeof object === "object" && typeof object.nodeType === "number" && typeof object.nodeName === "string"
		}
		else {
			return false
		}
	},

	getType(object)
	{
		let type = typeof object;

		if( type == 'object' )
		{
			if( object === null ) {
				return 'null'
			}

			if( Array.isArray(object) ) return 'array';
			if( object instanceof Date ) return 'date';
			if( object instanceof RegExp ) return 'reg-exp';
			if( isEvent && object instanceof Event ) return 'event';
			if( ! isNodeFunctionNative && Tools.isHtmlNodeElement(object) ) return 'html-node';
			if( Tools.isWindowElement(object) ) return 'window';

			type = ToString.call(object);
			if( type === '[object HTMLCollection]' || type === '[object NodeList]' ) return 'html-collection';

			return 'object'
		}

		if( isNodeFunctionNative && type == 'function' && Tools.isHtmlNodeElement(object) )
		{
			return 'html-node';
		}

		if( type == 'number' )
		{
			if( isNaN(object) ) {
				return 'nan'
			}
			if( isFinite(object) ) {
				return 'infinity'
			}
		}

		return type;
	}
};

export default Tools;