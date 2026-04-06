import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, studentId, department, contactNumber } = req.body;
    if (!name || !email || !password || !studentId)
      return res.status(400).json({ message: 'All fields are required' });
    const exists = await User.findOne({ $or: [{ email }, { studentId }] });
    if (exists) return res.status(400).json({ message: 'Email or Student ID already registered' });
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed, studentId, department, contactNumber });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, studentId: user.studentId, role: user.role, avatar: user.avatar }
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password))
      return res.status(400).json({ message: 'Invalid email or password' });
    if (!user.isActive) return res.status(403).json({ message: 'Account has been suspended' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, studentId: user.studentId, role: user.role, avatar: user.avatar }
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

router.put('/profile', protect, async (req, res) => {
  try {
    const { name, department, contactNumber, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, department, contactNumber, avatar },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
