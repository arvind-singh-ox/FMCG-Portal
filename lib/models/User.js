import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  countryCode: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: '',
    trim: true,
  },
  utmSource: {
    type: String,
    default: '',
  },
  loginCount: {
    type: Number,
    default: 0,
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
  loginHistory: {
    type: [{
      ip: String,
      userAgent: String,
      timestamp: { type: Date, default: Date.now },
    }],
    default: [],
  },
  pageViews: {
    type: Map,
    of: Number,
    default: {},
  },
  totalPageViews: {
    type: Number,
    default: 0,
  },
  lastVisitedPage: {
    type: String,
    default: '',
  },
}, { timestamps: true })

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.models.User || mongoose.model('User', userSchema)
