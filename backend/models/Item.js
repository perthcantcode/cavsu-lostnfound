import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  type: { type: String, enum: ['lost', 'found'], required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['electronics', 'clothing', 'accessories', 'books', 'documents', 'keys', 'bags', 'other'],
    required: true
  },
  location: {
    description: { type: String, default: '' },
    coordinates: {
      lat: { type: Number, default: 14.4791 },
      lng: { type: Number, default: 120.8980 }
    }
  },
  images: [{ type: String }],
  status: { type: String, enum: ['active', 'claimed', 'resolved'], default: 'active' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateLostFound: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
}, { timestamps: true });

itemSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Item', itemSchema);
