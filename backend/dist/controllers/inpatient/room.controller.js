"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomController = void 0;
const database_1 = require("../../config/database");
const Room_1 = require("../../models/inpatient/Room");
const Ward_1 = require("../../models/inpatient/Ward");
class RoomController {
}
exports.RoomController = RoomController;
_a = RoomController;
// Get all rooms
RoomController.getAllRooms = async (req, res) => {
    try {
        const roomRepository = database_1.AppDataSource.getRepository(Room_1.Room);
        const rooms = await roomRepository.find({
            relations: ['ward', 'beds'],
            order: { roomNumber: 'ASC' }
        });
        return res.json({
            success: true,
            rooms
        });
    }
    catch (error) {
        console.error('Error fetching rooms:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch rooms'
        });
    }
};
// Get rooms by ward
RoomController.getRoomsByWard = async (req, res) => {
    try {
        const { wardId } = req.params;
        const roomRepository = database_1.AppDataSource.getRepository(Room_1.Room);
        const rooms = await roomRepository.find({
            where: { wardId },
            relations: ['beds'],
            order: { roomNumber: 'ASC' }
        });
        return res.json({
            success: true,
            rooms
        });
    }
    catch (error) {
        console.error('Error fetching rooms:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch rooms'
        });
    }
};
// Get room by ID
RoomController.getRoomById = async (req, res) => {
    try {
        const { id } = req.params;
        const roomRepository = database_1.AppDataSource.getRepository(Room_1.Room);
        const room = await roomRepository.findOne({
            where: { id },
            relations: ['ward', 'beds', 'beds.currentAdmission']
        });
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }
        return res.json({
            success: true,
            room
        });
    }
    catch (error) {
        console.error('Error fetching room:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch room'
        });
    }
};
// Create new room
RoomController.createRoom = async (req, res) => {
    try {
        const { roomNumber, wardId, roomType, capacity, dailyRate, features } = req.body;
        // Validate required fields
        if (!roomNumber || !wardId || !capacity || !dailyRate) {
            return res.status(400).json({
                success: false,
                message: 'Room number, ward, capacity, and daily rate are required'
            });
        }
        const roomRepository = database_1.AppDataSource.getRepository(Room_1.Room);
        const wardRepository = database_1.AppDataSource.getRepository(Ward_1.Ward);
        // Check if room number already exists
        const existingRoom = await roomRepository.findOne({ where: { roomNumber } });
        if (existingRoom) {
            return res.status(400).json({
                success: false,
                message: 'Room number already exists'
            });
        }
        // Verify ward exists
        const ward = await wardRepository.findOne({ where: { id: wardId } });
        if (!ward) {
            return res.status(404).json({
                success: false,
                message: 'Ward not found'
            });
        }
        // Create room
        const room = roomRepository.create({
            roomNumber,
            wardId,
            roomType: roomType || Room_1.RoomType.GENERAL,
            capacity,
            dailyRate,
            features
        });
        await roomRepository.save(room);
        return res.status(201).json({
            success: true,
            message: 'Room created successfully',
            room
        });
    }
    catch (error) {
        console.error('Error creating room:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create room'
        });
    }
};
// Update room
RoomController.updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { roomNumber, wardId, roomType, capacity, dailyRate, features, isActive } = req.body;
        const roomRepository = database_1.AppDataSource.getRepository(Room_1.Room);
        const room = await roomRepository.findOne({ where: { id } });
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }
        // Check if room number is being changed and if it already exists
        if (roomNumber && roomNumber !== room.roomNumber) {
            const existingRoom = await roomRepository.findOne({ where: { roomNumber } });
            if (existingRoom) {
                return res.status(400).json({
                    success: false,
                    message: 'Room number already exists'
                });
            }
        }
        // Update fields
        if (roomNumber)
            room.roomNumber = roomNumber;
        if (wardId)
            room.wardId = wardId;
        if (roomType)
            room.roomType = roomType;
        if (capacity)
            room.capacity = capacity;
        if (dailyRate)
            room.dailyRate = dailyRate;
        if (features !== undefined)
            room.features = features;
        if (isActive !== undefined)
            room.isActive = isActive;
        await roomRepository.save(room);
        return res.json({
            success: true,
            message: 'Room updated successfully',
            room
        });
    }
    catch (error) {
        console.error('Error updating room:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update room'
        });
    }
};
// Delete room
RoomController.deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const roomRepository = database_1.AppDataSource.getRepository(Room_1.Room);
        const room = await roomRepository.findOne({
            where: { id },
            relations: ['beds']
        });
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }
        // Check if room has beds
        if (room.beds && room.beds.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete room with existing beds. Please delete beds first.'
            });
        }
        await roomRepository.remove(room);
        return res.json({
            success: true,
            message: 'Room deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting room:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete room'
        });
    }
};
