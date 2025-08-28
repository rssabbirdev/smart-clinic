import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/mongodb'
import Visit from '@/models/Visit'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    // Check if user is authenticated and has appropriate role
    // const session = await getServerSession(authOptions)
    
    // if (!session?.user || !['nurse', 'admin'].includes(session.user.role)) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized access' },
    //     { status: 401 }
    //   )
    // }

    // Get emergency cases that are waiting or in progress
    const emergencyVisits = await Visit.find({
      emergencyFlag: true,
      queueStatus: { $in: ['waiting', 'in-progress'] }
    })
    .sort({ 
      priority: -1,      // Higher priority first
      createdAt: 1       // Earlier check-ins first
    })
    .lean()

    // Calculate queue position for each emergency visit
    const visitsWithPosition = emergencyVisits.map((visit: any, index) => {
      return {
        ...visit,
        _id: visit._id.toString(),
        position: index + 1,
        createdAt: visit.createdAt.toISOString(),
        updatedAt: visit.updatedAt.toISOString(),
      }
    })

    return NextResponse.json({
      success: true,
      data: visitsWithPosition
    })

  } catch (error) {
    console.error('Emergency alerts fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { studentId } = body

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // Find and update the student's current visit
    const updatedVisit = await Visit.findOneAndUpdate(
      {
        studentId: studentId,
        queueStatus: 'waiting'
      },
      {
        $set: {
          emergencyFlag: true,
          priority: 'emergency'
        }
      },
      { new: true }
    )

    if (!updatedVisit) {
      return NextResponse.json(
        { success: false, error: 'No active visit found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Case marked as emergency successfully',
      visit: {
        id: updatedVisit._id,
        name: updatedVisit.name,
        studentId: updatedVisit.studentId,
        priority: updatedVisit.priority,
        emergencyFlag: updatedVisit.emergencyFlag
      }
    })

  } catch (error) {
    console.error('Emergency update error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
