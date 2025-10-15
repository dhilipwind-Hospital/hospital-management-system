"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = exports.errorHandler = void 0;
const http_exception_1 = require("../exceptions/http.exception");
function errorHandler(controller) {
    return async (req, res, next) => {
        try {
            await controller(req, res, next);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.errorHandler = errorHandler;
function errorMiddleware(error, req, res, next) {
    console.error('Error:', error);
    if (error instanceof http_exception_1.HttpException) {
        return res.status(error.status).json({
            status: 'error',
            message: error.message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }
    // Handle validation errors
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: error.errors
        });
    }
    // Handle database errors
    if (error.name === 'QueryFailedError') {
        return res.status(400).json({
            status: 'error',
            message: 'Database error',
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        });
    }
    // Default error response
    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
}
exports.errorMiddleware = errorMiddleware;
