"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrettyError = exports.isPrismaError = exports.isCustomError = exports.isZodError = exports.AuthorizationError = exports.BaseError = void 0;
const prisma_better_errors_1 = require("prisma-better-errors");
const ts_custom_error_1 = require("ts-custom-error");
const zod_1 = require("zod");
class BaseError extends ts_custom_error_1.CustomError {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}
exports.BaseError = BaseError;
class AuthorizationError extends BaseError {
    constructor(message, code) {
        super(message, code);
    }
}
exports.AuthorizationError = AuthorizationError;
//---------------------------------------------------------------------------------------------
// Error Source Check
//---------------------------------------------------------------------------------------------
function isZodError(err) {
    return Boolean(err && (err instanceof zod_1.ZodError || err.name === 'ZodError'));
}
exports.isZodError = isZodError;
//---------------------------------------------------------------------------------------------
function isCustomError(err) {
    return Boolean(err && (err instanceof ts_custom_error_1.CustomError || err.name === 'CustomError'));
}
exports.isCustomError = isCustomError;
//---------------------------------------------------------------------------------------------
function isPrismaError(err) {
    return Boolean(err && err.name === 'PrismaClientKnownRequestError');
}
exports.isPrismaError = isPrismaError;
//---------------------------------------------------------------------------------------------
// Pretty Error Object
//---------------------------------------------------------------------------------------------
function getPrettyError(err) {
    if (isZodError(err)) {
        return { code: 400, message: `${err.issues[0].path[0]}: ${err.issues[0].message}` };
    }
    else if (isCustomError(err)) {
        return { code: err.code, message: err.message };
    }
    else if (isPrismaError(err)) {
        const e = new prisma_better_errors_1.prismaError(err);
        let metaData = '';
        if (typeof e.metaData === 'object') {
            for (const key in e.metaData) {
                metaData += `${key}: ${e.metaData[key]}, `;
            }
        }
        else {
            metaData = e.metaData;
        }
        return { code: e.statusCode, message: e.message + ': ' + metaData };
    }
    else {
        if (process.env.NODE_ENV === 'development') {
            console.error(err);
        }
        return { code: 500, message: 'Internal Server Error' };
    }
}
exports.getPrettyError = getPrettyError;
//---------------------------------------------------------------------------------------------
