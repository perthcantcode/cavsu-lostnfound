import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import Item from '../models/Item.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
});

router.get('/', async (req, res) => {
  try {
    const { type, category, search, status = 'active', page = 1, limit = 12 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'location.description': { $regex: search, $options: 'i' } }
    ];
    const total = await Item.countDocuments(filter);
    const items = await Item.find(filter)
      .populate('postedBy', 'name studentId avatar department')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ items, total, pages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    const { type, title, description, category, locationDesc, lat, lng, dateLostFound } = req.body;
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        const result = await cloudinary.uploader.upload(dataURI, { folder: 'cavsu-lostandfound' });
        images.push(result.secure_url);
      }
    }
    const item = await Item.create({
      type, title, description, category,
      location: {
        description: locationDesc,
        coordinates: { lat: parseFloat(lat) || 14.4791, lng: parseFloat(lng) || 120.8980 }
      },
      images,
      postedBy: req.user._id,
      dateLostFound: dateLostFound || new Date()
    });
    await item.populate('postedBy', 'name studentId avatar');
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('postedBy', 'name studentId avatar department contactNumber');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    const updated = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('postedBy', 'name studentId avatar');
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    await item.deleteOne();
    res.json({ message: 'Item deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/user/my-items', protect, async (req, res) => {
  try {
    const items = await Item.find({ postedBy: req.user._id }).sort('-createdAt');
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
