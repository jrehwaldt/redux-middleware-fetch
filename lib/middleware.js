"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var qs_1 = require("qs");
var SimpleStorage = (function () {
    function SimpleStorage() {
    }
    SimpleStorage.prototype.getItem = function (key) {
        return this[key];
    };
    SimpleStorage.prototype.setItem = function (key, value) {
        this[key] = value;
    };
    return SimpleStorage;
}());
exports.SimpleStorage = SimpleStorage;
var storage = new SimpleStorage();
exports.API_REQUEST = "REDUX_MIDDLEWARE_FETCH/API_REQUEST";
exports.API_NO_TOKEN_STORED = "REDUX_MIDDLEWARE_FETCH/API_NO_TOKEN_STORED";
exports.API_REQUEST_START = "REDUX_MIDDLEWARE_FETCH/API_REQUEST_START";
exports.API_REQUEST_END = "REDUX_MIDDLEWARE_FETCH/API_REQUEST_END";
function setAPIHost(host) {
    storage.setItem("host", host);
}
exports.setAPIHost = setAPIHost;
function setToken(token) {
    storage.setItem("accessToken", token);
}
exports.setToken = setToken;
function setStorage(customStorage) {
    storage = customStorage;
}
exports.setStorage = setStorage;
exports.default = function () { return function (next) { return function (action) { return __awaiter(_this, void 0, void 0, function () {
    var requestOptions, entrypoint, types, auth, json, body, formData, method, onSuccess, onFailed, urlEncoded, fqdn, headers, _a, uuid, dispatchPayload, customHeaders, successType, errorType, requestType, fetchOptions, token, response, responseJson, url, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                requestOptions = action[exports.API_REQUEST];
                if (typeof requestOptions === "undefined") {
                    return [2 /*return*/, next(action)];
                }
                entrypoint = requestOptions.entrypoint, types = requestOptions.types, auth = requestOptions.auth, json = requestOptions.json, body = requestOptions.body, formData = requestOptions.formData, method = requestOptions.method, onSuccess = requestOptions.onSuccess, onFailed = requestOptions.onFailed, urlEncoded = requestOptions.urlEncoded, fqdn = requestOptions.fqdn, headers = requestOptions.headers, _a = requestOptions.uuid, uuid = _a === void 0 ? lodash_1.uniqueId('fetch-') : _a;
                dispatchPayload = lodash_1.omit(requestOptions.dispatchPayload || {}, "type");
                customHeaders = headers || {};
                successType = types[0], errorType = types[1], requestType = types[2];
                fetchOptions = {
                    method: method || "GET",
                    headers: __assign({ Accept: "application/json" }, customHeaders)
                };
                // Inject JWT Token
                if (auth) {
                    token = storage.getItem("accessToken");
                    if (token) {
                        fetchOptions.headers.Authorization = token;
                    }
                    else {
                        return [2 /*return*/, next(__assign({}, dispatchPayload, { type: exports.API_NO_TOKEN_STORED, uuid: uuid }))];
                    }
                }
                // ContentType
                if (json) {
                    fetchOptions.headers["Content-Type"] = "application/json";
                    fetchOptions.body = JSON.stringify(body || {});
                }
                // x-www-form-urlencoded
                if (urlEncoded) {
                    fetchOptions.headers["Content-Type"] = "application/x-www-form-urlencoded";
                    fetchOptions.body = qs_1.default.stringify(body || {});
                }
                // FormData
                if (formData) {
                    fetchOptions.body = new FormData();
                    lodash_1.forEach(body, function (val, key) {
                        if (val) {
                            if (val instanceof FileList) {
                                [].forEach.call(val, function (file) { return fetchOptions.body.append(key, file); });
                            }
                            else {
                                fetchOptions.body.append(key, val);
                            }
                        }
                    });
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 9, , 10]);
                url = "" + (fqdn || storage.getItem("host") || "/api") + entrypoint;
                // Before Request
                if (requestType) {
                    next(__assign({}, dispatchPayload, { type: requestType, entrypoint: entrypoint,
                        url: url,
                        fetchOptions: fetchOptions,
                        uuid: uuid }));
                }
                // Request Animation Start
                next(__assign({}, dispatchPayload, { type: exports.API_REQUEST_START, uuid: uuid }));
                return [4 /*yield*/, fetch(url, fetchOptions)];
            case 2:
                response = _b.sent();
                // Request Animation End
                next(__assign({}, dispatchPayload, { type: exports.API_REQUEST_END, uuid: uuid }));
                if (!response.ok) return [3 /*break*/, 6];
                if (!(response.status === 204)) return [3 /*break*/, 3];
                responseJson = {};
                return [3 /*break*/, 5];
            case 3: return [4 /*yield*/, response.json()];
            case 4:
                responseJson = _b.sent();
                _b.label = 5;
            case 5: return [3 /*break*/, 8];
            case 6: return [4 /*yield*/, response.json()];
            case 7:
                responseJson = _b.sent();
                if (onFailed) {
                    onFailed(response.message, responseJson, response);
                }
                return [2 /*return*/, next(__assign({}, dispatchPayload, { error: response.message, payload: responseJson, response: response, type: errorType, uuid: uuid }))];
            case 8: return [3 /*break*/, 10];
            case 9:
                error_1 = _b.sent();
                if (onFailed) {
                    onFailed(error_1.message, error_1, response);
                }
                if (errorType) {
                    next(__assign({}, dispatchPayload, { error: error_1,
                        response: response, type: errorType, uuid: uuid }));
                }
                return [2 /*return*/, console.error(error_1)];
            case 10:
                if (onSuccess) {
                    onSuccess(responseJson, response);
                }
                return [2 /*return*/, next(__assign({}, dispatchPayload, { payload: responseJson, response: response, type: successType, uuid: uuid }))];
        }
    });
}); }; }; };
//# sourceMappingURL=middleware.js.map