import mongoose, { Schema, Document } from 'mongoose'

export interface IVisit extends Document {
  userId?: string
  name: string
  studentId: string
  mobile?: string
  class?: string
  symptoms: string[]
  queueStatus: 'waiting' | 'in-progress' | 'completed'
  emergencyFlag: boolean
  priority: 'low' | 'medium' | 'high' | 'emergency'
  estimatedWaitTime?: number
  notes?: string
  assignedNurse?: string
  assignedNurseName?: string
  createdAt: Date
  updatedAt: Date
}

const visitSchema = new Schema<IVisit>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false, // nullable for guest mode
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  studentId: {
    type: String,
    required: true,
    trim: true,
  },
  mobile: {
    type: String,
    trim: true,
  },
  class: {
    type: String,
    trim: true,
  },
  symptoms: [{
    type: String,
    required: true,
  }],
  queueStatus: {
    type: String,
    enum: ['waiting', 'in-progress', 'completed'],
    default: 'waiting',
  },
  emergencyFlag: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'low',
  },
  estimatedWaitTime: {
    type: Number,
    min: 0,
  },
  notes: {
    type: String,
    trim: true,
  },
  assignedNurse: {
    type: String,
    trim: true,
  },
  assignedNurseName: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
})

// Create indexes for efficient querying
visitSchema.index({ queueStatus: 1, createdAt: 1 })
visitSchema.index({ emergencyFlag: 1, createdAt: 1 })
visitSchema.index({ studentId: 1, createdAt: -1 })
visitSchema.index({ userId: 1, createdAt: -1 })
visitSchema.index({ priority: 1, createdAt: 1 })
visitSchema.index({ assignedNurse: 1, queueStatus: 1 })

// Virtual for queue position (calculated field)
visitSchema.virtual('queuePosition').get(function() {
  // This will be calculated in the application logic
  return 0
})

// Ensure virtual fields are serialized
visitSchema.set('toJSON', { virtuals: true })
visitSchema.set('toObject', { virtuals: true })

export default mongoose.models.Visit || mongoose.model<IVisit>('Visit', visitSchema)
