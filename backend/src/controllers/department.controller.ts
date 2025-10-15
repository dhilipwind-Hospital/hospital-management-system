import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Department } from '../models/Department';
import { Not } from 'typeorm';

export class DepartmentController {
  // Get all departments
  static listAll = async (req: Request, res: Response) => {
    const departmentRepository = AppDataSource.getRepository(Department);
    const page = Math.max(parseInt((req.query.page as string) || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt((req.query.limit as string) || '10', 10), 1), 100);
    const isActiveParam = req.query.isActive;
    const where: any = {};
    // Map isActive=true to status='active', false to status!='active'
    if (typeof isActiveParam !== 'undefined') {
      const active = String(isActiveParam).toLowerCase() === 'true';
      if (active) where.status = 'active';
      else where.status = Not('active');
    }

    try {
      const [items, total] = await departmentRepository.findAndCount({
        where,
        order: { name: 'ASC' },
        relations: ['services'],
        skip: (page - 1) * limit,
        take: limit
      });
      const meta = { total, page, limit, totalPages: Math.ceil(total / limit) };
      return res.json({ data: items, meta });
    } catch (error) {
      console.error('Error fetching departments:', error);
      return res.status(500).json({ message: 'Error fetching departments' });
    }
  };

  // Get department by ID
  static getOneById = async (req: Request, res: Response) => {
    const departmentRepository = AppDataSource.getRepository(Department);
    const id = req.params.id;

    try {
      const department = await departmentRepository.findOne({
        where: { id },
        relations: ['services']
      });

      if (!department) {
        return res.status(404).json({ message: 'Department not found' });
      }

      return res.json(department);
    } catch (error) {
      console.error('Error fetching department:', error);
      return res.status(500).json({ message: 'Error fetching department' });
    }
  };

  // Get services by department
  static getDepartmentServices = async (req: Request, res: Response) => {
    const departmentId = req.params.id;
    const serviceRepository = AppDataSource.getRepository(Department);

    try {
      const department = await serviceRepository.findOne({
        where: { id: departmentId },
        relations: ['services']
      });

      if (!department) {
        return res.status(404).json({ message: 'Department not found' });
      }

      return res.json(department.services || []);
    } catch (error) {
      console.error('Error fetching department services:', error);
      return res.status(500).json({ message: 'Error fetching department services' });
    }
  };

  // Admin: create department
  static create = async (req: Request, res: Response) => {
    const repo = AppDataSource.getRepository(Department);
    const { name, description, status } = req.body || {};
    try {
      if (!name) return res.status(400).json({ message: 'Name is required' });
      const entity = repo.create({
        name,
        description,
        status: status || 'active'
      } as any);
      const saved = await repo.save(entity);
      return res.status(201).json(saved);
    } catch (e) {
      console.error('Error creating department:', e);
      return res.status(500).json({ message: 'Error creating department' });
    }
  };

  // Admin: update department
  static update = async (req: Request, res: Response) => {
    const repo = AppDataSource.getRepository(Department);
    const { id } = req.params;
    const { name, description, status } = req.body || {};
    try {
      const dept = await repo.findOne({ where: { id } });
      if (!dept) return res.status(404).json({ message: 'Department not found' });
      if (typeof name !== 'undefined') dept.name = name;
      if (typeof description !== 'undefined') (dept as any).description = description;
      if (typeof status !== 'undefined') (dept as any).status = status;
      await repo.save(dept);
      return res.json(dept);
    } catch (e) {
      console.error('Error updating department:', e);
      return res.status(500).json({ message: 'Error updating department' });
    }
  };

  // Admin: set status
  static setStatus = async (req: Request, res: Response) => {
    const repo = AppDataSource.getRepository(Department);
    const { id } = req.params;
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ message: 'status is required' });
    try {
      const dept = await repo.findOne({ where: { id } });
      if (!dept) return res.status(404).json({ message: 'Department not found' });
      (dept as any).status = status;
      await repo.save(dept);
      return res.json({ message: 'Status updated' });
    } catch (e) {
      console.error('Error updating department status:', e);
      return res.status(500).json({ message: 'Error updating department status' });
    }
  };
}
