import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Feedback, FeedbackType, FeedbackStatus } from '../models/Feedback';
import { User } from '../models/User';

export class FeedbackController {
  // Submit feedback
  static submitFeedback = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { type, subject, message, rating } = req.body;

      if (!type || !subject || !message) {
        return res.status(400).json({ message: 'Required fields missing' });
      }

      const feedbackRepo = AppDataSource.getRepository(Feedback);
      const userRepo = AppDataSource.getRepository(User);

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
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return res.status(500).json({ message: 'Error submitting feedback' });
    }
  };

  // Get all feedback
  static getAllFeedback = async (req: Request, res: Response) => {
    try {
      const { type, status } = req.query;
      const feedbackRepo = AppDataSource.getRepository(Feedback);

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
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return res.status(500).json({ message: 'Error fetching feedback' });
    }
  };

  // Get user feedback
  static getUserFeedback = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const feedbackRepo = AppDataSource.getRepository(Feedback);

      const feedback = await feedbackRepo.find({
        where: { user: { id: userId } },
        relations: ['respondedBy'],
        order: { createdAt: 'DESC' }
      });

      return res.json({
        data: feedback,
        total: feedback.length
      });
    } catch (error) {
      console.error('Error fetching user feedback:', error);
      return res.status(500).json({ message: 'Error fetching user feedback' });
    }
  };

  // Get feedback by ID
  static getFeedback = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const feedbackRepo = AppDataSource.getRepository(Feedback);

      const feedback = await feedbackRepo.findOne({
        where: { id },
        relations: ['user', 'respondedBy']
      });

      if (!feedback) {
        return res.status(404).json({ message: 'Feedback not found' });
      }

      return res.json({ data: feedback });
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return res.status(500).json({ message: 'Error fetching feedback' });
    }
  };

  // Respond to feedback
  static respondToFeedback = async (req: Request, res: Response) => {
    try {
      const responderId = (req as any).user?.id;
      const { id } = req.params;
      const { response } = req.body;

      if (!response) {
        return res.status(400).json({ message: 'Response is required' });
      }

      const feedbackRepo = AppDataSource.getRepository(Feedback);
      const userRepo = AppDataSource.getRepository(User);

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
      feedback.status = FeedbackStatus.REVIEWED;

      await feedbackRepo.save(feedback);

      return res.json({
        message: 'Response added successfully',
        data: feedback
      });
    } catch (error) {
      console.error('Error responding to feedback:', error);
      return res.status(500).json({ message: 'Error responding to feedback' });
    }
  };

  // Update feedback status
  static updateStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const feedbackRepo = AppDataSource.getRepository(Feedback);

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
    } catch (error) {
      console.error('Error updating status:', error);
      return res.status(500).json({ message: 'Error updating status' });
    }
  };

  // Get feedback statistics
  static getStatistics = async (req: Request, res: Response) => {
    try {
      const feedbackRepo = AppDataSource.getRepository(Feedback);

      const [
        total,
        pending,
        reviewed,
        resolved,
        avgRating
      ] = await Promise.all([
        feedbackRepo.count(),
        feedbackRepo.count({ where: { status: FeedbackStatus.PENDING } }),
        feedbackRepo.count({ where: { status: FeedbackStatus.REVIEWED } }),
        feedbackRepo.count({ where: { status: FeedbackStatus.RESOLVED } }),
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
          averageRating: avgRating?.avg ? parseFloat(avgRating.avg).toFixed(2) : null
        }
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return res.status(500).json({ message: 'Error fetching statistics' });
    }
  };
}
