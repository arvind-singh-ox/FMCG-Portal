import mongoose from 'mongoose'

const industrySchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  portalRoute: {
    type: String,
    required: true,
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true })

export default mongoose.models.Industry || mongoose.model('Industry', industrySchema)
