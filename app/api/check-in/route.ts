import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/mongodb'
import Visit from '@/models/Visit'
import GuestSession from '@/models/GuestSession'
import { CheckInData } from '@/types'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { 
      symptoms, 
      emergencyFlag, 
      severity, 
      studentId, 
      name, 
      class: studentClass, 
      mobile, 
      isGuest 
    } = body

    // Validate required fields
    if (!symptoms || symptoms.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one symptom is required' },
        { status: 400 }
      )
    }

    if (!severity) {
      return NextResponse.json(
        { success: false, error: 'Severity level is required' },
        { status: 400 }
      )
    }

    let userInfo: { name: string; studentId: string; mobile?: string; userId?: string; class?: string } | null = null

    // Check for authenticated session first
    const session = await getServerSession(authOptions)
    
    if (session?.user) {
      // Authenticated user
      userInfo = {
        name: session.user.name || '',
        studentId: session.user.studentId || '',
        mobile: session.user.email || undefined,
        userId: session.user.id || '',
        class: (session.user as any).class,
      }
    } else if (body.name && body.studentId) {
      // Direct check-in from landing page
      userInfo = {
        name: body.name,
        studentId: body.studentId,
        mobile: body.mobile,
        class: body.class,
      }
    } else {
      // Check for guest session
      const guestSessionToken = request.cookies.get('guest-session')?.value
      
      if (guestSessionToken) {
        const guestSession = await GuestSession.findOne({ 
          sessionToken: guestSessionToken,
          expiresAt: { $gt: new Date() }
        })

        if (guestSession) {
          userInfo = {
            name: guestSession.name,
            studentId: guestSession.studentId,
            mobile: guestSession.mobile,
          }
        }
      }
    }

    if (!userInfo) {
      return NextResponse.json(
        { success: false, error: 'No valid user information found' },
        { status: 400 }
      )
    }

    // Check if user already has an active visit
    const existingVisit = await Visit.findOne({
      studentId: userInfo.studentId,
      queueStatus: 'waiting'
    })

    if (existingVisit) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'already_in_queue',
          existingVisit: {
            id: existingVisit._id,
            name: existingVisit.name,
            studentId: existingVisit.studentId,
            priority: existingVisit.priority,
            symptoms: existingVisit.symptoms,
            emergencyFlag: existingVisit.emergencyFlag,
            createdAt: existingVisit.createdAt
          }
        },
        { status: 400 }
      )
    }

    // Map severity to priority
    let priority = 'medium'
    if (severity === 'Emergency') priority = 'emergency'
    else if (severity === 'High') priority = 'high'
    else if (severity === 'Low') priority = 'low'

    // Calculate estimated wait time based on priority and current queue
    const waitingCount = await Visit.countDocuments({ queueStatus: 'waiting' })
    let estimatedWaitTime = 15 // Base wait time in minutes
    
    if (priority === 'emergency') {
      estimatedWaitTime = 5
    } else if (priority === 'high') {
      estimatedWaitTime = 10
    } else if (priority === 'medium') {
      estimatedWaitTime = 15 + (waitingCount * 2)
    } else {
      estimatedWaitTime = 20 + (waitingCount * 3)
    }

    // Create new visit
    const visit = new Visit({
      userId: userInfo.userId,
      name: userInfo.name,
      studentId: userInfo.studentId,
      mobile: userInfo.mobile,
      symptoms,
      emergencyFlag,
      priority,
      estimatedWaitTime,
      queueStatus: 'waiting',
      class: userInfo.class,
    })

    await visit.save()

    return NextResponse.json({
      success: true,
      data: {
        visitId: visit._id,
        estimatedWaitTime,
        queueStatus: visit.queueStatus,
        priority: visit.priority,
        symptoms: visit.symptoms,
        emergencyFlag: visit.emergencyFlag,
      },
      message: 'Successfully checked in to the clinic queue'
    })

  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const session = await getServerSession(authOptions)
    const guestSessionToken = request.cookies.get('guest-session')?.value

    let userInfo: { name: string; studentId: string; userId?: string } | null = null

    if (session?.user) {
      userInfo = {
        name: session.user.name,
        studentId: session.user.studentId,
        userId: session.user.id,
      }
    } else if (guestSessionToken) {
      const guestSession = await GuestSession.findOne({ 
        sessionToken: guestSessionToken,
        expiresAt: { $gt: new Date() }
      })

      if (guestSession) {
        userInfo = {
          name: guestSession.name,
          studentId: guestSession.studentId,
        }
      }
    }

    if (!userInfo) {
      return NextResponse.json(
        { success: false, error: 'No valid session found' },
        { status: 401 }
      )
    }

    // Get user's current visit
    const currentVisit = await Visit.findOne({
      $or: [
        { userId: userInfo.userId },
        { studentId: userInfo.studentId }
      ],
      queueStatus: { $in: ['waiting', 'in-progress'] }
    })

    if (!currentVisit) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No active visit found'
      })
    }

    // Calculate queue position
    const queuePosition = await Visit.countDocuments({
      queueStatus: 'waiting',
      createdAt: { $lt: currentVisit.createdAt },
      priority: { $gte: currentVisit.priority }
    })

    return NextResponse.json({
      success: true,
      data: {
        visitId: currentVisit._id,
        symptoms: currentVisit.symptoms,
        queueStatus: currentVisit.queueStatus,
        priority: currentVisit.priority,
        estimatedWaitTime: currentVisit.estimatedWaitTime,
        queuePosition: queuePosition + 1,
        createdAt: currentVisit.createdAt,
      }
    })

  } catch (error) {
    console.error('Get visit status error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
