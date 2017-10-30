"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// tools

var IsBrowser = false,
    IsNodeJs = false;

try {
	IsBrowser = new Function("try{return this===window}catch(e){return false}")();
} catch (e) {
	IsBrowser = typeof window !== "undefined" && window.setTimeout === setTimeout;
}

try {
	IsNodeJs = new Function("try{return this===global}catch(e){return false}")();
} catch (e) {
	IsNodeJs = typeof global !== "undefined" && global.setTimeout === setTimeout;
}

if (!IsNodeJs) {
	IsNodeJs = !!(typeof module !== 'undefined' && module.exports);
}

// polyfils

// array

if (!Array.isArray) {
	Array.isArray = function (arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};
}

// matches, closest

if (IsBrowser && window.Element) {
	var proto = Element.prototype;

	if (!proto.matches) {
		proto.matches = proto.matchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector || proto.oMatchesSelector || proto.webkitMatchesSelector || function (selector) {
			var matches = (this.document || this.ownerDocument).querySelectorAll(selector),
			    i = matches.length;
			while (--i >= 0 && matches.item(i) !== this) {}
			return i > -1;
		};
	}

	if (!proto.closest) {
		proto.closest = function (selector) {
			var node = this;
			while (node) {
				if (node.matches(selector)) return node;else node = node.parentElement;
			}
			return null;
		};
	}
}

// Object is Polyfill
// @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is

if (!Object.is) {
	Object.is = function (x, y) {
		// SameValue algorithm
		if (x === y) {
			// Steps 1-5, 7-10
			// Steps 6.b-6.e: +0 != -0
			return x !== 0 || 1 / x === 1 / y;
		} else {
			// Step 6.a: NaN == NaN
			return x !== x && y !== y;
		}
	};
}

// @see https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if (!Object.assign) {
	Object.defineProperty(Object, 'assign', {

		enumerable: false,
		configurable: true,
		writable: true,
		value: function value(target, firstSource) {

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

if (!String.prototype.trim) {
	// Вырезаем BOM и неразрывный пробел
	String.prototype.trim = function () {
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	};
}

if (!Array.prototype.map) {
	Array.prototype.map = function (callback, thisArg) {

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

var Tools = {

	get isBrowser() {
		return IsBrowser;
	},

	get isNode() {
		return IsNodeJs;
	},

	/**
  * @return {boolean}
  */
	isNumber: function isNumber(value) {
		var tof = typeof value === "undefined" ? "undefined" : _typeof(value);

		if (tof != 'number') {
			if (tof == 'string') {
				value /= 1;
			} else {
				return false;
			}
		}

		return !isNaN(value) && isFinite(value);
	},


	/**
  * @return {boolean}
  */
	isScalar: function isScalar(value) {
		if (value === null || value === undefined) {
			return true;
		}

		var type = typeof value === "undefined" ? "undefined" : _typeof(value);
		return type == 'string' || type == 'number' || type == 'boolean';
	}
};

exports.default = Tools;