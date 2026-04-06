import express from 'express';
import Chat from '../models/Chat.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/start', protect, async (req, res) => {
  try {
    const { itemId, ownerId } = req.body;
    if (req.user._id.toString() === ownerId)
      return res.status(400).json({ message: 'Cannot chat with yourself' });
    let chat = await Chat.findOne({
      item: itemId,
      participants: { $all: [req.user._id, ownerId] }
    }).populate('participants', 'name avatar studentId').populate('item', 'title type status');
    if (!chat) {
      chat = await Chat.create({ item: itemId, participants: [req.user._id, ownerId], messages: [] });
      await chat.populate('participants', 'name avatar studentId');
      await chat.populate('item', 'title type status');
    }
    res.json(chat);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/my-chats', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('item', 'title type status images')
      .populate('participants', 'name avatar studentId')
      .sort('-lastMessageAt');
    res.json(chats);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:chatId', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('participants', 'name avatar studentId')
      .populate('messages.sender', 'name avatar')
      .populate('item', 'title type status images');
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (!chat.participants.some(p => p._id.toString() === req.user._id.toString()))
      return res.status(403).json({ message: 'Not authorized' });
    res.json(chat);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:chatId/message', protect, async (req, res) => {
  try {
    const { content, type = 'text', location, imageUrl } = req.body;
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    const message = { sender: req.user._id, content, type, location, imageUrl };
    chat.messages.push(message);
    chat.lastMessage = type === 'location' ? '📍 Location shared' : content;
    chat.lastMessageAt = new Date();
    await chat.save();
    const saved = chat.messages[chat.messages.length - 1];
    await chat.populate('messages.sender', 'name avatar');
    const populated = chat.messages.find(m => m._id.toString() === saved._id.toString());
    res.json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
