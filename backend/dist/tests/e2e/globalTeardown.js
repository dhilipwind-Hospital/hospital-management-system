"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../../config/database");
module.exports = async () => {
    try {
        if (database_1.AppDataSource.isInitialized) {
            await database_1.AppDataSource.destroy();
        }
    }
    catch (_a) { }
};
