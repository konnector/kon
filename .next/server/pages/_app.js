/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./pages/_app.tsx":
/*!************************!*\
  !*** ./pages/_app.tsx ***!
  \************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _src_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../src/styles/globals.css */ \"./src/styles/globals.css\");\n/* harmony import */ var _src_styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_src_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var react_hot_toast__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-hot-toast */ \"react-hot-toast\");\n/* harmony import */ var _supabase_auth_helpers_nextjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @supabase/auth-helpers-nextjs */ \"@supabase/auth-helpers-nextjs\");\n/* harmony import */ var _supabase_auth_helpers_nextjs__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_supabase_auth_helpers_nextjs__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _supabase_auth_helpers_react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @supabase/auth-helpers-react */ \"@supabase/auth-helpers-react\");\n/* harmony import */ var _supabase_auth_helpers_react__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_supabase_auth_helpers_react__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_6__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([react_hot_toast__WEBPACK_IMPORTED_MODULE_2__]);\nreact_hot_toast__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\n\n\n\n\nfunction MyApp({ Component, pageProps }) {\n    const [supabaseClient] = (0,react__WEBPACK_IMPORTED_MODULE_6__.useState)(()=>(0,_supabase_auth_helpers_nextjs__WEBPACK_IMPORTED_MODULE_3__.createPagesBrowserClient)());\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_5__.useRouter)();\n    (0,react__WEBPACK_IMPORTED_MODULE_6__.useEffect)(()=>{\n        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session)=>{\n            // Only handle successful email verification events\n            if (event === \"SIGNED_IN\" && session?.user?.email_confirmed_at) {\n                // If verified but hasn't completed onboarding, go to onboarding\n                if (!session.user.user_metadata?.onboarding_completed) {\n                    router.push(\"/onboarding\");\n                } else {\n                    router.push(\"/dashboard\");\n                }\n            }\n        });\n        return ()=>{\n            subscription.unsubscribe();\n        };\n    }, [\n        router\n    ]);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_supabase_auth_helpers_react__WEBPACK_IMPORTED_MODULE_4__.SessionContextProvider, {\n        supabaseClient: supabaseClient,\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                ...pageProps\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\Asus\\\\Desktop\\\\Konnect App\\\\pages\\\\_app.tsx\",\n                lineNumber: 35,\n                columnNumber: 7\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_hot_toast__WEBPACK_IMPORTED_MODULE_2__.Toaster, {\n                position: \"top-center\"\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\Asus\\\\Desktop\\\\Konnect App\\\\pages\\\\_app.tsx\",\n                lineNumber: 36,\n                columnNumber: 7\n            }, this)\n        ]\n    }, void 0, true, {\n        fileName: \"C:\\\\Users\\\\Asus\\\\Desktop\\\\Konnect App\\\\pages\\\\_app.tsx\",\n        lineNumber: 34,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBa0M7QUFFTztBQUNnQztBQUNIO0FBQzlCO0FBQ0k7QUFFNUMsU0FBU00sTUFBTSxFQUFFQyxTQUFTLEVBQUVDLFNBQVMsRUFBWTtJQUMvQyxNQUFNLENBQUNDLGVBQWUsR0FBR0osK0NBQVFBLENBQUMsSUFBTUosdUZBQXdCQTtJQUNoRSxNQUFNUyxTQUFTUCxzREFBU0E7SUFFeEJDLGdEQUFTQSxDQUFDO1FBQ1IsTUFBTSxFQUFFTyxNQUFNLEVBQUVDLFlBQVksRUFBRSxFQUFFLEdBQUdILGVBQWVJLElBQUksQ0FBQ0MsaUJBQWlCLENBQUMsQ0FBQ0MsT0FBT0M7WUFDL0UsbURBQW1EO1lBQ25ELElBQUlELFVBQVUsZUFBZUMsU0FBU0MsTUFBTUMsb0JBQW9CO2dCQUM5RCxnRUFBZ0U7Z0JBQ2hFLElBQUksQ0FBQ0YsUUFBUUMsSUFBSSxDQUFDRSxhQUFhLEVBQUVDLHNCQUFzQjtvQkFDckRWLE9BQU9XLElBQUksQ0FBQztnQkFDZCxPQUVLO29CQUNIWCxPQUFPVyxJQUFJLENBQUM7Z0JBQ2Q7WUFDRjtRQUNGO1FBRUEsT0FBTztZQUNMVCxhQUFhVSxXQUFXO1FBQzFCO0lBQ0YsR0FBRztRQUFDWjtLQUFPO0lBRVgscUJBQ0UsOERBQUNSLGdGQUFzQkE7UUFBQ08sZ0JBQWdCQTs7MEJBQ3RDLDhEQUFDRjtnQkFBVyxHQUFHQyxTQUFTOzs7Ozs7MEJBQ3hCLDhEQUFDUixvREFBT0E7Z0JBQUN1QixVQUFTOzs7Ozs7Ozs7Ozs7QUFHeEI7QUFFQSxpRUFBZWpCLEtBQUtBLEVBQUEiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9rb25uZWN0LWFwcC8uL3BhZ2VzL19hcHAudHN4PzJmYmUiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICcuLi9zcmMvc3R5bGVzL2dsb2JhbHMuY3NzJ1xuaW1wb3J0IHR5cGUgeyBBcHBQcm9wcyB9IGZyb20gJ25leHQvYXBwJ1xuaW1wb3J0IHsgVG9hc3RlciB9IGZyb20gJ3JlYWN0LWhvdC10b2FzdCdcbmltcG9ydCB7IGNyZWF0ZVBhZ2VzQnJvd3NlckNsaWVudCB9IGZyb20gJ0BzdXBhYmFzZS9hdXRoLWhlbHBlcnMtbmV4dGpzJztcbmltcG9ydCB7IFNlc3Npb25Db250ZXh0UHJvdmlkZXIgfSBmcm9tICdAc3VwYWJhc2UvYXV0aC1oZWxwZXJzLXJlYWN0JztcbmltcG9ydCB7IHVzZVJvdXRlciB9IGZyb20gJ25leHQvcm91dGVyJztcbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5cbmZ1bmN0aW9uIE15QXBwKHsgQ29tcG9uZW50LCBwYWdlUHJvcHMgfTogQXBwUHJvcHMpIHtcbiAgY29uc3QgW3N1cGFiYXNlQ2xpZW50XSA9IHVzZVN0YXRlKCgpID0+IGNyZWF0ZVBhZ2VzQnJvd3NlckNsaWVudCgpKTtcbiAgY29uc3Qgcm91dGVyID0gdXNlUm91dGVyKCk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCB7IGRhdGE6IHsgc3Vic2NyaXB0aW9uIH0gfSA9IHN1cGFiYXNlQ2xpZW50LmF1dGgub25BdXRoU3RhdGVDaGFuZ2UoKGV2ZW50LCBzZXNzaW9uKSA9PiB7XG4gICAgICAvLyBPbmx5IGhhbmRsZSBzdWNjZXNzZnVsIGVtYWlsIHZlcmlmaWNhdGlvbiBldmVudHNcbiAgICAgIGlmIChldmVudCA9PT0gJ1NJR05FRF9JTicgJiYgc2Vzc2lvbj8udXNlcj8uZW1haWxfY29uZmlybWVkX2F0KSB7XG4gICAgICAgIC8vIElmIHZlcmlmaWVkIGJ1dCBoYXNuJ3QgY29tcGxldGVkIG9uYm9hcmRpbmcsIGdvIHRvIG9uYm9hcmRpbmdcbiAgICAgICAgaWYgKCFzZXNzaW9uLnVzZXIudXNlcl9tZXRhZGF0YT8ub25ib2FyZGluZ19jb21wbGV0ZWQpIHtcbiAgICAgICAgICByb3V0ZXIucHVzaCgnL29uYm9hcmRpbmcnKTtcbiAgICAgICAgfSBcbiAgICAgICAgLy8gSWYgdmVyaWZpZWQgYW5kIGNvbXBsZXRlZCBvbmJvYXJkaW5nLCBnbyB0byBkYXNoYm9hcmRcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcm91dGVyLnB1c2goJy9kYXNoYm9hcmQnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIH07XG4gIH0sIFtyb3V0ZXJdKTtcblxuICByZXR1cm4gKFxuICAgIDxTZXNzaW9uQ29udGV4dFByb3ZpZGVyIHN1cGFiYXNlQ2xpZW50PXtzdXBhYmFzZUNsaWVudH0+XG4gICAgICA8Q29tcG9uZW50IHsuLi5wYWdlUHJvcHN9IC8+XG4gICAgICA8VG9hc3RlciBwb3NpdGlvbj1cInRvcC1jZW50ZXJcIiAvPlxuICAgIDwvU2Vzc2lvbkNvbnRleHRQcm92aWRlcj5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBNeUFwcCAiXSwibmFtZXMiOlsiVG9hc3RlciIsImNyZWF0ZVBhZ2VzQnJvd3NlckNsaWVudCIsIlNlc3Npb25Db250ZXh0UHJvdmlkZXIiLCJ1c2VSb3V0ZXIiLCJ1c2VFZmZlY3QiLCJ1c2VTdGF0ZSIsIk15QXBwIiwiQ29tcG9uZW50IiwicGFnZVByb3BzIiwic3VwYWJhc2VDbGllbnQiLCJyb3V0ZXIiLCJkYXRhIiwic3Vic2NyaXB0aW9uIiwiYXV0aCIsIm9uQXV0aFN0YXRlQ2hhbmdlIiwiZXZlbnQiLCJzZXNzaW9uIiwidXNlciIsImVtYWlsX2NvbmZpcm1lZF9hdCIsInVzZXJfbWV0YWRhdGEiLCJvbmJvYXJkaW5nX2NvbXBsZXRlZCIsInB1c2giLCJ1bnN1YnNjcmliZSIsInBvc2l0aW9uIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./pages/_app.tsx\n");

/***/ }),

/***/ "./src/styles/globals.css":
/*!********************************!*\
  !*** ./src/styles/globals.css ***!
  \********************************/
/***/ (() => {



/***/ }),

/***/ "@supabase/auth-helpers-nextjs":
/*!************************************************!*\
  !*** external "@supabase/auth-helpers-nextjs" ***!
  \************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("@supabase/auth-helpers-nextjs");

/***/ }),

/***/ "@supabase/auth-helpers-react":
/*!***********************************************!*\
  !*** external "@supabase/auth-helpers-react" ***!
  \***********************************************/
/***/ ((module) => {

"use strict";
module.exports = require("@supabase/auth-helpers-react");

/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react-dom":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-dom");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "react/jsx-runtime":
/*!************************************!*\
  !*** external "react/jsx-runtime" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ }),

/***/ "react-hot-toast":
/*!**********************************!*\
  !*** external "react-hot-toast" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = import("react-hot-toast");;

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc"], () => (__webpack_exec__("./pages/_app.tsx")));
module.exports = __webpack_exports__;

})();