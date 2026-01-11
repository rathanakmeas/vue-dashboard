import BudgetTransaction from '../models/BudgetTransaction.js';
import Department from '../models/Department.js';
import { logActivity } from '../utils/activityLogger.js';

// Get budget overview for department
export const getDepartmentBudget = async (req, res) => {
  try {
    const { code } = req.params;
    const { year, month } = req.query;
    
    const dept = await Department.findOne({ code });
    if (!dept) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    let dateFilter = {};
    if (year) {
      const startDate = new Date(year, month ? month - 1 : 0, 1);
      const endDate = month 
        ? new Date(year, month, 0)
        : new Date(year, 11, 31, 23, 59, 59);
      dateFilter = { date: { $gte: startDate, $lte: endDate } };
    }
    
    const transactions = await BudgetTransaction.find({
      department: code,
      ...dateFilter
    })
      .populate('createdBy approvedBy', 'username')
      .sort({ date: -1 });
    
    // Calculate totals
    const summary = await BudgetTransaction.aggregate([
      { $match: { department: code, ...dateFilter } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    const byCategory = await BudgetTransaction.aggregate([
      { $match: { department: code, type: 'expense', ...dateFilter } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);
    
    const allocated = summary.find(s => s._id === 'allocation')?.total || dept.budget || 0;
    const expenses = summary.find(s => s._id === 'expense')?.total || 0;
    const transfers = summary.find(s => s._id === 'transfer')?.total || 0;
    const adjustments = summary.find(s => s._id === 'adjustment')?.total || 0;
    
    const remaining = allocated + transfers + adjustments - expenses;
    
    res.json({
      department: dept,
      transactions,
      summary: {
        allocated,
        expenses,
        transfers,
        adjustments,
        remaining,
        utilizationRate: allocated > 0 ? ((expenses / allocated) * 100).toFixed(2) : 0
      },
      byCategory
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch budget', error: error.message });
  }
};

// Create budget transaction
export const createTransaction = async (req, res) => {
  try {
    const { department, type, amount, category, description, date, notes } = req.body;
    
    const dept = await Department.findOne({ code: department });
    if (!dept) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const transaction = await BudgetTransaction.create({
      department,
      type,
      amount,
      category,
      description,
      date: date || new Date(),
      notes: notes || '',
      createdBy: req.userId,
      status: 'pending'
    });
    
    await logActivity(
      req.userId,
      'BUDGET_TRANSACTION_CREATED',
      'BUDGET',
      transaction._id,
      { department, type, amount, category },
      req.ip,
      req.headers['user-agent']
    );
    
    const populated = await BudgetTransaction.findById(transaction._id)
      .populate('createdBy', 'username');
    
    res.status(201).json({ message: 'Transaction created', transaction: populated });
  } catch (error) {
    res.status(500).json({ message: 'Transaction failed', error: error.message });
  }
};

// Approve/reject transaction
export const approveTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'
    
    const transaction = await BudgetTransaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    transaction.status = status;
    transaction.approvedBy = req.userId;
    await transaction.save();
    
    await logActivity(
      req.userId,
      `BUDGET_TRANSACTION_${status.toUpperCase()}`,
      'BUDGET',
      transaction._id,
      { transactionId: id, amount: transaction.amount },
      req.ip,
      req.headers['user-agent']
    );
    
    const populated = await BudgetTransaction.findById(id)
      .populate('createdBy approvedBy', 'username');
    
    res.json({ message: `Transaction ${status}`, transaction: populated });
  } catch (error) {
    res.status(500).json({ message: 'Approval failed', error: error.message });
  }
};

// Get budget analytics
export const getBudgetAnalytics = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();
    
    // Monthly breakdown
    const monthlyData = await BudgetTransaction.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(currentYear, 0, 1),
            $lte: new Date(currentYear, 11, 31)
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);
    
    // Department budget utilization
    const deptUtilization = await BudgetTransaction.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(currentYear, 0, 1),
            $lte: new Date(currentYear, 11, 31)
          }
        }
      },
      {
        $group: {
          _id: '$department',
          allocated: {
            $sum: {
              $cond: [{ $eq: ['$type', 'allocation'] }, '$amount', 0]
            }
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: 'code',
          as: 'department'
        }
      },
      {
        $project: {
          department: { $arrayElemAt: ['$department.name', 0] },
          allocated: 1,
          expenses: 1,
          remaining: { $subtract: ['$allocated', '$expenses'] },
          utilizationRate: {
            $cond: [
              { $eq: ['$allocated', 0] },
              0,
              { $multiply: [{ $divide: ['$expenses', '$allocated'] }, 100] }
            ]
          }
        }
      },
      { $sort: { utilizationRate: -1 } }
    ]);
    
    // Top expense categories
    const topCategories = await BudgetTransaction.aggregate([
      {
        $match: {
          type: 'expense',
          date: {
            $gte: new Date(currentYear, 0, 1),
            $lte: new Date(currentYear, 11, 31)
          }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);
    
    res.json({
      year: currentYear,
      monthlyData,
      deptUtilization,
      topCategories
    });
  } catch (error) {
    res.status(500).json({ message: 'Analytics failed', error: error.message });
  }
};

// Export budget report
export const exportBudgetReport = async (req, res) => {
  try {
    const { code } = req.params;
    const { year, month } = req.query;
    
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Budget Report');
    
    let dateFilter = {};
    if (year) {
      const startDate = new Date(year, month ? month - 1 : 0, 1);
      const endDate = month 
        ? new Date(year, month, 0)
        : new Date(year, 11, 31, 23, 59, 59);
      dateFilter = { date: { $gte: startDate, $lte: endDate } };
    }
    
    const transactions = await BudgetTransaction.find({
      department: code,
      ...dateFilter
    })
      .populate('createdBy approvedBy', 'username')
      .sort({ date: 1 });
    
    // Header
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Created By', key: 'createdBy', width: 20 },
      { header: 'Approved By', key: 'approvedBy', width: 20 }
    ];
    
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    
    transactions.forEach(t => {
      worksheet.addRow({
        date: t.date.toISOString().split('T')[0],
        type: t.type,
        category: t.category,
        description: t.description,
        amount: t.amount,
        status: t.status,
        createdBy: t.createdBy?.username || '',
        approvedBy: t.approvedBy?.username || ''
      });
    });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=budget-${code}-${year || 'all'}.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Export failed', error: error.message });
  }
};
