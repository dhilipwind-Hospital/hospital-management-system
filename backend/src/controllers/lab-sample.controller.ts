import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { LabSample } from '../models/LabSample';
import { LabOrderItem } from '../models/LabOrderItem';

export class LabSampleController {
  // Generate sample ID (barcode)
  private static async generateSampleId(): Promise<string> {
    const labSampleRepo = AppDataSource.getRepository(LabSample);
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    
    const lastSample = await labSampleRepo
      .createQueryBuilder('sample')
      .where('sample.sampleId LIKE :pattern', { pattern: `S${year}${month}%` })
      .orderBy('sample.createdAt', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastSample) {
      const lastSequence = parseInt(lastSample.sampleId.substring(7));
      sequence = lastSequence + 1;
    }

    return `S${year}${month}${sequence.toString().padStart(5, '0')}`;
  }

  // Register a new sample
  static registerSample = async (req: Request, res: Response) => {
    try {
      const { orderItemId, sampleType, storageLocation } = req.body;
      const collectedById = (req as any).user.id;

      const labSampleRepo = AppDataSource.getRepository(LabSample);
      const labOrderItemRepo = AppDataSource.getRepository(LabOrderItem);

      // Check if order item exists
      const orderItem = await labOrderItemRepo.findOne({ 
        where: { id: orderItemId },
        relations: ['labTest']
      });

      if (!orderItem) {
        return res.status(404).json({ message: 'Lab order item not found' });
      }

      // Generate sample ID
      const sampleId = await LabSampleController.generateSampleId();

      // Create sample
      const sample = labSampleRepo.create({
        sampleId,
        sampleType: sampleType || orderItem.labTest.sampleType || 'blood',
        collectionTime: new Date(),
        collectedById,
        status: 'collected',
        storageLocation
      });

      const savedSample = await labSampleRepo.save(sample);

      // Update order item
      orderItem.sampleId = savedSample.id;
      orderItem.status = 'sample_collected';
      await labOrderItemRepo.save(orderItem);

      res.status(201).json(savedSample);
    } catch (error) {
      console.error('Error registering sample:', error);
      res.status(500).json({ message: 'Error registering sample' });
    }
  };

  // Update sample status
  static updateSampleStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, storageLocation } = req.body;
      const labSampleRepo = AppDataSource.getRepository(LabSample);

      const sample = await labSampleRepo.findOne({ where: { id } });

      if (!sample) {
        return res.status(404).json({ message: 'Sample not found' });
      }

      sample.status = status;
      if (storageLocation) {
        sample.storageLocation = storageLocation;
      }

      const updatedSample = await labSampleRepo.save(sample);

      res.json(updatedSample);
    } catch (error) {
      console.error('Error updating sample status:', error);
      res.status(500).json({ message: 'Error updating sample status' });
    }
  };

  // Reject sample
  static rejectSample = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;
      const labSampleRepo = AppDataSource.getRepository(LabSample);

      const sample = await labSampleRepo.findOne({ where: { id } });

      if (!sample) {
        return res.status(404).json({ message: 'Sample not found' });
      }

      sample.status = 'rejected';
      sample.rejectionReason = rejectionReason;

      const updatedSample = await labSampleRepo.save(sample);

      res.json(updatedSample);
    } catch (error) {
      console.error('Error rejecting sample:', error);
      res.status(500).json({ message: 'Error rejecting sample' });
    }
  };

  // Get sample by ID
  static getSampleById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const labSampleRepo = AppDataSource.getRepository(LabSample);

      const sample = await labSampleRepo.findOne({
        where: { id },
        relations: ['collectedBy']
      });

      if (!sample) {
        return res.status(404).json({ message: 'Sample not found' });
      }

      res.json(sample);
    } catch (error) {
      console.error('Error fetching sample:', error);
      res.status(500).json({ message: 'Error fetching sample' });
    }
  };

  // Get samples by lab order
  static getSamplesByLabOrder = async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const labOrderItemRepo = AppDataSource.getRepository(LabOrderItem);

      const items = await labOrderItemRepo.find({
        where: { labOrderId: orderId },
        relations: ['sample', 'sample.collectedBy', 'labTest']
      });

      const samples = items
        .filter(item => item.sample)
        .map(item => ({
          ...item.sample,
          testName: item.labTest.name
        }));

      res.json(samples);
    } catch (error) {
      console.error('Error fetching samples:', error);
      res.status(500).json({ message: 'Error fetching samples' });
    }
  };
}
