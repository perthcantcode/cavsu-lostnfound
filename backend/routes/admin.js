import express from 'express';
import User from '../models/User.js';
import Item from '../models/Item.js';
import Claim from '../models/Claim.js';
import Chat from '../models/Chat.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalItems, totalClaims, lostItems, foundItems, resolvedItems] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Item.countDocuments(),
      Claim.countDocuments(),
      Item.countDocuments({ type: 'lost', status: 'active' }),
      Item.countDocuments({ type: 'found', status: 'active' }),
      Item.countDocuments({ status: 'resolved' })
    ]);
    res.json({ totalUsers, totalItems, totalClaims, lostItems, foundItems, resolvedItems });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/users/:id/toggle', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'suspended'}`, isActive: user.isActive });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/items', async (req, res) => {
  try {
    const items = await Item.find().populate('postedBy', 'name studentId').sort('-createdAt');
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/items/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted by admin' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/claims', async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate('item', 'title type')
      .populate('claimedBy', 'name studentId email')
      .sort('-createdAt');
    res.json(claims);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/items/:id/resolve', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, { status: 'resolved' }, { new: true });
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
