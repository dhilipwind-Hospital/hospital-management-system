"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackController = void 0;
const database_1 = require("../config/database");
const Feedback_1 = require("../models/Feedback");
const User_1 = require("../models/User");
class FeedbackController {
}
exports.FeedbackController = FeedbackController;
_a = FeedbackController;
// Submit feedback
FeedbackController.submitFeedback = async (req, res) => {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const { type, subject, message, rating } = req.body;
        if (!type || !subject || !message) {
            return res.status(400).json({ message: 'Required fields missing' });
        }
        const feedbackRepo = database_1.AppDataSource.getRepository(Feedback_1.Feedback);
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const feedback = feedbackRepo.create({
            user,
            type,
            subject,
            message,
            rating: rating || null
        });
        await feedbackRepo.save(feedback);
        return res.status(201).json({
            message: 'Feedback submitted successfully',
            data: feedback
        });
    }
    catch (error) {
        console.error('Error submitting feedback:', error);
        return res.status(500).json({ message: 'Error submitting feedback' });
    }
};
// Get all feedback
FeedbackController.getAllFeedback = async (req, res) => {
    try {
        const { type, status } = req.query;
        const feedbackRepo = database_1.AppDataSource.getRepository(Feedback_1.Feedback);
        const queryBuilder = feedbackRepo.createQueryBuilder('feedback')
            .leftJoinAndSelect('feedback.user', 'user')
            .leftJoinAndSelect('feedback.respondedBy', 'respondedBy')
            .orderBy('feedback.createdAt', 'DESC');
        if (type) {
            queryBuilder.andWhere('feedback.type = :type', { type });
        }
        if (status) {
            queryBuilder.andWhere('feedback.status = :status', { status });
        }
        const feedback = await queryBuilder.getMany();
        return res.json({
            data: feedback,
            total: feedback.length
        });
    }
    catch (error) {
        console.error('Error fetching feedback:', error);
        return res.status(500).json({ message: 'Error fetching feedback' });
    }
};
// Get user feedback
FeedbackController.getUserFeedback = async (req, res) => {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const feedbackRepo = database_1.AppDataSource.getRepository(Feedback_1.Feedback);
        const feedback = await feedbackRepo.find({
            where: { user: { id: userId } },
            relations: ['respondedBy'],
            order: { createdAt: 'DESC' }
        });
        return res.json({
            data: feedback,
            total: feedback.length
        });
    }
    catch (error) {
        console.error('Error fetching user feedback:', error);
        return res.status(500).json({ message: 'Error fetching user feedback' });
    }
};
// Get feedback by ID
FeedbackController.getFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const feedbackRepo = database_1.AppDataSource.getRepository(Feedback_1.Feedback);
        const feedback = await feedbackRepo.findOne({
            where: { id },
            relations: ['user', 'respondedBy']
        });
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }
        return res.json({ data: feedback });
    }
    catch (error) {
        console.error('Error fetching feedback:', error);
        return res.status(500).json({ message: 'Error fetching feedback' });
    }
};
// Respond to feedback
FeedbackController.respondToFeedback = async (req, res) => {
    var _b;
    try {
        const responderId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const { id } = req.params;
        const { response } = req.body;
        if (!response) {
            return res.status(400).json({ message: 'Response is required' });
        }
        const feedbackRepo = database_1.AppDataSource.getRepository(Feedback_1.Feedback);
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const feedback = await feedbackRepo.findOne({ where: { id } });
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }
        const responder = await userRepo.findOne({ where: { id: responderId } });
        if (!responder) {
            return res.status(404).json({ message: 'Responder not found' });
        }
        feedback.response = response;
        feedback.respondedBy = responder;
        feedback.respondedAt = new Date();
        feedback.status = Feedback_1.FeedbackStatus.REVIEWED;
        await feedbackRepo.save(feedback);
        return res.json({
            message: 'Response added successfully',
            data: feedback
        });
    }
    catch (error) {
        console.error('Error responding to feedback:', error);
        return res.status(500).json({ message: 'Error responding to feedback' });
    }
};
// Update feedback status
FeedbackController.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const feedbackRepo = database_1.AppDataSource.getRepository(Feedback_1.Feedback);
        const feedback = await feedbackRepo.findOne({ where: { id } });
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }
        feedback.status = status;
        await feedbackRepo.save(feedback);
        return res.json({
            message: 'Status updated successfully',
            data: feedback
        });
    }
    catch (error) {
        console.error('Error updating status:', error);
        return res.status(500).json({ message: 'Error updating status' });
    }
};
// Get feedback statistics
FeedbackController.getStatistics = async (req, res) => {
    try {
        const feedbackRepo = database_1.AppDataSource.getRepository(Feedback_1.Feedback);
        const [total, pending, reviewed, resolved, avgRating] = await Promise.all([
            feedbackRepo.count(),
            feedbackRepo.count({ where: { status: Feedback_1.FeedbackStatus.PENDING } }),
            feedbackRepo.count({ where: { status: Feedback_1.FeedbackStatus.REVIEWED } }),
            feedbackRepo.count({ where: { status: Feedback_1.FeedbackStatus.RESOLVED } }),
            feedbackRepo.createQueryBuilder('feedback')
                .select('AVG(feedback.rating)', 'avg')
                .where('feedback.rating IS NOT NULL')
                .getRawOne()
        ]);
        return res.json({
            data: {
                total,
                pending,
                reviewed,
                resolved,
                averageRating: (avgRating === null || avgRating === void 0 ? void 0 : avgRating.avg) ? parseFloat(avgRating.avg).toFixed(2) : null
            }
        });
    }
    catch (error) {
        console.error('Error fetching statistics:', error);
        return res.status(500).json({ message: 'Error fetching statistics' });
    }
};
