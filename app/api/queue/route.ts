import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/mongodb'
import Visit from '@/models/Visit'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    // Check if user is authenticated and has appropriate role
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['nurse', 'admin'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    // Build query based on status filter
    let query: any = {}
    if (status && status !== 'all') {
      query.queueStatus = status
    }

    // Get total count for pagination
    const totalCount = await Visit.countDocuments(query)
    
    // Get visits with pagination and sorting
    const visits = await Visit.find(query)
      .sort({ 
        emergencyFlag: -1, // Emergency cases first
        priority: -1,      // Higher priority first
        createdAt: 1       // Earlier check-ins first
      })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()

    // Calculate queue position for each visit
    const visitsWithPosition = visits.map((visit: any, index) => {
      const queuePosition = (page - 1) * limit + index + 1
      return {
        ...visit,
        _id: visit._id.toString(),
        queuePosition,
        createdAt: visit.createdAt.toISOString(),
        updatedAt: visit.updatedAt.toISOString(),
      }
    })

    // Get queue statistics
    const stats = await Visit.aggregate([
      {
        $group: {
          _id: '$queueStatus',
          count: { $sum: 1 }
        }
      }
    ])

    const emergencyCount = await Visit.countDocuments({ emergencyFlag: true, queueStatus: { $in: ['waiting', 'in-progress'] } })

    // Get today's total visits
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const totalToday = await Visit.countDocuments({
      createdAt: { $gte: today }
    })

    // Calculate average wait time (simplified - in real app this would be more complex)
    const averageWaitTime = 15 // Default 15 minutes

    const queueStats = {
      totalWaiting: stats.find(s => s._id === 'waiting')?.count || 0,
      totalInProgress: stats.find(s => s._id === 'in-progress')?.count || 0,
      totalCompleted: stats.find(s => s._id === 'completed')?.count || 0,
      emergencyCases: emergencyCount,
      totalToday,
      averageWaitTime,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalCount,
    }

    return NextResponse.json({
      success: true,
      data: {
        visits: visitsWithPosition,
        stats: queueStats,
      }
    })

  } catch (error) {
    console.error('Queue fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect()
    
    // Check if user is authenticated and has appropriate role
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['nurse', 'admin'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { visitId, action, notes } = body

    if (!visitId || !action) {
      return NextResponse.json(
        { success: false, error: 'Visit ID and action are required' },
        { status: 400 }
      )
    }

    let updateData: any = {}
    
    switch (action) {
      case 'start':
        updateData.queueStatus = 'in-progress'
        updateData.notes = notes
        break
      case 'complete':
        updateData.queueStatus = 'completed'
        updateData.notes = notes
        break
      case 'update_notes':
        updateData.notes = notes
        break
      case 'update_priority':
        if (body.priority) {
          updateData.priority = body.priority
        }
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

    updateData.updatedAt = new Date()

    const updatedVisit = await Visit.findByIdAndUpdate(
      visitId,
      updateData,
      { new: true }
    )

    if (!updatedVisit) {
      return NextResponse.json(
        { success: false, error: 'Visit not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        visit: {
          ...updatedVisit.toObject(),
          _id: updatedVisit._id.toString(),
          createdAt: updatedVisit.createdAt.toISOString(),
          updatedAt: updatedVisit.updatedAt.toISOString(),
        }
      },
      message: `Visit ${action} successful`
    })

  } catch (error) {
    console.error('Queue update error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
