const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

// Update user profile (protected route)
router.put('/profile', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { name, password } = req.body;

  if (!name && !password) {
    return res.status(400).json({ message: 'Name or password required to update' });
  }

  try {
    const updates = {};
    if (name) updates.name = name;
    if (password) {
      updates.password = bcrypt.hashSync(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: 'Profile updated successfully' });

  } catch (err) {
    console.error("Profile Update Error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
