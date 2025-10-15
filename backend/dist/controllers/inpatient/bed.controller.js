"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BedController = void 0;
const database_1 = require("../../config/database");
const Bed_1 = require("../../models/inpatient/Bed");
const Room_1 = require("../../models/inpatient/Room");
class BedController {
}
exports.BedController = BedController;
_a = BedController;
// Get all beds
BedController.getAllBeds = async (req, res) => {
    try {
        const bedRepository = database_1.AppDataSource.getRepository(Bed_1.Bed);
        const beds = await bedRepository.find({
            relations: ['room', 'room.ward', 'currentAdmission'],
            order: { bedNumber: 'ASC' }
        });
        return res.json({
            success: true,
            beds
        });
    }
    catch (error) {
        console.error('Error fetching beds:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch beds'
        });
    }
};
// Get beds by room
BedController.getBedsByRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const bedRepository = database_1.AppDataSource.getRepository(Bed_1.Bed);
        const beds = await bedRepository.find({
            where: { roomId },
            relations: ['currentAdmission', 'currentAdmission.patient'],
            order: { bedNumber: 'ASC' }
        });
        return res.json({
            success: true,
            beds
        });
    }
    catch (error) {
        console.error('Error fetching beds:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch beds'
        });
    }
};
// Get available beds
BedController.getAvailableBeds = async (req, res) => {
    try {
        const bedRepository = database_1.AppDataSource.getRepository(Bed_1.Bed);
        const beds = await bedRepository.find({
            where: { status: Bed_1.BedStatus.AVAILABLE },
            relations: ['room', 'room.ward'],
            order: { bedNumber: 'ASC' }
        });
        return res.json({
            success: true,
            beds
        });
    }
    catch (error) {
        console.error('Error fetching available beds:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch available beds'
        });
    }
};
// Get bed by ID
BedController.getBedById = async (req, res) => {
    try {
        const { id } = req.params;
        const bedRepository = database_1.AppDataSource.getRepository(Bed_1.Bed);
        const bed = await bedRepository.findOne({
            where: { id },
            relations: ['room', 'room.ward', 'currentAdmission', 'currentAdmission.patient']
        });
        if (!bed) {
            return res.status(404).json({
                success: false,
                message: 'Bed not found'
            });
        }
        return res.json({
            success: true,
            bed
        });
    }
    catch (error) {
        console.error('Error fetching bed:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch bed'
        });
    }
};
// Create new bed
BedController.createBed = async (req, res) => {
    try {
        const { bedNumber, roomId, notes } = req.body;
        // Validate required fields
        if (!bedNumber || !roomId) {
            return res.status(400).json({
                success: false,
                message: 'Bed number and room are required'
            });
        }
        const bedRepository = database_1.AppDataSource.getRepository(Bed_1.Bed);
        const roomRepository = database_1.AppDataSource.getRepository(Room_1.Room);
        // Check if bed number already exists
        const existingBed = await bedRepository.findOne({ where: { bedNumber } });
        if (existingBed) {
            return res.status(400).json({
                success: false,
                message: 'Bed number already exists'
            });
        }
        // Verify room exists
        const room = await roomRepository.findOne({ where: { id: roomId } });
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }
        // Create bed
        const bed = bedRepository.create({
            bedNumber,
            roomId,
            status: Bed_1.BedStatus.AVAILABLE,
            notes
        });
        await bedRepository.save(bed);
        return res.status(201).json({
            success: true,
            message: 'Bed created successfully',
            bed
        });
    }
    catch (error) {
        console.error('Error creating bed:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create bed'
        });
    }
};
// Update bed
BedController.updateBed = async (req, res) => {
    try {
        const { id } = req.params;
        const { bedNumber, roomId, status, notes } = req.body;
        const bedRepository = database_1.AppDataSource.getRepository(Bed_1.Bed);
        const bed = await bedRepository.findOne({ where: { id } });
        if (!bed) {
            return res.status(404).json({
                success: false,
                message: 'Bed not found'
            });
        }
        // Check if bed number is being changed and if it already exists
        if (bedNumber && bedNumber !== bed.bedNumber) {
            const existingBed = await bedRepository.findOne({ where: { bedNumber } });
            if (existingBed) {
                return res.status(400).json({
                    success: false,
                    message: 'Bed number already exists'
                });
            }
        }
        // Update fields
        if (bedNumber)
            bed.bedNumber = bedNumber;
        if (roomId)
            bed.roomId = roomId;
        if (status)
            bed.status = status;
        if (notes !== undefined)
            bed.notes = notes;
        await bedRepository.save(bed);
        return res.json({
            success: true,
            message: 'Bed updated successfully',
            bed
        });
    }
    catch (error) {
        console.error('Error updating bed:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update bed'
        });
    }
};
// Change bed status
BedController.changeBedStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }
        const bedRepository = database_1.AppDataSource.getRepository(Bed_1.Bed);
        const bed = await bedRepository.findOne({ where: { id } });
        if (!bed) {
            return res.status(404).json({
                success: false,
                message: 'Bed not found'
            });
        }
        bed.status = status;
        if (notes !== undefined)
            bed.notes = notes;
        await bedRepository.save(bed);
        return res.json({
            success: true,
            message: 'Bed status updated successfully',
            bed
        });
    }
    catch (error) {
        console.error('Error updating bed status:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update bed status'
        });
    }
};
// Delete bed
BedController.deleteBed = async (req, res) => {
    try {
        const { id } = req.params;
        const bedRepository = database_1.AppDataSource.getRepository(Bed_1.Bed);
        const bed = await bedRepository.findOne({
            where: { id },
            relations: ['currentAdmission']
        });
        if (!bed) {
            return res.status(404).json({
                success: false,
                message: 'Bed not found'
            });
        }
        // Check if bed is occupied
        if (bed.currentAdmission) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete occupied bed. Please discharge patient first.'
            });
        }
        await bedRepository.remove(bed);
        return res.json({
            success: true,
            message: 'Bed deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting bed:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete bed'
        });
    }
};
