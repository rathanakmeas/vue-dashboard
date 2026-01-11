import Employee from '../models/Employee.js';
import Department from '../models/Department.js';
import { logActivity } from '../utils/activityLogger.js';
import path from 'path';
import fs from 'fs';

// Get all employees with filtering and pagination
export const getEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const search = req.query.search?.trim();
    const department = req.query.department;
    const status = req.query.status;
    const employmentType = req.query.employmentType;
    const position = req.query.position;
    
    let filter = {};
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department) filter.department = department;
    if (status) filter.employmentStatus = status;
    if (employmentType) filter.employmentType = employmentType;
    if (position) filter.position = { $regex: position, $options: 'i' };
    
    const total = await Employee.countDocuments(filter);
    
    const employees = await Employee.find(filter)
      .populate('department', 'code name category')
      .populate('supervisor', 'employeeId firstName lastName position')
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    
    res.json({
      employees,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single employee
export const getEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await Employee.findOne({
      $or: [{ _id: id }, { employeeId: id.toUpperCase() }]
    })
      .populate('department', 'code name category')
      .populate('supervisor', 'employeeId firstName lastName position')
      .populate('userId', 'username email')
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create employee
export const createEmployee = async (req, res) => {
  try {
    const employeeData = {
      ...req.body,
      createdBy: req.userId,
      updatedBy: req.userId
    };
    
    const employee = await Employee.create(employeeData);
    
    await logActivity(
      req.userId,
      'EMPLOYEE_CREATE',
      'EMPLOYEE',
      employee._id,
      { employeeId: employee.employeeId, name: employee.fullName },
      req.ip,
      req.headers['user-agent']
    );
    
    const populated = await Employee.findById(employee._id)
      .populate('department', 'code name category')
      .populate('supervisor', 'employeeId firstName lastName position');
    
    res.status(201).json({ message: 'Employee created successfully', employee: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Employee ID or email already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update employee
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await Employee.findOneAndUpdate(
      { $or: [{ _id: id }, { employeeId: id.toUpperCase() }] },
      { ...req.body, updatedBy: req.userId },
      { new: true, runValidators: true }
    )
      .populate('department', 'code name category')
      .populate('supervisor', 'employeeId firstName lastName position');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    await logActivity(
      req.userId,
      'EMPLOYEE_UPDATE',
      'EMPLOYEE',
      employee._id,
      { employeeId: employee.employeeId, name: employee.fullName },
      req.ip,
      req.headers['user-agent']
    );
    
    res.json({ message: 'Employee updated successfully', employee });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete employee (soft delete by changing status)
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await Employee.findOneAndUpdate(
      { $or: [{ _id: id }, { employeeId: id.toUpperCase() }] },
      { employmentStatus: 'Terminated', endDate: new Date(), updatedBy: req.userId },
      { new: true }
    );
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    await logActivity(
      req.userId,
      'EMPLOYEE_DELETE',
      'EMPLOYEE',
      employee._id,
      { employeeId: employee.employeeId, name: employee.fullName },
      req.ip,
      req.headers['user-agent']
    );
    
    res.json({ message: 'Employee terminated successfully', employee });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get employee statistics
export const getEmployeeStats = async (req, res) => {
  try {
    const [
      totalCount,
      activeCount,
      byDepartment,
      byEmploymentType,
      byPosition,
      recentHires
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ employmentStatus: 'Active' }),
      Employee.aggregate([
        { $match: { employmentStatus: 'Active' } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: 'code',
          as: 'deptInfo'
        }},
        { $unwind: '$deptInfo' },
        { $project: {
          department: '$deptInfo.name',
          code: '$_id',
          count: 1
        }},
        { $sort: { count: -1 } }
      ]),
      Employee.aggregate([
        { $match: { employmentStatus: 'Active' } },
        { $group: { _id: '$employmentType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Employee.aggregate([
        { $match: { employmentStatus: 'Active' } },
        { $group: { _id: '$position', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Employee.find({ employmentStatus: 'Active' })
        .sort({ hireDate: -1 })
        .limit(5)
        .populate('department', 'code name')
        .select('employeeId firstName lastName position hireDate')
    ]);
    
    res.json({
      total: totalCount,
      active: activeCount,
      onLeave: await Employee.countDocuments({ employmentStatus: 'On Leave' }),
      terminated: await Employee.countDocuments({ employmentStatus: 'Terminated' }),
      byDepartment,
      byEmploymentType,
      byPosition,
      recentHires
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Bulk operations
export const bulkUpdateEmployees = async (req, res) => {
  try {
    const { employeeIds, updates } = req.body;
    
    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({ message: 'Employee IDs array required' });
    }
    
    const result = await Employee.updateMany(
      { employeeId: { $in: employeeIds } },
      { ...updates, updatedBy: req.userId }
    );
    
    await logActivity(
      req.userId,
      'EMPLOYEE_BULK_UPDATE',
      'EMPLOYEE',
      null,
      { count: result.modifiedCount, employeeIds },
      req.ip,
      req.headers['user-agent']
    );
    
    res.json({ 
      message: `${result.modifiedCount} employees updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get employees by department
export const getEmployeesByDepartment = async (req, res) => {
  try {
    const { departmentCode } = req.params;
    
    const employees = await Employee.find({
      department: departmentCode,
      employmentStatus: 'Active'
    })
      .populate('supervisor', 'employeeId firstName lastName')
      .sort({ lastName: 1, firstName: 1 });
    
    res.json({ employees, count: employees.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload employee photo
export const uploadEmployeePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No photo file provided' });
    }
    
    const employee = await Employee.findById(id);
    if (!employee) {
      // Delete uploaded file if employee not found
      if (req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Delete old photo if exists
    if (employee.photo) {
      const oldPhotoPath = path.join(__dirname, '..', employee.photo);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }
    
    // Update employee with new photo path
    const photoPath = `/uploads/employees/${req.file.filename}`;
    employee.photo = photoPath;
    await employee.save();
    
    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'update',
      resourceType: 'employee',
      resourceId: employee._id,
      description: `Updated photo for employee ${employee.employeeId} - ${employee.firstName} ${employee.lastName}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    res.json({
      message: 'Photo uploaded successfully',
      photo: photoPath,
      employee: employee
    });
  } catch (error) {
    // Delete uploaded file if error occurs
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete employee photo
export const deleteEmployeePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    if (!employee.photo) {
      return res.status(400).json({ message: 'Employee has no photo' });
    }
    
    // Delete photo file
    const photoPath = path.join(__dirname, '..', employee.photo);
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }
    
    // Update employee
    employee.photo = null;
    await employee.save();
    
    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'update',
      resourceType: 'employee',
      resourceId: employee._id,
      description: `Deleted photo for employee ${employee.employeeId} - ${employee.firstName} ${employee.lastName}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    res.json({
      message: 'Photo deleted successfully',
      employee: employee
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
