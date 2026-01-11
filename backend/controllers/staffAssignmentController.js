import StaffAssignment from '../models/StaffAssignment.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
import { logActivity } from '../utils/activityLogger.js';

// Get staff for a department
export const getDepartmentStaff = async (req, res) => {
  try {
    const { code } = req.params;
    const assignments = await StaffAssignment.find({ department: code, isActive: true })
      .populate('user', 'username email firstName lastName')
      .sort({ role: 1, startDate: 1 });
    
    res.json({ assignments });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch staff', error: error.message });
  }
};

// Assign staff to department
export const assignStaff = async (req, res) => {
  try {
    const { userId, departmentCode, role, permissions, notes } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if department exists
    const dept = await Department.findOne({ code: departmentCode });
    if (!dept) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check existing assignment
    const existing = await StaffAssignment.findOne({
      user: userId,
      department: departmentCode,
      isActive: true
    });
    
    if (existing) {
      return res.status(400).json({ message: 'User already assigned to this department' });
    }
    
    const assignment = await StaffAssignment.create({
      user: userId,
      department: departmentCode,
      role: role || 'staff',
      permissions: permissions || ['view'],
      notes: notes || ''
    });
    
    // Update staff count
    await Department.updateOne(
      { code: departmentCode },
      { $inc: { staffCount: 1 } }
    );
    
    await logActivity(
      req.userId,
      'STAFF_ASSIGNED',
      'DEPARTMENT',
      dept._id,
      { user: user.username, department: departmentCode, role },
      req.ip,
      req.headers['user-agent']
    );
    
    const populated = await StaffAssignment.findById(assignment._id)
      .populate('user', 'username email firstName lastName');
    
    res.status(201).json({ message: 'Staff assigned', assignment: populated });
  } catch (error) {
    res.status(500).json({ message: 'Assignment failed', error: error.message });
  }
};

// Update staff assignment
export const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const assignment = await StaffAssignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    Object.assign(assignment, updates);
    await assignment.save();
    
    await logActivity(
      req.userId,
      'STAFF_ASSIGNMENT_UPDATED',
      'DEPARTMENT',
      null,
      { assignmentId: id, updates },
      req.ip,
      req.headers['user-agent']
    );
    
    const populated = await StaffAssignment.findById(id)
      .populate('user', 'username email firstName lastName');
    
    res.json({ message: 'Assignment updated', assignment: populated });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

// Remove staff from department
export const removeStaff = async (req, res) => {
  try {
    const { id } = req.params;
    
    const assignment = await StaffAssignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    assignment.isActive = false;
    assignment.endDate = new Date();
    await assignment.save();
    
    // Update staff count
    await Department.updateOne(
      { code: assignment.department },
      { $inc: { staffCount: -1 } }
    );
    
    await logActivity(
      req.userId,
      'STAFF_REMOVED',
      'DEPARTMENT',
      null,
      { assignmentId: id, department: assignment.department },
      req.ip,
      req.headers['user-agent']
    );
    
    res.json({ message: 'Staff removed' });
  } catch (error) {
    res.status(500).json({ message: 'Removal failed', error: error.message });
  }
};

// Transfer staff between departments
export const transferStaff = async (req, res) => {
  try {
    const { userId, fromDept, toDept, role, notes } = req.body;
    
    // Deactivate old assignment
    const oldAssignment = await StaffAssignment.findOne({
      user: userId,
      department: fromDept,
      isActive: true
    });
    
    if (oldAssignment) {
      oldAssignment.isActive = false;
      oldAssignment.endDate = new Date();
      await oldAssignment.save();
      
      await Department.updateOne({ code: fromDept }, { $inc: { staffCount: -1 } });
    }
    
    // Create new assignment
    const newAssignment = await StaffAssignment.create({
      user: userId,
      department: toDept,
      role: role || 'staff',
      notes: notes || `Transferred from ${fromDept}`
    });
    
    await Department.updateOne({ code: toDept }, { $inc: { staffCount: 1 } });
    
    await logActivity(
      req.userId,
      'STAFF_TRANSFERRED',
      'DEPARTMENT',
      null,
      { userId, fromDept, toDept },
      req.ip,
      req.headers['user-agent']
    );
    
    const populated = await StaffAssignment.findById(newAssignment._id)
      .populate('user', 'username email firstName lastName');
    
    res.json({ message: 'Staff transferred', assignment: populated });
  } catch (error) {
    res.status(500).json({ message: 'Transfer failed', error: error.message });
  }
};

// Get user's departments
export const getUserDepartments = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const assignments = await StaffAssignment.find({ user: userId, isActive: true })
      .sort({ startDate: -1 });
    
    const deptCodes = assignments.map(a => a.department);
    const departments = await Department.find({ code: { $in: deptCodes } });
    
    const result = assignments.map(a => ({
      assignment: a,
      department: departments.find(d => d.code === a.department)
    }));
    
    res.json({ assignments: result });
  } catch (error) {
    res.status(500).json({ message: 'Fetch failed', error: error.message });
  }
};
