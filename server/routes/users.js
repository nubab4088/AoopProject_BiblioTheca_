const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ...existing code...

// Clear all users endpoint (for development/testing)
router.delete('/clear-all', async (req, res) => {
  try {
    const result = await User.deleteMany({});
    console.log(`🗑️ Cleared ${result.deletedCount} users from database`);
    res.json({ 
      success: true, 
      message: `Cleared ${result.deletedCount} users`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('❌ Error clearing users:', error);
    res.status(500).json({ error: 'Failed to clear users' });
  }
});

// Update user's KP (Knowledge Points)
router.put('/:id/kp', async (req, res) => {
  try {
    const { kpAmount } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update KP by adding the amount (can be positive or negative)
    user.kp = (user.kp || 0) + kpAmount;
    
    // Ensure KP doesn't go below 0
    if (user.kp < 0) {
      user.kp = 0;
    }
    
    await user.save();
    
    console.log(`✅ Updated KP for ${user.name}: ${kpAmount > 0 ? '+' : ''}${kpAmount} KP (Total: ${user.kp})`);
    res.json(user);
  } catch (error) {
    console.error('❌ Error updating KP:', error);
    res.status(500).json({ error: 'Failed to update KP' });
  }
});

// ...existing code...

module.exports = router;