"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictException = exports.BadRequestException = exports.ForbiddenException = exports.UnauthorizedException = exports.NotFoundException = exports.HttpException = void 0;
class HttpException extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.HttpException = HttpException;
class NotFoundException extends HttpException {
    constructor(message = 'Resource not found') {
        super(404, message);
    }
}
exports.NotFoundException = NotFoundException;
class UnauthorizedException extends HttpException {
    constructor(message = 'Unauthorized') {
        super(401, message);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenException extends HttpException {
    constructor(message = 'Forbidden') {
        super(403, message);
    }
}
exports.ForbiddenException = ForbiddenException;
class BadRequestException extends HttpException {
    constructor(message = 'Bad request') {
        super(400, message);
    }
}
exports.BadRequestException = BadRequestException;
class ConflictException extends HttpException {
    constructor(message = 'Conflict') {
        super(409, message);
    }
}
exports.ConflictException = ConflictException;
