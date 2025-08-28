import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/mongodb'
import User from '@/models/User'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params
    const body = await request.json()
    const { name, studentId, email, mobile, class: className } = body

    // Validate required fields
    if (!name || !studentId) {
      return NextResponse.json(
        { success: false, error: 'Name and Student ID are required' },
        { status: 400 }
      )
    }

    // Check if student ID already exists for another user
    const existingUser = await User.findOne({ 
      studentId, 
      _id: { $ne: id } // Exclude current user
    })
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Student ID already exists for another user' },
        { status: 400 }
      )
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name,
        studentId,
        email,
        mobile,
        class: className,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password')

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        ...updatedUser.toObject(),
        _id: updatedUser._id.toString(),
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
      }
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    // Check if user exists
    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent self-deletion
    if (user.studentId === session.user.studentId) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Delete user
    await User.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
