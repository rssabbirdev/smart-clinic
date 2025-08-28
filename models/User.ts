import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  name: string
  studentId: string
  role: 'student' | 'nurse' | 'admin'
  mobile?: string
  email?: string
  class?: string
  password?: string
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['student', 'nurse', 'admin'],
    default: 'student',
  },
  mobile: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: function(this: IUser) {
      return this.role === 'admin' || this.role === 'nurse'
    }
  },
  class: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    minlength: 6,
    required: function(this: IUser) {
      return this.role === 'admin' || this.role === 'nurse'
    }
  },
}, {
  timestamps: true,
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password!, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

// Create indexes (studentId is already indexed via unique: true)
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema)
