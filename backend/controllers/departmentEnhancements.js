import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

// Export departments to Excel
export const exportToExcel = async (req, res) => {
  try {
    const Department = (await import('../models/Department.js')).default;
    const departments = await Department.find().populate('head', 'username email').sort({ order: 1, name: 1 });
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Departments');
    
    // Define columns
    worksheet.columns = [
      { header: 'Code', key: 'code', width: 15 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Parent', key: 'parent', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Extension', key: 'extension', width: 12 },
      { header: 'Location', key: 'location', width: 20 },
      { header: 'Floor', key: 'floor', width: 10 },
      { header: 'Building', key: 'building', width: 15 },
      { header: 'Staff Count', key: 'staffCount', width: 12 },
      { header: 'Budget', key: 'budget', width: 15 },
      { header: 'Head', key: 'head', width: 20 },
      { header: 'Order', key: 'order', width: 10 }
    ];
    
    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font.color = { argb: 'FFFFFFFF' };
    
    // Add data
    departments.forEach(dept => {
      worksheet.addRow({
        code: dept.code,
        name: dept.name,
        category: dept.category,
        parent: dept.parent || '',
        status: dept.status,
        description: dept.description || '',
        email: dept.email || '',
        phone: dept.phone || '',
        extension: dept.extension || '',
        location: dept.location || '',
        floor: dept.floor || '',
        building: dept.building || '',
        staffCount: dept.staffCount || 0,
        budget: dept.budget || 0,
        head: dept.head?.username || '',
        order: dept.order || 0
      });
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=departments.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Export failed', error: error.message });
  }
};

// Import departments from Excel
export const importFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const Department = (await import('../models/Department.js')).default;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    
    const worksheet = workbook.getWorksheet(1);
    const departments = [];
    const errors = [];
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      
      try {
        const dept = {
          code: row.getCell(1).value?.toString().toUpperCase(),
          name: row.getCell(2).value?.toString(),
          category: row.getCell(3).value?.toString(),
          parent: row.getCell(4).value?.toString() || null,
          status: row.getCell(5).value?.toString() || 'active',
          description: row.getCell(6).value?.toString() || '',
          email: row.getCell(7).value?.toString() || '',
          phone: row.getCell(8).value?.toString() || '',
          extension: row.getCell(9).value?.toString() || '',
          location: row.getCell(10).value?.toString() || '',
          floor: row.getCell(11).value?.toString() || '',
          building: row.getCell(12).value?.toString() || '',
          staffCount: parseInt(row.getCell(13).value) || 0,
          budget: parseFloat(row.getCell(14).value) || 0,
          order: parseInt(row.getCell(16).value) || 0
        };
        
        if (!dept.code || !dept.name || !dept.category) {
          errors.push({ row: rowNumber, error: 'Missing required fields' });
        } else {
          departments.push(dept);
        }
      } catch (err) {
        errors.push({ row: rowNumber, error: err.message });
      }
    });
    
    // Insert departments
    const results = await Department.insertMany(departments, { ordered: false }).catch(err => {
      // Handle duplicate errors
      if (err.code === 11000) {
        return { insertedCount: err.insertedDocs?.length || 0 };
      }
      throw err;
    });
    
    res.json({
      message: 'Import completed',
      imported: departments.length,
      errors: errors.length,
      errorDetails: errors
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: 'Import failed', error: error.message });
  }
};

// Export org chart as PDF
export const exportOrgChartPDF = async (req, res) => {
  try {
    const Department = (await import('../models/Department.js')).default;
    const departments = await Department.find({ status: 'active' }).populate('head', 'username').sort({ order: 1 });
    
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=org-chart.pdf');
    
    doc.pipe(res);
    
    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('Hospital Organizational Chart', { align: 'center' });
    doc.moveDown(2);
    
    // Build tree
    const buildTree = (depts) => {
      const lookup = {};
      const tree = [];
      depts.forEach(d => { lookup[d.code] = { ...d.toObject(), children: [] }; });
      depts.forEach(d => {
        if (d.parent && lookup[d.parent]) {
          lookup[d.parent].children.push(lookup[d.code]);
        } else if (!d.parent) {
          tree.push(lookup[d.code]);
        }
      });
      return tree;
    };
    
    const tree = buildTree(departments);
    
    // Render tree
    const renderNode = (node, level = 0, yPos) => {
      const indent = level * 30;
      const x = 50 + indent;
      
      if (yPos > 500) {
        doc.addPage();
        yPos = 50;
      }
      
      doc.fontSize(10).font('Helvetica-Bold')
         .text(`${node.code}`, x, yPos, { continued: true })
         .font('Helvetica')
         .text(` - ${node.name}`);
      
      if (node.head) {
        doc.fontSize(8).fillColor('#666')
           .text(`Head: ${node.head.username}`, x + 10, yPos + 15);
      }
      
      yPos += 30;
      
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          yPos = renderNode(child, level + 1, yPos);
        });
      }
      
      doc.fillColor('#000');
      return yPos;
    };
    
    let currentY = 100;
    tree.forEach(root => {
      currentY = renderNode(root, 0, currentY);
      currentY += 20;
    });
    
    doc.end();
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ message: 'PDF export failed', error: error.message });
  }
};

// Bulk operations
export const bulkUpdate = async (req, res) => {
  try {
    const { codes, updates } = req.body;
    const Department = (await import('../models/Department.js')).default;
    const { logActivity } = await import('../utils/activityLogger.js');
    
    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return res.status(400).json({ message: 'No departments selected' });
    }
    
    const result = await Department.updateMany(
      { code: { $in: codes } },
      { $set: updates }
    );
    
    // Log activity for each
    for (const code of codes) {
      await logActivity(
        req.userId,
        'DEPARTMENT_BULK_UPDATE',
        'DEPARTMENT',
        null,
        { code, updates },
        req.ip,
        req.headers['user-agent']
      );
    }
    
    res.json({
      message: 'Bulk update completed',
      modified: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Bulk update failed', error: error.message });
  }
};

export const bulkDelete = async (req, res) => {
  try {
    const { codes } = req.body;
    const Department = (await import('../models/Department.js')).default;
    const { logActivity } = await import('../utils/activityLogger.js');
    
    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return res.status(400).json({ message: 'No departments selected' });
    }
    
    // Check for children
    const hasChildren = await Department.find({ parent: { $in: codes } });
    if (hasChildren.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete departments with children',
        children: hasChildren.map(c => ({ code: c.code, name: c.name, parent: c.parent }))
      });
    }
    
    const result = await Department.deleteMany({ code: { $in: codes } });
    
    // Log deletions
    for (const code of codes) {
      await logActivity(
        req.userId,
        'DEPARTMENT_BULK_DELETE',
        'DEPARTMENT',
        null,
        { code },
        req.ip,
        req.headers['user-agent']
      );
    }
    
    res.json({
      message: 'Bulk delete completed',
      deleted: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Bulk delete failed', error: error.message });
  }
};

// Reorder departments
export const reorderDepartments = async (req, res) => {
  try {
    const { orders } = req.body; // [{ code: 'ADM', order: 1 }, ...]
    const Department = (await import('../models/Department.js')).default;
    
    const bulkOps = orders.map(({ code, order }) => ({
      updateOne: {
        filter: { code },
        update: { $set: { order } }
      }
    }));
    
    await Department.bulkWrite(bulkOps);
    
    res.json({ message: 'Departments reordered' });
  } catch (error) {
    res.status(500).json({ message: 'Reorder failed', error: error.message });
  }
};

// Analytics
export const getAnalytics = async (req, res) => {
  try {
    const Department = (await import('../models/Department.js')).default;
    
    // Staff distribution by category
    const staffByCategory = await Department.aggregate([
      { $group: { _id: '$category', totalStaff: { $sum: '$staffCount' }, deptCount: { $sum: 1 } } },
      { $sort: { totalStaff: -1 } }
    ]);
    
    // Budget distribution
    const budgetByCategory = await Department.aggregate([
      { $group: { _id: '$category', totalBudget: { $sum: '$budget' }, deptCount: { $sum: 1 } } },
      { $sort: { totalBudget: -1 } }
    ]);
    
    // Status breakdown
    const statusBreakdown = await Department.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Hierarchy depth
    const hierarchyDepth = await Department.aggregate([
      {
        $graphLookup: {
          from: 'departments',
          startWith: '$parent',
          connectFromField: 'parent',
          connectToField: 'code',
          as: 'ancestors',
          maxDepth: 10
        }
      },
      {
        $project: {
          code: 1,
          name: 1,
          depth: { $size: '$ancestors' }
        }
      },
      { $sort: { depth: -1 } },
      { $limit: 10 }
    ]);
    
    // Departments with most staff
    const topStaffDepts = await Department.find()
      .sort({ staffCount: -1 })
      .limit(10)
      .select('code name staffCount category');
    
    // Departments with highest budget
    const topBudgetDepts = await Department.find()
      .sort({ budget: -1 })
      .limit(10)
      .select('code name budget category');
    
    res.json({
      staffByCategory,
      budgetByCategory,
      statusBreakdown,
      hierarchyDepth,
      topStaffDepts,
      topBudgetDepts
    });
  } catch (error) {
    res.status(500).json({ message: 'Analytics failed', error: error.message });
  }
};

// Saved searches
export const saveSearch = async (req, res) => {
  try {
    const { name, criteria } = req.body;
    const SavedSearch = (await import('../models/SavedSearch.js')).default;
    
    const search = await SavedSearch.create({
      user: req.userId,
      name,
      criteria,
      type: 'department'
    });
    
    res.status(201).json({ message: 'Search saved', search });
  } catch (error) {
    res.status(500).json({ message: 'Save failed', error: error.message });
  }
};

export const getSavedSearches = async (req, res) => {
  try {
    const SavedSearch = (await import('../models/SavedSearch.js')).default;
    const searches = await SavedSearch.find({ user: req.userId, type: 'department' }).sort({ createdAt: -1 });
    res.json({ searches });
  } catch (error) {
    res.status(500).json({ message: 'Fetch failed', error: error.message });
  }
};

export const deleteSavedSearch = async (req, res) => {
  try {
    const { id } = req.params;
    const SavedSearch = (await import('../models/SavedSearch.js')).default;
    await SavedSearch.deleteOne({ _id: id, user: req.userId });
    res.json({ message: 'Search deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};
