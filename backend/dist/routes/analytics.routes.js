"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Get dashboard statistics
router.get('/dashboard-stats', analytics_controller_1.AnalyticsController.getDashboardStats);
// Get department performance
router.get('/department-performance', analytics_controller_1.AnalyticsController.getDepartmentPerformance);
// Get recent activity
router.get('/recent-activity', analytics_controller_1.AnalyticsController.getRecentActivity);
exports.default = router;
