const mongoose = require('mongoose')
require('dotenv').config()

// Import models
const Visit = require('../models/Visit')
const User = require('../models/User')

async function populateNurseNames() {
  try {
    console.log('🔌 Connecting to database...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Database connected')

    console.log('🔍 Finding visits with assigned nurses but no names...')
    const visits = await Visit.find({
      assignedNurse: { $exists: true, $ne: null },
      $or: [
        { assignedNurseName: { $exists: false } },
        { assignedNurseName: null },
        { assignedNurseName: '' }
      ]
    })

    console.log(`📋 Found ${visits.length} visits to update`)

    let updatedCount = 0
    let errorCount = 0

    for (const visit of visits) {
      try {
        console.log(`🔄 Processing visit ${visit._id} assigned to nurse ${visit.assignedNurse}`)
        
        const nurse = await User.findById(visit.assignedNurse)
        if (nurse) {
          await Visit.findByIdAndUpdate(visit._id, { assignedNurseName: nurse.name })
          console.log(`✅ Updated visit ${visit._id} with nurse name: ${nurse.name}`)
          updatedCount++
        } else {
          console.log(`⚠️ Nurse not found for ID: ${visit.assignedNurse}`)
          errorCount++
        }
      } catch (error) {
        console.error(`❌ Error updating visit ${visit._id}:`, error)
        errorCount++
      }
    }

    console.log('\n🎉 Population complete!')
    console.log(`✅ Successfully updated: ${updatedCount} visits`)
    console.log(`❌ Errors: ${errorCount} visits`)
    
    if (errorCount > 0) {
      console.log('\n⚠️ Some visits could not be updated. Check the logs above for details.')
    }

  } catch (error) {
    console.error('❌ Script error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Database disconnected')
  }
}

// Run the script
populateNurseNames()
