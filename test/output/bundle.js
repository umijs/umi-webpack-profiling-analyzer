(window["somethingCompletelyDifferent"] = window["somethingCompletelyDifferent"] || []).push([["bundle"],{

/***/ "./src/a.js":
/*!******************!*\
  !*** ./src/a.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = 'module a';\n\n\n//# sourceURL=webpack:///./src/a.js?");

/***/ }),

/***/ "./src/b.js":
/*!******************!*\
  !*** ./src/b.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = 'module b';\n\n\n//# sourceURL=webpack:///./src/b.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("__webpack_require__(/*! ./a */ \"./src/a.js\");\n__webpack_require__(/*! ./b */ \"./src/b.js\");\n\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ })

},[["./src/index.js","manifest"]]]);