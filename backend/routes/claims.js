import express from 'express';
import Claim from '../models/Claim.js';
import Item from '../models/Item.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { itemId, message, proofDescription } = req.body;
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.postedBy.toString() === req.user._id.toString())
      return res.status(400).json({ message: 'Cannot claim your own item' });
    const existing = await Claim.findOne({ item: itemId, claimedBy: req.user._id });
    if (existing) return res.status(400).json({ message: 'You already submitted a claim for this item' });
    const claim = await Claim.create({ item: itemId, claimedBy: req.user._id, message, proofDescription });
    await claim.populate('item', 'title type');
    await claim.populate('claimedBy', 'name studentId email');
    res.status(201).json(claim);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/my-claims', protect, async (req, res) => {
  try {
    const claims = await Claim.find({ claimedBy: req.user._id })
      .populate('item', 'title type status images')
      .sort('-createdAt');
    res.json(claims);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/item/:itemId', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    const claims = await Claim.find({ item: req.params.itemId })
      .populate('claimedBy', 'name studentId email contactNumber avatar')
      .sort('-createdAt');
    res.json(claims);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:claimId/status', protect, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const claim = await Claim.findById(req.params.claimId).populate('item');
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    const item = await Item.findById(claim.item._id);
    if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    claim.status = status;
    claim.adminNote = adminNote || '';
    if (status === 'approved') {
      claim.resolvedAt = new Date();
      await Item.findByIdAndUpdate(claim.item._id, { status: 'claimed' });
    }
    await claim.save();
    res.json(claim);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
