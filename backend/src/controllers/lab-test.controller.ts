import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { LabTest } from '../models/LabTest';
import { Like } from 'typeorm';

export class LabTestController {
  // Get all lab tests with pagination and filtering
  static getAllLabTests = async (req: Request, res: Response) => {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search = '', 
        category = '', 
        isActive = 'true' 
      } = req.query;

      const labTestRepo = AppDataSource.getRepository(LabTest);
      
      const whereConditions: any = {};
      
      if (search) {
        whereConditions.name = Like(`%${search}%`);
      }
      
      if (category) {
        whereConditions.category = category;
      }
      
      if (isActive !== 'all') {
        whereConditions.isActive = isActive === 'true';
      }

      const [tests, total] = await labTestRepo.findAndCount({
        where: whereConditions,
        order: { name: 'ASC' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      });

      res.json({
        tests,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit))
      });
    } catch (error) {
      console.error('Error fetching lab tests:', error);
      res.status(500).json({ message: 'Error fetching lab tests' });
    }
  };

  // Get a single lab test by ID
  static getLabTestById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const labTestRepo = AppDataSource.getRepository(LabTest);
      
      const test = await labTestRepo.findOne({ where: { id } });
      
      if (!test) {
        return res.status(404).json({ message: 'Lab test not found' });
      }

      res.json(test);
    } catch (error) {
      console.error('Error fetching lab test:', error);
      res.status(500).json({ message: 'Error fetching lab test' });
    }
  };

  // Create a new lab test
  static createLabTest = async (req: Request, res: Response) => {
    try {
      const labTestRepo = AppDataSource.getRepository(LabTest);
      
      // Check if test code already exists
      const existingTest = await labTestRepo.findOne({ 
        where: { code: req.body.code } 
      });
      
      if (existingTest) {
        return res.status(400).json({ message: 'Test code already exists' });
      }

      const newTest = labTestRepo.create(req.body);
      const savedTest = await labTestRepo.save(newTest);

      res.status(201).json(savedTest);
    } catch (error) {
      console.error('Error creating lab test:', error);
      res.status(500).json({ message: 'Error creating lab test' });
    }
  };

  // Update an existing lab test
  static updateLabTest = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const labTestRepo = AppDataSource.getRepository(LabTest);
      
      const test = await labTestRepo.findOne({ where: { id } });
      
      if (!test) {
        return res.status(404).json({ message: 'Lab test not found' });
      }

      // If updating code, check for duplicates
      if (req.body.code && req.body.code !== test.code) {
        const existingTest = await labTestRepo.findOne({ 
          where: { code: req.body.code } 
        });
        
        if (existingTest) {
          return res.status(400).json({ message: 'Test code already exists' });
        }
      }

      Object.assign(test, req.body);
      const updatedTest = await labTestRepo.save(test);

      res.json(updatedTest);
    } catch (error) {
      console.error('Error updating lab test:', error);
      res.status(500).json({ message: 'Error updating lab test' });
    }
  };

  // Delete a lab test (soft delete)
  static deleteLabTest = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const labTestRepo = AppDataSource.getRepository(LabTest);
      
      const test = await labTestRepo.findOne({ where: { id } });
      
      if (!test) {
        return res.status(404).json({ message: 'Lab test not found' });
      }

      // Soft delete by setting isActive to false
      test.isActive = false;
      await labTestRepo.save(test);

      res.json({ message: 'Lab test deleted successfully' });
    } catch (error) {
      console.error('Error deleting lab test:', error);
      res.status(500).json({ message: 'Error deleting lab test' });
    }
  };

  // Get test categories
  static getCategories = async (req: Request, res: Response) => {
    try {
      const categories = [
        'hematology',
        'biochemistry',
        'microbiology',
        'pathology',
        'immunology',
        'radiology',
        'other'
      ];

      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Error fetching categories' });
    }
  };
}
