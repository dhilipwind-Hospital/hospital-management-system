"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const Appointment_1 = require("../models/Appointment");
class UserController {
    // Reusable: build filtered query for users (admin)
    static buildUserQuery(repo = database_1.AppDataSource.getRepository(User_1.User), query) {
        const { role, search = '', status, sortBy = 'user.createdAt', sortOrder = 'DESC', } = query || {};
        const qb = repo.createQueryBuilder('user').orderBy(sortBy, String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC');
        if (role)
            qb.andWhere('user.role = :role', { role });
        if (status) {
            if (String(status).toLowerCase() === 'active')
                qb.andWhere('user.isActive = true');
            else if (String(status).toLowerCase() === 'inactive')
                qb.andWhere('user.isActive = false');
        }
        if (search) {
            qb.andWhere('(LOWER(user.firstName) LIKE :q OR LOWER(user.lastName) LIKE :q OR LOWER(user.email) LIKE :q OR user.phone LIKE :q2)', {
                q: `%${String(search).toLowerCase()}%`, q2: `%${String(search)}%`
            });
        }
        return qb;
    }
}
exports.UserController = UserController;
_a = UserController;
// Admin: list users with filters (role, search, status)
UserController.listUsers = async (req, res) => {
    const repo = database_1.AppDataSource.getRepository(User_1.User);
    const { page = '1', limit = '10', role, search = '', status, } = req.query;
    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = Math.min(parseInt(String(limit), 10) || 10, 100);
    const skip = (pageNum - 1) * limitNum;
    try {
        const qb = repo.createQueryBuilder('user')
            .orderBy('user.createdAt', 'DESC')
            .skip(skip)
            .take(limitNum);
        if (role)
            qb.andWhere('user.role = :role', { role });
        if (status) {
            if (String(status).toLowerCase() === 'active')
                qb.andWhere('user.isActive = true');
            else if (String(status).toLowerCase() === 'inactive')
                qb.andWhere('user.isActive = false');
        }
        if (search) {
            qb.andWhere('(LOWER(user.firstName) LIKE :q OR LOWER(user.lastName) LIKE :q OR LOWER(user.email) LIKE :q OR user.phone LIKE :q2)', {
                q: `%${String(search).toLowerCase()}%`, q2: `%${String(search)}%`
            });
        }
        const [items, total] = await qb.getManyAndCount();
        return res.json({ data: items, pagination: { total, page: pageNum, limit: limitNum } });
    }
    catch (e) {
        console.error('Error listing users:', e);
        return res.status(500).json({ message: 'Error listing users' });
    }
};
// Doctor: list patients under my care (seen via any appointment)
UserController.listDoctorPatients = async (req, res) => {
    var _b, _c;
    const doctorId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    const { page = '1', limit = '10', search = '', startDate, endDate } = req.query;
    if (!doctorId)
        return res.status(401).json({ message: 'Authentication required' });
    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = Math.min(parseInt(String(limit), 10) || 10, 100);
    const skip = (pageNum - 1) * limitNum;
    try {
        const apptRepo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
        const qb = apptRepo.createQueryBuilder('a')
            .leftJoin('a.patient', 'patient')
            .leftJoin('a.doctor', 'doctor')
            .where('doctor.id = :doctorId', { doctorId })
            .andWhere('patient.id IS NOT NULL')
            .select([
            'patient.id as id',
            'patient.firstName as firstName',
            'patient.lastName as lastName',
            'patient.email as email',
            'patient.phone as phone',
            'MAX(a.startTime) as lastVisit',
            'COUNT(*) as visitCount',
            "MIN(CASE WHEN a.startTime > NOW() THEN a.startTime ELSE NULL END) as nextVisit"
        ])
            .groupBy('patient.id, patient.firstName, patient.lastName, patient.email, patient.phone')
            .orderBy('lastVisit', 'DESC')
            .offset(skip)
            .limit(limitNum);
        if (startDate && endDate) {
            qb.andWhere('a.startTime BETWEEN :start AND :end', {
                start: new Date(String(startDate)),
                end: new Date(String(endDate))
            });
        }
        if (search) {
            qb.andHaving('(LOWER(patient.firstName) LIKE :q OR LOWER(patient.lastName) LIKE :q OR LOWER(patient.email) LIKE :q OR patient.phone LIKE :q2)', {
                q: `%${String(search).toLowerCase()}%`, q2: `%${String(search)}%`
            });
        }
        const rows = await qb.getRawMany();
        // Total distinct patients count
        const totalQb = apptRepo.createQueryBuilder('a')
            .leftJoin('a.patient', 'patient')
            .leftJoin('a.doctor', 'doctor')
            .where('doctor.id = :doctorId', { doctorId })
            .andWhere('patient.id IS NOT NULL')
            .andWhere(startDate && endDate ? 'a.startTime BETWEEN :start AND :end' : '1=1', startDate && endDate ? {
            start: new Date(String(startDate)),
            end: new Date(String(endDate))
        } : {})
            .select('COUNT(DISTINCT patient.id)', 'cnt');
        const total = parseInt(((_c = (await totalQb.getRawOne())) === null || _c === void 0 ? void 0 : _c.cnt) || '0', 10);
        return res.json({ data: rows, meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
    }
    catch (e) {
        console.error('List doctor patients error:', e);
        return res.status(500).json({ message: 'Failed to list patients' });
    }
};
// Doctor: export patients under my care to CSV
UserController.listDoctorPatientsCsv = async (req, res) => {
    var _b;
    const doctorId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    const { search = '', startDate, endDate } = req.query;
    if (!doctorId)
        return res.status(401).json({ message: 'Authentication required' });
    try {
        const apptRepo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
        const qb = apptRepo.createQueryBuilder('a')
            .leftJoin('a.patient', 'patient')
            .leftJoin('a.doctor', 'doctor')
            .where('doctor.id = :doctorId', { doctorId })
            .andWhere('patient.id IS NOT NULL')
            .select([
            'patient.firstName as firstName',
            'patient.lastName as lastName',
            'patient.email as email',
            'patient.phone as phone',
            'MAX(a.startTime) as lastVisit',
            'COUNT(*) as visitCount',
            "MIN(CASE WHEN a.startTime > NOW() THEN a.startTime ELSE NULL END) as nextVisit"
        ])
            .groupBy('patient.id, patient.firstName, patient.lastName, patient.email, patient.phone')
            .orderBy('lastVisit', 'DESC');
        if (startDate && endDate) {
            qb.andWhere('a.startTime BETWEEN :start AND :end', {
                start: new Date(String(startDate)),
                end: new Date(String(endDate))
            });
        }
        if (search) {
            qb.andHaving('(LOWER(patient.firstName) LIKE :q OR LOWER(patient.lastName) LIKE :q OR LOWER(patient.email) LIKE :q OR patient.phone LIKE :q2)', {
                q: `%${String(search).toLowerCase()}%`, q2: `%${String(search)}%`
            });
        }
        const rows = await qb.getRawMany();
        const header = ['First Name', 'Last Name', 'Email', 'Phone', 'Last Visit', 'Next Appointment', 'Visits'];
        const csv = [header, ...rows.map((r) => {
                var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
                return [
                    (_c = (_b = r.firstname) !== null && _b !== void 0 ? _b : r.firstName) !== null && _c !== void 0 ? _c : '',
                    (_e = (_d = r.lastname) !== null && _d !== void 0 ? _d : r.lastName) !== null && _e !== void 0 ? _e : '',
                    (_f = r.email) !== null && _f !== void 0 ? _f : '',
                    (_g = r.phone) !== null && _g !== void 0 ? _g : '',
                    ((_j = (_h = r.lastvisit) !== null && _h !== void 0 ? _h : r.lastVisit) !== null && _j !== void 0 ? _j : '') && new Date((_k = r.lastvisit) !== null && _k !== void 0 ? _k : r.lastVisit).toISOString(),
                    ((_m = (_l = r.nextvisit) !== null && _l !== void 0 ? _l : r.nextVisit) !== null && _m !== void 0 ? _m : '') && new Date((_o = r.nextvisit) !== null && _o !== void 0 ? _o : r.nextVisit).toISOString(),
                    String((_q = (_p = r.visitcount) !== null && _p !== void 0 ? _p : r.visitCount) !== null && _q !== void 0 ? _q : '0')
                ];
            })]
            .map(row => row.map(v => String(v !== null && v !== void 0 ? v : '').replace(/"/g, '""')).map(v => `"${v}"`).join(','))
            .join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="my-patients.csv"');
        return res.send(csv);
    }
    catch (e) {
        console.error('Export doctor patients CSV error:', e);
        return res.status(500).json({ message: 'Failed to export patients' });
    }
};
// Get current user profile
UserController.getCurrentUser = async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    const userRepository = database_1.AppDataSource.getRepository(User_1.User);
    try {
        const qb = userRepository
            .createQueryBuilder('u')
            .leftJoin('u.department', 'd')
            .leftJoin('u.primaryDepartment', 'pd')
            .where('u.id = :id', { id: userId })
            // Explicit user fields
            .select('u.id', 'id')
            .addSelect('u.firstName', 'firstName')
            .addSelect('u.lastName', 'lastName')
            .addSelect('u.email', 'email')
            .addSelect('u.phone', 'phone')
            .addSelect('u.role', 'role')
            .addSelect('u.dateOfBirth', 'dateOfBirth')
            .addSelect('u.gender', 'gender')
            .addSelect('u.address', 'address')
            .addSelect('u.city', 'city')
            .addSelect('u.state', 'state')
            .addSelect('u.country', 'country')
            .addSelect('u.postalCode', 'postalCode')
            .addSelect('u.profileImage', 'profileImage')
            .addSelect('u.isActive', 'isActive')
            .addSelect('u.createdAt', 'createdAt')
            .addSelect('u.updatedAt', 'updatedAt')
            // Patient ID fields
            .addSelect('u.globalPatientId', 'globalPatientId')
            .addSelect('u.locationCode', 'locationCode')
            .addSelect('u.registeredLocation', 'registeredLocation')
            .addSelect('u.registeredYear', 'registeredYear')
            .addSelect('u.patientSequenceNumber', 'patientSequenceNumber')
            // Department fields
            .addSelect('d.id', 'departmentId')
            .addSelect('d.name', 'departmentName')
            // Primary department fields
            .addSelect('pd.id', 'primaryDepartmentId')
            .addSelect('pd.name', 'primaryDepartmentName');
        const raw = await qb.getRawOne();
        if (!raw) {
            return res.status(404).json({ message: 'User not found' });
        }
        const payload = {
            id: raw.id,
            firstName: raw.firstName,
            lastName: raw.lastName,
            email: raw.email,
            phone: raw.phone,
            role: raw.role,
            dateOfBirth: raw.dateOfBirth,
            gender: raw.gender,
            address: raw.address,
            city: raw.city,
            state: raw.state,
            country: raw.country,
            postalCode: raw.postalCode,
            profileImage: raw.profileImage,
            isActive: !!raw.isActive,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            globalPatientId: raw.globalPatientId,
            locationCode: raw.locationCode,
            registeredLocation: raw.registeredLocation,
            registeredYear: raw.registeredYear,
            patientSequenceNumber: raw.patientSequenceNumber,
            department: raw.departmentId ? { id: raw.departmentId, name: raw.departmentName } : null,
            primaryDepartment: raw.primaryDepartmentId ? { id: raw.primaryDepartmentId, name: raw.primaryDepartmentName } : null,
        };
        return res.json(payload);
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ message: 'Error fetching user profile' });
    }
};
// Update user profile
UserController.updateProfile = async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    const updateData = req.body;
    if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    const userRepository = database_1.AppDataSource.getRepository(User_1.User);
    try {
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Update allowed fields
        const allowedUpdates = [
            'firstName', 'lastName', 'phone', 'dateOfBirth', 'gender',
            'address', 'city', 'state', 'country', 'postalCode', 'profileImage', 'preferences'
        ];
        allowedUpdates.forEach(field => {
            if (updateData[field] !== undefined) {
                user[field] = updateData[field];
            }
        });
        await userRepository.save(user);
        // Return updated user (excluding sensitive data)
        const { password, ...userData } = user;
        return res.json(userData);
    }
    catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ message: 'Error updating profile' });
    }
};
// Get user's appointments
UserController.getUserAppointments = async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    const { status, startDate, endDate } = req.query;
    if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    const userRepository = database_1.AppDataSource.getRepository(User_1.User);
    try {
        const user = await userRepository.findOne({
            where: { id: userId },
            relations: [
                'appointments',
                'appointments.service',
                'appointments.doctor'
            ]
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        let appointments = user.appointments || [];
        // Apply filters
        if (status) {
            appointments = appointments.filter(a => a.status === status);
        }
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            appointments = appointments.filter(a => {
                const apptDate = new Date(a.startTime);
                return apptDate >= start && apptDate <= end;
            });
        }
        // Sort by start time (newest first)
        appointments.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        return res.json(appointments);
    }
    catch (error) {
        console.error('Error fetching user appointments:', error);
        return res.status(500).json({ message: 'Error fetching appointments' });
    }
};
// Get user's medical records (placeholder - to be implemented)
UserController.getMedicalRecords = async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    // This is a placeholder implementation
    // In a real application, this would fetch medical records from a records service
    try {
        // Return empty array for now
        return res.json([]);
    }
    catch (error) {
        console.error('Error fetching medical records:', error);
        return res.status(500).json({ message: 'Error fetching medical records' });
    }
};
// Admin: update any user's profile and role/status
UserController.adminUpdateUser = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body || {};
    const userRepository = database_1.AppDataSource.getRepository(User_1.User);
    try {
        const user = await userRepository.findOne({ where: { id } });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const allowed = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'gender', 'address', 'city', 'state', 'country', 'postalCode', 'profileImage', 'preferences', 'role', 'isActive', 'departmentId', 'primaryDepartmentId'];
        for (const key of allowed) {
            if (updateData[key] !== undefined) {
                user[key] = updateData[key];
            }
        }
        await userRepository.save(user);
        const { password, ...rest } = user;
        return res.json(rest);
    }
    catch (e) {
        console.error('Admin update user error:', e);
        return res.status(500).json({ message: 'Failed to update user' });
    }
};
// Admin: get user by id
UserController.adminGetUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const repo = database_1.AppDataSource.getRepository(User_1.User);
        const user = await repo.findOne({ where: { id } });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        return res.json(user);
    }
    catch (e) {
        console.error('Admin get user error:', e);
        return res.status(500).json({ message: 'Failed to get user' });
    }
};
// Admin: create user (patient by default)
UserController.adminCreateUser = async (req, res) => {
    const repo = database_1.AppDataSource.getRepository(User_1.User);
    try {
        const { firstName, lastName, email, phone, role = 'patient', isActive = true, password } = req.body || {};
        if (!firstName || !lastName || !phone) {
            return res.status(400).json({ message: 'firstName, lastName and phone are required' });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ message: 'email is required' });
        }
        const exists = await repo.findOne({ where: { email } });
        if (exists)
            return res.status(409).json({ message: 'Email already exists' });
        const user = new User_1.User();
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.phone = phone;
        user.role = role;
        user.isActive = Boolean(isActive);
        // Use provided password or generate a random one
        user.password = password || (Math.random().toString(36).slice(2) + 'A1!');
        if (typeof user.hashPassword === 'function')
            await user.hashPassword();
        const saved = await repo.save(user);
        const { password: _, ...rest } = saved;
        return res.status(201).json(rest);
    }
    catch (e) {
        console.error('Admin create user error:', e);
        return res.status(500).json({ message: 'Failed to create user' });
    }
};
// Admin: delete user
UserController.adminDeleteUser = async (req, res) => {
    const { id } = req.params;
    const repo = database_1.AppDataSource.getRepository(User_1.User);
    try {
        const user = await repo.findOne({ where: { id } });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        await repo.remove(user);
        return res.json({ message: 'User deleted' });
    }
    catch (e) {
        console.error('Admin delete user error:', e);
        return res.status(500).json({ message: 'Failed to delete user' });
    }
};
// Admin: bulk delete users
UserController.adminBulkDeleteUsers = async (req, res) => {
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || !ids.length)
        return res.status(400).json({ message: 'ids is required' });
    const repo = database_1.AppDataSource.getRepository(User_1.User);
    try {
        const users = await repo.findByIds(ids);
        if (!users.length)
            return res.json({ deleted: 0 });
        await repo.remove(users);
        return res.json({ deleted: users.length });
    }
    catch (e) {
        console.error('Admin bulk delete users error:', e);
        return res.status(500).json({ message: 'Failed to bulk delete users' });
    }
};
// Admin: export users CSV (defaults to role=patient)
UserController.exportUsersCsv = async (req, res) => {
    const repo = database_1.AppDataSource.getRepository(User_1.User);
    try {
        const qb = UserController.buildUserQuery(repo, { ...req.query, role: req.query.role || 'patient' });
        const users = await qb.getMany();
        const rows = [
            ['First Name', 'Last Name', 'Email', 'Phone', 'Gender', 'Status', 'Created At'],
            ...users.map(u => { var _b, _c; return [u.firstName, u.lastName, u.email || '', u.phone || '', u.gender || '', u.isActive ? 'active' : 'inactive', ((_c = (_b = u.createdAt) === null || _b === void 0 ? void 0 : _b.toISOString) === null || _c === void 0 ? void 0 : _c.call(_b)) || '']; })
        ];
        const csv = rows.map(r => r.map(v => String(v !== null && v !== void 0 ? v : '').replace(/"/g, '""')).map(v => `"${v}"`).join(',')).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="patients.csv"');
        return res.send(csv);
    }
    catch (e) {
        console.error('Export users CSV error:', e);
        return res.status(500).json({ message: 'Failed to export users' });
    }
};
// Admin: upload user photo
UserController.uploadUserPhoto = async (req, res) => {
    const { id } = req.params;
    const file = req.file;
    if (!file)
        return res.status(400).json({ message: 'No file uploaded' });
    try {
        const repo = database_1.AppDataSource.getRepository(User_1.User);
        const user = await repo.findOne({ where: { id } });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        // Save relative URL for static serving
        const photoUrl = `/uploads/${file.filename}`;
        user.profileImage = photoUrl;
        await repo.save(user);
        return res.json({ photoUrl });
    }
    catch (e) {
        console.error('Upload user photo error:', e);
        return res.status(500).json({ message: 'Failed to upload photo' });
    }
};
// Self: upload my photo
UserController.uploadMyPhoto = async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    const file = req.file;
    if (!userId)
        return res.status(401).json({ message: 'Authentication required' });
    if (!file)
        return res.status(400).json({ message: 'No file uploaded' });
    try {
        const repo = database_1.AppDataSource.getRepository(User_1.User);
        const user = await repo.findOne({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const photoUrl = `/uploads/${file.filename}`;
        user.profileImage = photoUrl;
        await repo.save(user);
        return res.json({ photoUrl });
    }
    catch (e) {
        console.error('Upload my photo error:', e);
        return res.status(500).json({ message: 'Failed to upload photo' });
    }
};
