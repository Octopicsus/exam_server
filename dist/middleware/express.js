"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlencodedMiddleware = exports.jsonMiddleware = void 0;
const express_1 = __importDefault(require("express"));
exports.jsonMiddleware = express_1.default.json();
exports.urlencodedMiddleware = express_1.default.urlencoded({ extended: true });
