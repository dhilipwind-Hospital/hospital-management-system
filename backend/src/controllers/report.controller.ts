import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Report } from '../models/Report';
import { User } from '../models/User';

export class ReportController {
  static listPatientReports = async (req: Request, res: Response) => {
    const { patientId } = req.params as any;
    const repo = AppDataSource.getRepository(Report);
    try {
      const items = await repo.find({ where: { patientId } as any, order: { createdAt: 'DESC' } });
      return res.json(items);
    } catch (e) {
      console.error('List reports error:', e);
      return res.status(500).json({ message: 'Failed to list reports' });
    }
  };

  static getReport = async (req: Request, res: Response) => {
    const { reportId } = req.params as any;
    const repo = AppDataSource.getRepository(Report);
    try {
      const report = await repo.findOne({ where: { id: reportId } as any });
      if (!report) return res.status(404).json({ message: 'Report not found' });
      return res.json(report);
    } catch (e) {
      console.error('Get report error:', e);
      return res.status(500).json({ message: 'Failed to get report' });
    }
  };

  static createReport = async (req: Request, res: Response) => {
    const { patientId, type = 'other', title, content } = req.body || {};
    if (!patientId || !title) return res.status(400).json({ message: 'patientId and title are required' });
    const repo = AppDataSource.getRepository(Report);
    const userRepo = AppDataSource.getRepository(User);
    try {
      const patient = await userRepo.findOne({ where: { id: patientId } });
      if (!patient) return res.status(404).json({ message: 'Patient not found' });
      const r = new Report();
      r.patientId = patientId;
      r.type = type;
      r.title = title;
      r.content = content || null;
      const saved = await repo.save(r);
      return res.status(201).json(saved);
    } catch (e) {
      console.error('Create report error:', e);
      return res.status(500).json({ message: 'Failed to create report' });
    }
  };
}
