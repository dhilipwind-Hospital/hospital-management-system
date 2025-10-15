import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Allergy, AllergenType, ReactionSeverity } from '../models/Allergy';
import { User } from '../models/User';

export class AllergyController {
  // Add allergy
  static addAllergy = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const {
        patientId,
        allergenType,
        allergenName,
        reactionSeverity,
        reactionDescription,
        dateIdentified
      } = req.body;

      if (!patientId || !allergenType || !allergenName || !reactionSeverity) {
        return res.status(400).json({ 
          message: 'Patient ID, allergen type, allergen name, and reaction severity are required' 
        });
      }

      const allergyRepo = AppDataSource.getRepository(Allergy);
      const userRepo = AppDataSource.getRepository(User);

      const patient = await userRepo.findOne({ where: { id: patientId } });
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }

      // Check for duplicate allergy
      const existingAllergy = await allergyRepo.findOne({
        where: {
          patient: { id: patientId },
          allergenName,
          isActive: true
        }
      });

      if (existingAllergy) {
        return res.status(400).json({ message: 'This allergy already exists for the patient' });
      }

      const allergy = allergyRepo.create({
        patient,
        allergenType,
        allergenName,
        reactionSeverity,
        reactionDescription,
        dateIdentified: dateIdentified ? new Date(dateIdentified) : undefined
      });

      await allergyRepo.save(allergy);

      return res.status(201).json({
        message: 'Allergy added successfully',
        data: allergy
      });
    } catch (error) {
      console.error('Error adding allergy:', error);
      return res.status(500).json({ message: 'Error adding allergy' });
    }
  };

  // Get allergy by ID
  static getAllergy = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const allergyRepo = AppDataSource.getRepository(Allergy);
      const allergy = await allergyRepo.findOne({
        where: { id },
        relations: ['patient', 'verifiedBy']
      });

      if (!allergy) {
        return res.status(404).json({ message: 'Allergy not found' });
      }

      return res.json({ data: allergy });
    } catch (error) {
      console.error('Error fetching allergy:', error);
      return res.status(500).json({ message: 'Error fetching allergy' });
    }
  };

  // Update allergy
  static updateAllergy = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const allergyRepo = AppDataSource.getRepository(Allergy);
      const allergy = await allergyRepo.findOne({ where: { id } });

      if (!allergy) {
        return res.status(404).json({ message: 'Allergy not found' });
      }

      Object.assign(allergy, updateData);
      await allergyRepo.save(allergy);

      return res.json({
        message: 'Allergy updated successfully',
        data: allergy
      });
    } catch (error) {
      console.error('Error updating allergy:', error);
      return res.status(500).json({ message: 'Error updating allergy' });
    }
  };

  // Get patient allergies
  static getPatientAllergies = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { activeOnly = 'true' } = req.query;

      const allergyRepo = AppDataSource.getRepository(Allergy);
      const queryBuilder = allergyRepo.createQueryBuilder('allergy')
        .leftJoinAndSelect('allergy.verifiedBy', 'verifiedBy')
        .where('allergy.patientId = :patientId', { patientId: id })
        .orderBy('allergy.reactionSeverity', 'DESC')
        .addOrderBy('allergy.createdAt', 'DESC');

      if (activeOnly === 'true') {
        queryBuilder.andWhere('allergy.isActive = :isActive', { isActive: true });
      }

      const allergies = await queryBuilder.getMany();

      // Categorize by severity
      const categorized = {
        lifeThreatening: allergies.filter(a => a.reactionSeverity === ReactionSeverity.LIFE_THREATENING),
        severe: allergies.filter(a => a.reactionSeverity === ReactionSeverity.SEVERE),
        moderate: allergies.filter(a => a.reactionSeverity === ReactionSeverity.MODERATE),
        mild: allergies.filter(a => a.reactionSeverity === ReactionSeverity.MILD)
      };

      return res.json({
        data: allergies,
        categorized,
        total: allergies.length,
        criticalCount: categorized.lifeThreatening.length + categorized.severe.length
      });
    } catch (error) {
      console.error('Error fetching patient allergies:', error);
      return res.status(500).json({ message: 'Error fetching allergies' });
    }
  };

  // Verify allergy
  static verifyAllergy = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const allergyRepo = AppDataSource.getRepository(Allergy);
      const userRepo = AppDataSource.getRepository(User);

      const allergy = await allergyRepo.findOne({ where: { id } });
      if (!allergy) {
        return res.status(404).json({ message: 'Allergy not found' });
      }

      const verifier = await userRepo.findOne({ where: { id: userId } });
      if (!verifier) {
        return res.status(404).json({ message: 'User not found' });
      }

      allergy.verifiedBy = verifier;
      await allergyRepo.save(allergy);

      return res.json({
        message: 'Allergy verified successfully',
        data: allergy
      });
    } catch (error) {
      console.error('Error verifying allergy:', error);
      return res.status(500).json({ message: 'Error verifying allergy' });
    }
  };

  // Check drug allergies (helper method for prescription system)
  static checkDrugAllergies = async (req: Request, res: Response) => {
    try {
      const { patientId, drugName } = req.body;

      if (!patientId || !drugName) {
        return res.status(400).json({ message: 'Patient ID and drug name are required' });
      }

      const allergyRepo = AppDataSource.getRepository(Allergy);
      const allergies = await allergyRepo.find({
        where: {
          patient: { id: patientId },
          allergenType: AllergenType.DRUG,
          isActive: true
        }
      });

      // Simple name matching (in production, use drug database)
      const matchingAllergies = allergies.filter(allergy =>
        allergy.allergenName.toLowerCase().includes(drugName.toLowerCase()) ||
        drugName.toLowerCase().includes(allergy.allergenName.toLowerCase())
      );

      const hasAllergy = matchingAllergies.length > 0;
      const hasCriticalAllergy = matchingAllergies.some(a =>
        a.reactionSeverity === ReactionSeverity.LIFE_THREATENING ||
        a.reactionSeverity === ReactionSeverity.SEVERE
      );

      return res.json({
        hasAllergy,
        hasCriticalAllergy,
        allergies: matchingAllergies,
        warning: hasAllergy
          ? `Patient has known allergy to ${matchingAllergies.map(a => a.allergenName).join(', ')}`
          : null
      });
    } catch (error) {
      console.error('Error checking drug allergies:', error);
      return res.status(500).json({ message: 'Error checking allergies' });
    }
  };
}
