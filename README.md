# rvjs-tolls

Tools for rvjs-* javascript libraries

```js
import Tools from "rvjs-tools";

if( Tools.isBrowser ) {
	console.log("Document body type: " + Tools.getType(document.body));
	// >> Document body type: html-node
}

```

## Tolls object

| Name | Type | Description |
|---|---|---|
| `isBrowser` | Boolean | Environment is user browser |
| `isNode` | Boolean | Environment is NodeJs server |
| `isNumber(object)` | Boolean | Object is number (including checks string) |
| `isScalar(object)` | Boolean | Object is number or string or boolean or null or undefined |
| `isWindowElement(object)` | Boolean | Object is window |
| `isHtmlNodeElement(object)` | Boolean | Object is html node element |
| `getType(object)` | String | Result values: function, object, string, boolean, number, undefined, symbol, null, array, date, reg-exp, event, html-node, window, html-collection, nan, infinity |
