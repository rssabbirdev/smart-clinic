import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/mongodb'
import User from '@/models/User'

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

    // Search for student in database
    const student = await User.findOne({ 
      studentId: studentId,
      role: 'student'
    }).select('name studentId email class mobile -_id')

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    // Return student info
    return NextResponse.json({
      success: true,
      student: {
        name: student.name,
        studentId: student.studentId,
        class: student.class || 'Not specified',
        mobile: student.mobile || student.email || '',
        isGuest: false
      }
    })

  } catch (error) {
    console.error('Student search error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
