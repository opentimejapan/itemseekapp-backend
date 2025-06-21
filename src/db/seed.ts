import { db } from './connection.js';
import { organizations, users, items, locations, tasks } from '../../packages/db/src/schema.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create demo organization
    const [org] = await db.insert(organizations).values({
      name: 'Demo Hotel',
      industry: 'hospitality',
      settings: {
        itemCategories: ['Linen', 'Cleaning', 'Amenities', 'Food & Beverage'],
        locationTypes: ['Room', 'Floor', 'Storage'],
        taskTypes: ['Cleaning', 'Maintenance', 'Delivery', 'Inspection'],
        statuses: ['available', 'low', 'out of stock'],
        units: ['pieces', 'kg', 'boxes', 'units', 'liters']
      }
    }).returning();

    console.log('✅ Created organization:', org.name);

    // Create demo user
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const [user] = await db.insert(users).values({
      email: 'demo@itemseek.com',
      password: hashedPassword,
      name: 'Demo User',
      organizationId: org.id,
      role: 'admin'
    }).returning();

    console.log('✅ Created user:', user.email);

    // Create demo items
    const itemsData = [
      { name: 'Bath Towels', quantity: 150, unit: 'pieces', location: 'Storage Room A', category: 'Linen', status: 'available' },
      { name: 'Hand Soap', quantity: 25, unit: 'boxes', location: 'Supply Closet', category: 'Amenities', status: 'low' },
      { name: 'Pillow Cases', quantity: 200, unit: 'pieces', location: 'Linen Room', category: 'Linen', status: 'available' },
      { name: 'Cleaning Spray', quantity: 0, unit: 'units', location: 'Janitor Closet', category: 'Cleaning', status: 'out of stock' },
      { name: 'Toilet Paper', quantity: 100, unit: 'boxes', location: 'Storage B', category: 'Amenities', status: 'available' },
      { name: 'Bed Sheets', quantity: 80, unit: 'pieces', location: 'Linen Room', category: 'Linen', status: 'available' },
    ];

    for (const item of itemsData) {
      await db.insert(items).values({
        ...item,
        organizationId: org.id,
        metadata: {}
      });
    }

    console.log('✅ Created', itemsData.length, 'items');

    // Create demo locations
    const locationsData = [
      { name: '101', type: 'Room', status: 'available' },
      { name: '102', type: 'Room', status: 'occupied' },
      { name: '103', type: 'Room', status: 'maintenance' },
      { name: '201', type: 'Room', status: 'available' },
      { name: '202', type: 'Room', status: 'reserved' },
      { name: '203', type: 'Room', status: 'occupied' },
      { name: 'A1', type: 'Storage', status: 'available' },
      { name: 'B1', type: 'Storage', status: 'occupied' },
    ];

    for (const location of locationsData) {
      await db.insert(locations).values({
        ...location,
        organizationId: org.id,
        metadata: {}
      });
    }

    console.log('✅ Created', locationsData.length, 'locations');

    // Create demo tasks
    const tasksData = [
      { type: 'cleaning', targetId: 'Room 201', assignee: 'Maria', priority: 'high', status: 'pending', dueDate: new Date(Date.now() + 86400000) },
      { type: 'maintenance', targetId: 'AC Unit 5', assignee: 'John', priority: 'urgent', status: 'in-progress', dueDate: new Date() },
      { type: 'delivery', targetId: 'Kitchen Supplies', assignee: 'Alex', priority: 'normal', status: 'pending', dueDate: new Date(Date.now() + 172800000) },
      { type: 'cleaning', targetId: 'Lobby Area', assignee: 'Sarah', priority: 'low', status: 'completed', dueDate: new Date(Date.now() - 86400000) },
    ];

    for (const task of tasksData) {
      await db.insert(tasks).values({
        ...task,
        organizationId: org.id,
        metadata: {}
      });
    }

    console.log('✅ Created', tasksData.length, 'tasks');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Email: demo@itemseek.com');
    console.log('   Password: demo123');
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

seed();