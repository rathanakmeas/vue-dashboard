import Department from '../models/Department.js';
import DEPARTMENTS, { buildDepartmentTree, getDepartmentByCode, getChildDepartments } from '../config/departments.js';
import { logActivity } from '../utils/activityLogger.js';

// Initialize departments from config
export const initializeDepartments = async (req, res) => {
  try {
    const count = await Department.countDocuments();
    
    if (count === 0) {
      await Department.insertMany(DEPARTMENTS);
      return res.json({ message: 'Departments initialized', count: DEPARTMENTS.length });
    }
    
    res.json({ message: 'Departments already initialized', count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all departments with pagination and tree structure
export const getDepartments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 50;
    const search = req.query.search?.trim();
    const category = req.query.category;
    const status = req.query.status;
    const tree = req.query.tree === 'true';
    
    let filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    
    const total = await Department.countDocuments(filter);
    
    if (tree) {
      // Return tree structure
      const allDepts = await Department.find(filter).populate('head', 'username email').sort({ order: 1, name: 1 });
      const treeData = buildTree(allDepts);
      return res.json({ 
        departments: treeData, 
        total,
        page: 1,
        pageSize: total
      });
    }
    
    // Return paginated flat list
    const departments = await Department.find(filter)
      .populate('head', 'username email')
      .sort({ order: 1, name: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    
    res.json({ 
      departments, 
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Build tree structure from flat array
const buildTree = (departments) => {
  const lookup = {};
  const tree = [];
  
  // Create lookup
  departments.forEach(dept => {
    lookup[dept.code] = { ...dept.toObject(), children: [] };
  });
  
  // Build tree
  departments.forEach(dept => {
    if (dept.parent) {
      if (lookup[dept.parent]) {
        lookup[dept.parent].children.push(lookup[dept.code]);
      }
    } else {
      tree.push(lookup[dept.code]);
    }
  });
  
  return tree;
};

// Get single department
export const getDepartment = async (req, res) => {
  try {
    const { code } = req.params;
    const department = await Department.findOne({ code }).populate('head', 'username email firstName lastName');
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Get children
    const children = await Department.find({ parent: code }).populate('head', 'username email');
    
    res.json({ department, children });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new department
export const createDepartment = async (req, res) => {
  try {
    const { code, name, category, parent, description, status, head, email, phone, 
            extension, location, floor, building, staffCount, budget, order } = req.body;
    
    if (!code || !name || !category) {
      return res.status(400).json({ message: 'Code, name, and category are required' });
    }
    
    // Check if code already exists
    const existing = await Department.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'Department code already exists' });
    }
    
    // Validate parent exists
    if (parent) {
      const parentDept = await Department.findOne({ code: parent });
      if (!parentDept) {
        return res.status(400).json({ message: 'Parent department not found' });
      }
    }
    
    const department = await Department.create({
      code: code.toUpperCase(),
      name,
      category,
      parent: parent || null,
      description: description || '',
      status: status || 'active',
      head: head || null,
      email: email || '',
      phone: phone || '',
      extension: extension || '',
      location: location || '',
      floor: floor || '',
      building: building || '',
      staffCount: staffCount || 0,
      budget: budget || 0,
      order: order || 0
    });
    
    await logActivity(
      req.userId,
      'DEPARTMENT_CREATE',
      'DEPARTMENT',
      department._id,
      { code: department.code, name: department.name },
      req.ip,
      req.headers['user-agent']
    );
    
    res.status(201).json({ message: 'Department created', department });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update department
export const updateDepartment = async (req, res) => {
  try {
    const { code } = req.params;
    const updates = req.body;
    
    const department = await Department.findOne({ code });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Prevent changing code
    delete updates.code;
    
    // Validate parent if being updated
    if (updates.parent) {
      if (updates.parent === code) {
        return res.status(400).json({ message: 'Department cannot be its own parent' });
      }
      const parentDept = await Department.findOne({ code: updates.parent });
      if (!parentDept) {
        return res.status(400).json({ message: 'Parent department not found' });
      }
    }
    
    Object.assign(department, updates);
    await department.save();
    
    await logActivity(
      req.userId,
      'DEPARTMENT_UPDATE',
      'DEPARTMENT',
      department._id,
      { code: department.code, name: department.name },
      req.ip,
      req.headers['user-agent']
    );
    
    res.json({ message: 'Department updated', department });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete department
export const deleteDepartment = async (req, res) => {
  try {
    const { code } = req.params;
    
    const department = await Department.findOne({ code });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check for children
    const children = await Department.find({ parent: code });
    if (children.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete department with children. Please reassign or delete child departments first.',
        children: children.map(c => ({ code: c.code, name: c.name }))
      });
    }
    
    await Department.deleteOne({ code });
    
    await logActivity(
      req.userId,
      'DEPARTMENT_DELETE',
      'DEPARTMENT',
      department._id,
      { code: department.code, name: department.name },
      req.ip,
      req.headers['user-agent']
    );
    
    res.json({ message: 'Department deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get department statistics
export const getDepartmentStats = async (req, res) => {
  try {
    const total = await Department.countDocuments();
    const active = await Department.countDocuments({ status: 'active' });
    const inactive = await Department.countDocuments({ status: 'inactive' });
    
    const byCategory = await Department.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const withChildren = await Department.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'code',
          foreignField: 'parent',
          as: 'children'
        }
      },
      {
        $match: {
          'children.0': { $exists: true }
        }
      },
      { $count: 'count' }
    ]);
    
    res.json({
      total,
      active,
      inactive,
      byCategory,
      withChildren: withChildren[0]?.count || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
