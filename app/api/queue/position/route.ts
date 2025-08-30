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

    // Check if the visit is older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
    const isVisitOld = currentVisit.createdAt < oneHourAgo

    // If visit is older than 1 hour, allow re-check-in
    if (isVisitOld) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Visit expired',
          canRecheckIn: true,
          message: 'Your previous visit has expired. You can check in again.'
        },
        { status: 200 }
      )
    }

    // Count total waiting patients
    const totalWaiting = await Visit.countDocuments({
      queueStatus: 'waiting'
    })

    // Calculate queue position considering priority and emergency flags
    // Emergency cases and higher priority cases go first
    let queuePosition = 0
    
    // Get all waiting visits sorted by priority
    const waitingVisits = await Visit.find({ queueStatus: 'waiting' })
      .sort({ 
        emergencyFlag: -1,  // Emergency cases first
        priority: -1,       // Higher priority first (Emergency > High > Medium > Low)
        createdAt: 1        // Earlier check-ins first for same priority
      })
      .lean()
    
    // Find the position of current visit in the sorted queue
    for (let i = 0; i < waitingVisits.length; i++) {
      const visit = waitingVisits[i] as any
      if (visit._id.toString() === currentVisit._id.toString()) {
        queuePosition = i
        break
      }
    }
    
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
