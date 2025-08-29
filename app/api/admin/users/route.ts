import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    // Get all users
    const users = await User.find({})
      .select('-password') // Don't include passwords
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      users: users.map((user: any) => ({
        ...user,
        _id: user._id.toString(),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }))
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, studentId, role, email, mobile, class: studentClass, password } = body

    // Debug logging
    console.log('Creating user with data:', { name, studentId, role, email, mobile, class: studentClass, password })

    // Validate required fields
    if (!name || !studentId || !role || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, Student ID, Role, and Password are required' },
        { status: 400 }
      )
    }

    // Check if student ID already exists
    const existingUser = await User.findOne({ studentId })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Student ID already exists' },
        { status: 400 }
      )
    }

    // Create new user
    const userData = {
      name,
      studentId,
      role,
      email,
      mobile,
      class: studentClass, // Add the class field
      password, // Will be hashed by the pre-save middleware
    }
    
    console.log('Creating User model with data:', userData)
    
    const user = new User(userData)

    await user.save()
    
    console.log('User saved successfully. Saved user data:', {
      _id: user._id,
      name: user.name,
      studentId: user.studentId,
      class: user.class,
      role: user.role
    })

    // Return user without password
    const userResponse = user.toObject()
    delete userResponse.password

    return NextResponse.json({
      success: true,
      user: {
        ...userResponse,
        _id: userResponse._id.toString(),
        createdAt: userResponse.createdAt.toISOString(),
        updatedAt: userResponse.updatedAt.toISOString(),
      }
    })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
