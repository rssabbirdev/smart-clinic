import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/mongodb'
import Visit from '@/models/Visit'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    
    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // Find the student's current visit
    const currentVisit = await Visit.findOne({
      studentId: studentId,
      queueStatus: 'waiting'
    })

    if (!currentVisit) {
      return NextResponse.json(
        { success: false, error: 'No active visit found' },
        { status: 404 }
      )
    }

    // Count total waiting patients
    const totalWaiting = await Visit.countDocuments({
      queueStatus: 'waiting'
    })

    // Calculate queue position (how many people are ahead)
    const queuePosition = await Visit.countDocuments({
      queueStatus: 'waiting',
      createdAt: { $lt: currentVisit.createdAt }
    })

    // Queue number is position + 1
    const queueNumber = queuePosition + 1

    return NextResponse.json({
      success: true,
      queueNumber,
      totalWaiting,
      currentVisit: {
        id: currentVisit._id,
        name: currentVisit.name,
        studentId: currentVisit.studentId,
        priority: currentVisit.priority,
        symptoms: currentVisit.symptoms,
        emergencyFlag: currentVisit.emergencyFlag,
        createdAt: currentVisit.createdAt
      }
    })

  } catch (error) {
    console.error('Queue position error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
