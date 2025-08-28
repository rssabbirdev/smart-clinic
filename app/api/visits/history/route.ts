import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/mongodb'
import Visit from '@/models/Visit'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // Get visit history for the student
    const visits = await Visit.find({ 
      studentId,
      queueStatus: 'completed'
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()

    return NextResponse.json({
      success: true,
      data: visits
    })

  } catch (error) {
    console.error('Error fetching visit history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch visit history' },
      { status: 500 }
    )
  }
}
