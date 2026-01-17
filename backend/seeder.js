import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Folder from './models/Folder.js';
import File from './models/File.js';
import Activity from './models/Activity.js';
import Department from './models/Department.js';
import Employee from './models/Employee.js';
import Geography from './models/Geography.js';
import DEPARTMENTS from './config/departments.js';
import connectDB from './config/db.js';
import { syncGeographyData } from './utils/syncGeography.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Folder.deleteMany({});
    await File.deleteMany({});
    await Activity.deleteMany({});
    await Department.deleteMany({});
    await Employee.deleteMany({});
    await Geography.deleteMany({});
    console.log('Cleared existing data');

    // Create demo users
    const users = await User.create([
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User'
      },
      {
        username: 'john',
        email: 'john@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      },
      {
        username: 'jane',
        email: 'jane@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith'
      }
    ]);
    console.log('Created users');

    const departments = await Department.insertMany(DEPARTMENTS);
    console.log(`Created ${DEPARTMENTS.length} departments`);

    // Create demo employees
    const employees = await Employee.create([
      {
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Smith',
        gender: 'Male',
        dateOfBirth: new Date('1990-05-15'),
        email: 'john.smith@company.com',
        phone: '+1-555-0101',
        position: 'Software Engineer',
        department: departments.find(d => d.name === 'Engineering')?._id || departments[0]._id,
        hireDate: new Date('2023-01-15'),
        salary: 85000,
        status: 'active',
        address: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'USA'
        }
      },
      {
        employeeId: 'EMP002',
        firstName: 'Sarah',
        lastName: 'Johnson',
        gender: 'Female',
        dateOfBirth: new Date('1988-08-22'),
        email: 'sarah.johnson@company.com',
        phone: '+1-555-0102',
        position: 'Senior Developer',
        department: departments.find(d => d.name === 'Engineering')?._id || departments[0]._id,
        hireDate: new Date('2022-03-20'),
        salary: 95000,
        status: 'active',
        address: {
          street: '456 Oak Ave',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94103',
          country: 'USA'
        }
      },
      {
        employeeId: 'EMP003',
        firstName: 'Michael',
        lastName: 'Chen',
        gender: 'Male',
        dateOfBirth: new Date('1985-11-30'),
        email: 'michael.chen@company.com',
        phone: '+1-555-0103',
        position: 'HR Manager',
        department: departments.find(d => d.name === 'Human Resources')?._id || departments[1]._id,
        hireDate: new Date('2021-06-10'),
        salary: 75000,
        status: 'active',
        address: {
          street: '789 Pine St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94104',
          country: 'USA'
        }
      },
      {
        employeeId: 'EMP004',
        firstName: 'Emily',
        lastName: 'Davis',
        gender: 'Female',
        dateOfBirth: new Date('1992-03-18'),
        email: 'emily.davis@company.com',
        phone: '+1-555-0104',
        position: 'Marketing Specialist',
        department: departments.find(d => d.name === 'Marketing')?._id || departments[2]._id,
        hireDate: new Date('2023-08-01'),
        salary: 65000,
        status: 'active',
        address: {
          street: '321 Elm St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'USA'
        }
      },
      {
        employeeId: 'EMP005',
        firstName: 'David',
        lastName: 'Martinez',
        gender: 'Male',
        dateOfBirth: new Date('1991-07-25'),
        email: 'david.martinez@company.com',
        phone: '+1-555-0105',
        position: 'Sales Representative',
        department: departments.find(d => d.name === 'Sales')?._id || departments[3]._id,
        hireDate: new Date('2022-11-15'),
        salary: 70000,
        status: 'active',
        address: {
          street: '654 Maple Dr',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94106',
          country: 'USA'
        }
      },
      {
        employeeId: 'EMP006',
        firstName: 'Lisa',
        lastName: 'Anderson',
        gender: 'Female',
        dateOfBirth: new Date('1989-12-10'),
        email: 'lisa.anderson@company.com',
        phone: '+1-555-0106',
        position: 'Financial Analyst',
        department: departments.find(d => d.name === 'Finance')?._id || departments[4]._id,
        hireDate: new Date('2023-02-28'),
        salary: 72000,
        status: 'active',
        address: {
          street: '987 Cedar Ln',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94107',
          country: 'USA'
        }
      },
      {
        employeeId: 'EMP007',
        firstName: 'Robert',
        lastName: 'Wilson',
        gender: 'Male',
        dateOfBirth: new Date('1984-04-08'),
        email: 'robert.wilson@company.com',
        phone: '+1-555-0107',
        position: 'Operations Manager',
        department: departments.find(d => d.name === 'Operations')?._id || departments[5]._id,
        hireDate: new Date('2020-09-12'),
        salary: 88000,
        status: 'active',
        address: {
          street: '147 Birch Ave',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94108',
          country: 'USA'
        }
      },
      {
        employeeId: 'EMP008',
        firstName: 'Jessica',
        lastName: 'Taylor',
        gender: 'Female',
        dateOfBirth: new Date('1993-09-14'),
        email: 'jessica.taylor@company.com',
        phone: '+1-555-0108',
        position: 'Product Designer',
        department: departments.find(d => d.name === 'Engineering')?._id || departments[0]._id,
        hireDate: new Date('2023-04-05'),
        salary: 80000,
        status: 'active',
        address: {
          street: '258 Willow Ct',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94109',
          country: 'USA'
        }
      },
      {
        employeeId: 'EMP009',
        firstName: 'James',
        lastName: 'Brown',
        gender: 'Male',
        dateOfBirth: new Date('1987-06-20'),
        email: 'james.brown@company.com',
        phone: '+1-555-0109',
        position: 'DevOps Engineer',
        department: departments.find(d => d.name === 'Engineering')?._id || departments[0]._id,
        hireDate: new Date('2022-07-18'),
        salary: 92000,
        status: 'active',
        address: {
          street: '369 Ash St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94110',
          country: 'USA'
        }
      },
      {
        employeeId: 'EMP010',
        firstName: 'Maria',
        lastName: 'Garcia',
        gender: 'Female',
        dateOfBirth: new Date('1990-02-28'),
        email: 'maria.garcia@company.com',
        phone: '+1-555-0110',
        position: 'Customer Support Lead',
        department: departments.find(d => d.name === 'Operations')?._id || departments[5]._id,
        hireDate: new Date('2021-12-03'),
        salary: 68000,
        status: 'active',
        address: {
          street: '741 Spruce Rd',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94111',
          country: 'USA'
        }
      }
    ]);
    console.log(`Created ${employees.length} employees`);

    // Create demo folders for admin user
    const folders = await Folder.create([
      {
        name: 'Documents',
        description: 'Personal documents and files',
        userId: users[0]._id,
        isShared: false
      },
      {
        name: 'Projects',
        description: 'Work related projects',
        userId: users[0]._id,
        isShared: false
      },
      {
        name: 'Shared Resources',
        description: 'Shared with team members',
        userId: users[0]._id,
        isShared: true,
        sharedWith: [users[1]._id, users[2]._id]
      },
      {
        name: 'Archive',
        description: 'Archived files',
        userId: users[0]._id,
        isShared: false
      },
      {
        name: 'Personal',
        description: 'Personal files',
        userId: users[1]._id,
        isShared: false
      }
    ]);
    console.log('Created folders');

    // Create demo files
    const files = await File.create([
      {
        name: 'Report_Q4_2025.pdf',
        folderId: folders[0]._id,
        userId: users[0]._id,
        fileUrl: '/uploads/report-q4-2025.pdf',
        fileSize: 2048576,
        fileType: 'application/pdf'
      },
      {
        name: 'Meeting_Notes.docx',
        folderId: folders[0]._id,
        userId: users[0]._id,
        fileUrl: '/uploads/meeting-notes.docx',
        fileSize: 51200,
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      },
      {
        name: 'Project_Plan.xlsx',
        folderId: folders[1]._id,
        userId: users[0]._id,
        fileUrl: '/uploads/project-plan.xlsx',
        fileSize: 102400,
        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      {
        name: 'Team_Photo.jpg',
        folderId: folders[2]._id,
        userId: users[0]._id,
        fileUrl: '/uploads/team-photo.jpg',
        fileSize: 1536000,
        fileType: 'image/jpeg',
        isShared: true
      },
      {
        name: 'Presentation.pptx',
        folderId: folders[2]._id,
        userId: users[0]._id,
        fileUrl: '/uploads/presentation.pptx',
        fileSize: 3145728,
        fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        isShared: true
      }
    ]);
    console.log('Created files');

    // Create demo activities
    await Activity.create([
      {
        userId: users[0]._id,
        action: 'FOLDER_CREATE',
        resourceType: 'FOLDER',
        resourceId: folders[0]._id,
        description: 'Created folder "Documents"',
        metadata: { folderName: folders[0].name }
      },
      {
        userId: users[0]._id,
        action: 'FILE_UPLOAD',
        resourceType: 'FILE',
        resourceId: files[0]._id,
        description: 'Uploaded file "Report_Q4_2025.pdf"',
        metadata: { fileName: files[0].name, fileSize: files[0].fileSize }
      },
      {
        userId: users[0]._id,
        action: 'FOLDER_SHARE',
        resourceType: 'FOLDER',
        resourceId: folders[2]._id,
        description: 'Shared folder "Shared Resources" with team',
        metadata: { folderName: folders[2].name }
      },
      {
        userId: users[1]._id,
        action: 'FILE_UPLOAD',
        resourceType: 'FILE',
        resourceId: files[3]._id,
        description: 'Accessed file "Team_Photo.jpg"',
        metadata: { fileName: files[3].name }
      },
      {
        userId: users[0]._id,
        action: 'LOGIN',
        resourceType: 'USER',
        resourceId: users[0]._id,
        description: 'User logged in',
        metadata: { username: users[0].username }
      }
    ]);
    console.log('Created activities');
// Seed geography data from MEF API
    console.log('\n📍 Syncing Cambodia geography data from MEF API...');
    try {
      await syncGeographyData();
      console.log('✅ Geography data synced successfully!');
    } catch (error) {
      console.error('⚠️  Warning: Geography sync failed:', error.message);
      console.log('   You can sync geography data later by running: npm run init-geography');
    }

    
    console.log('\n✅ Database seeded successfully!');
    console.log('\nDemo Users:');
    console.log('  Email: admin@example.com | Password: password123');
    console.log('  Email: john@example.com  | Password: password123');
    console.log('  Email: jane@example.com  | Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
