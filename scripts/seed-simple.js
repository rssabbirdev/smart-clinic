const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const path = require('path')
const fs = require('fs')

// Load environment variables from .env.local
try {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath })
    console.log('✅ Loaded environment variables from .env.local')
  } else {
    console.log('⚠️  .env.local not found, using default MongoDB URI')
    process.env.MONGODB_URI = 'mongodb://localhost:27017/smartclinic'
  }
} catch (error) {
  console.log('⚠️  dotenv not available, using default MongoDB URI')
  process.env.MONGODB_URI = 'mongodb://localhost:27017/smartclinic'
}

// Simple seed script that creates the database structure
async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartclinic'
    console.log(`🔌 Connecting to MongoDB: ${mongoUri}`)
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('✅ Connected to MongoDB successfully')

    // Create collections and basic structure
    const db = mongoose.connection.db
    
    // Create users collection with sample data
    const usersCollection = db.collection('users')
    await usersCollection.deleteMany({})
    
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    const users = [
      {
        name: 'John Smith',
        studentId: 'STU001',
        role: 'student',
        email: 'john.smith@school.edu',
        password: hashedPassword,
        mobile: '+1234567890',
        class: 'Grade 10A',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sarah Johnson',
        studentId: 'STU002',
        role: 'student',
        email: 'sarah.johnson@school.edu',
        password: hashedPassword,
        mobile: '+1234567891',
        class: 'Grade 11B',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mike Davis',
        studentId: 'STU003',
        role: 'student',
        email: 'mike.davis@school.edu',
        password: hashedPassword,
        mobile: '+1234567892',
        class: 'Grade 9C',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Emily Chen',
        studentId: 'STU004',
        role: 'student',
        email: 'emily.chen@school.edu',
        password: hashedPassword,
        mobile: '+1234567894',
        class: 'Grade 12A',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Alex Rodriguez',
        studentId: 'STU005',
        role: 'student',
        email: 'alex.rodriguez@school.edu',
        password: hashedPassword,
        mobile: '+1234567895',
        class: 'Grade 10B',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Nurse Wilson',
        studentId: 'NUR001',
        role: 'nurse',
        email: 'nurse.wilson@school.edu',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Admin Brown',
        studentId: 'ADM001',
        role: 'admin',
        email: 'admin.brown@school.edu',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    await usersCollection.insertMany(users)
    console.log('✅ Created sample users')

    // Create visits collection with sample data
    const visitsCollection = db.collection('visits')
    await visitsCollection.deleteMany({})
    
    const visits = [
      {
        userId: users[0]._id || new mongoose.Types.ObjectId(),
        name: 'John Smith',
        studentId: 'STU001',
        mobile: '+1234567890',
        symptoms: ['Headache', 'Fever'],
        queueStatus: 'waiting',
        emergencyFlag: false,
        priority: 'medium',
        estimatedWaitTime: 25,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: users[1]._id || new mongoose.Types.ObjectId(),
        name: 'Sarah Johnson',
        studentId: 'STU002',
        mobile: '+1234567891',
        symptoms: ['Chest Pain', 'Shortness of Breath'],
        queueStatus: 'waiting',
        emergencyFlag: true,
        priority: 'emergency',
        estimatedWaitTime: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Guest Student',
        studentId: 'GUEST001',
        mobile: '+1234567893',
        symptoms: ['Minor Cut', 'Bleeding'],
        queueStatus: 'in-progress',
        emergencyFlag: false,
        priority: 'low',
        estimatedWaitTime: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: users[2]._id || new mongoose.Types.ObjectId(),
        name: 'Mike Davis',
        studentId: 'STU003',
        mobile: '+1234567892',
        symptoms: ['Stomach Pain', 'Nausea'],
        queueStatus: 'completed',
        emergencyFlag: false,
        priority: 'medium',
        estimatedWaitTime: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    await visitsCollection.insertMany(visits)
    console.log('✅ Created sample visits')

    // Create indexes
    await usersCollection.createIndex({ studentId: 1 }, { unique: true })
    await usersCollection.createIndex({ email: 1 })
    await usersCollection.createIndex({ role: 1 })
    
    await visitsCollection.createIndex({ studentId: 1, createdAt: -1 })
    await visitsCollection.createIndex({ queueStatus: 1 })
    await visitsCollection.createIndex({ emergencyFlag: 1 })
    await visitsCollection.createIndex({ priority: 1 })
    
    console.log('✅ Created database indexes')

    console.log('\n🎉 Database seeded successfully!')
    console.log('\n📋 Sample login credentials:')
    console.log('Student: STU001 / password123')
    console.log('Nurse: NUR001 / password123')
    console.log('Admin: ADM001 / password123')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

// Run the seed function
seedDatabase()
