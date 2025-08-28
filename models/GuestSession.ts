import mongoose, { Schema, Document } from 'mongoose'

export interface IGuestSession extends Document {
  name: string
  studentId: string
  mobile?: string
  sessionToken: string
  expiresAt: Date
  createdAt: Date
}

const guestSessionSchema = new Schema<IGuestSession>({
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
  sessionToken: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
})

// Create indexes
guestSessionSchema.index({ studentId: 1 })
guestSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // TTL index for automatic cleanup

// Method to check if session is expired
guestSessionSchema.methods.isExpired = function(): boolean {
  return new Date() > this.expiresAt
}

export default mongoose.models.GuestSession || mongoose.model<IGuestSession>('GuestSession', guestSessionSchema)
