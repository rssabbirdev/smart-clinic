import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/mongodb'
import Visit from '@/models/Visit'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { visitId: string } }
) {
  try {
    await dbConnect()
    
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated and has appropriate role
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { visitId } = params
    const body = await request.json()

    // Validate visit exists
    const visit = await Visit.findById(visitId)
    if (!visit) {
      return NextResponse.json(
        { success: false, error: 'Visit not found' },
        { status: 404 }
      )
    }

    // Update the visit
    const updatedVisit = await Visit.findByIdAndUpdate(
      visitId,
      { $set: body },
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      data: updatedVisit
    })

  } catch (error) {
    console.error('Error updating visit:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update visit' },
      { status: 500 }
    )
  }
}
