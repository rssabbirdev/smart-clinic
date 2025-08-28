import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import GuestSession from '@/models/GuestSession'
import { GuestLoginData } from '@/types'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body: GuestLoginData = await request.json()
    const { name, studentId, mobile } = body

    // Validate required fields
    if (!name || !studentId) {
      return NextResponse.json(
        { success: false, error: 'Name and Student ID are required' },
        { status: 400 }
      )
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex')
    
    // Set expiration to 2 minutes from now (matching NextAuth session)
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000)

    // Create guest session
    const guestSession = new GuestSession({
      name,
      studentId,
      mobile,
      sessionToken,
      expiresAt,
    })

    await guestSession.save()

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      data: {
        sessionToken,
        name,
        studentId,
        mobile,
        expiresAt,
      }
    })

    // Set HTTP-only cookie for guest session
    response.cookies.set('guest-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60, // 2 minutes
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Guest login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('guest-session')?.value
    
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'No guest session found' },
        { status: 401 }
      )
    }

    await dbConnect()
    
    const guestSession = await GuestSession.findOne({ 
      sessionToken,
      expiresAt: { $gt: new Date() }
    })

    if (!guestSession) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        name: guestSession.name,
        studentId: guestSession.studentId,
        mobile: guestSession.mobile,
        sessionToken: guestSession.sessionToken,
        expiresAt: guestSession.expiresAt,
      }
    })

  } catch (error) {
    console.error('Guest session validation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
