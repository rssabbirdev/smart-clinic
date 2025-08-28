const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const path = require('path')
const fs = require('fs')

// Try to load environment variables
try {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath })
  } else {
    console.log('⚠️  .env.local not found, using default values')
    // Set default values if .env.local doesn't exist
    process.env.MONGODB_URI = process.env.MONGODB_URI
  }
} catch (error) {
  console.log('⚠️  dotenv not available, using default values')
  process.env.MONGODB_URI = process.env.MONGODB_URI
}

// Import models
let User, Visit
try {
  User = require('../models/User')
  Visit = require('../models/Visit')
} catch (error) {
  console.error('❌ Error importing models:', error.message)
  console.log('💡 Make sure to run "npm run build" first to compile TypeScript models')
  process.exit(1)
}

async function seedDatabase() {
  try {
    // Check if models are compiled
    if (!User || !Visit) {
      throw new Error('Models not properly imported')
    }
    
    // Connect to MongoDB with better options
    const mongoUri = process.env.MONGODB_URI
    console.log(`🔌 Connecting to MongoDB: ${mongoUri}`)
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('✅ Connected to MongoDB successfully')

    // Clear existing data
    await User.deleteMany({})
    await Visit.deleteMany({})
    console.log('Cleared existing data')

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10)

    const users = [
      {
        name: 'John Smith',
        studentId: 'STU001',
        role: 'student',
        email: 'john.smith@school.edu',
        password: hashedPassword,
        mobile: '+1234567890'
      },
      {
        name: 'Sarah Johnson',
        studentId: 'STU002',
        role: 'student',
        email: 'sarah.johnson@school.edu',
        password: hashedPassword,
        mobile: '+1234567891'
      },
      {
        name: 'Mike Davis',
        studentId: 'STU003',
        role: 'student',
        email: 'mike.davis@school.edu',
        password: hashedPassword,
        mobile: '+1234567892'
      },
      {
        name: 'Nurse Wilson',
        studentId: 'NUR001',
        role: 'nurse',
        email: 'nurse.wilson@school.edu',
        password: hashedPassword
      },
      {
        name: 'Admin Brown',
        studentId: 'ADM001',
        role: 'admin',
        email: 'admin.brown@school.edu',
        password: hashedPassword
      }
    ]

    const createdUsers = await User.insertMany(users)
    console.log('Created sample users')

    // Create sample visits
    const visits = [
      {
        userId: createdUsers[0]._id,
        name: 'John Smith',
        studentId: 'STU001',
        mobile: '+1234567890',
        symptoms: ['Headache', 'Fever'],
        queueStatus: 'waiting',
        emergencyFlag: false,
        priority: 'medium',
        estimatedWaitTime: 25
      },
      {
        userId: createdUsers[1]._id,
        name: 'Sarah Johnson',
        studentId: 'STU002',
        mobile: '+1234567891',
        symptoms: ['Chest Pain', 'Shortness of Breath'],
        queueStatus: 'waiting',
        emergencyFlag: true,
        priority: 'emergency',
        estimatedWaitTime: 5
      },
      {
        name: 'Guest Student',
        studentId: 'GUEST001',
        mobile: '+1234567893',
        symptoms: ['Minor Cut', 'Bleeding'],
        queueStatus: 'in-progress',
        emergencyFlag: false,
        priority: 'low',
        estimatedWaitTime: 15
      },
      {
        userId: createdUsers[2]._id,
        name: 'Mike Davis',
        studentId: 'STU003',
        mobile: '+1234567892',
        symptoms: ['Stomach Pain', 'Nausea'],
        queueStatus: 'completed',
        emergencyFlag: false,
        priority: 'medium',
        estimatedWaitTime: 0
      }
    ]

    await Visit.insertMany(visits)
    console.log('Created sample visits')

    console.log('\n✅ Database seeded successfully!')
    console.log('\nSample login credentials:')
    console.log('Student: STU001 / password123')
    console.log('Nurse: NUR001 / password123')
    console.log('Admin: ADM001 / password123')

  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Run the seed function
seedDatabase()
