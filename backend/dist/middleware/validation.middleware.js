"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const http_exception_1 = require("../exceptions/http.exception");
function validateDto(type, skipMissingProperties = false) {
    return async (req, res, next) => {
        const dto = (0, class_transformer_1.plainToInstance)(type, req.body);
        const errors = await (0, class_validator_1.validate)(dto, {
            skipMissingProperties,
            whitelist: true,
            forbidNonWhitelisted: true
        });
        if (errors.length > 0) {
            const message = errors
                .map((error) => error.constraints ? Object.values(error.constraints) : [])
                .join(', ');
            next(new http_exception_1.HttpException(400, message));
        }
        else {
            req.body = dto;
            next();
        }
    };
}
exports.validateDto = validateDto;
