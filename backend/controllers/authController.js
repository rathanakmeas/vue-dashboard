import User from '../models/User.js';
import { generateToken } from '../config/jwt.js';
import { logActivity } from '../utils/activityLogger.js';

export const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      username,
      email,
      password,
      firstName,
      lastName
    });

    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    console.log('=== LOGIN ATTEMPT START ===');
    console.log('Login attempt - Body:', JSON.stringify(req.body), 'Email:', req.body?.email, 'Password:', req.body?.password ? '[provided]' : '[missing]');
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('VALIDATION FAILED - Email:', email, 'Password:', password ? '[provided]' : '[missing]');
      return res.status(400).json({ message: 'Email and password required' });
    }
    console.log('✓ Validation passed');

    // Check if user exists
    const user = await User.findOne({ email });
    console.log('✓ User query completed. Found:', !!user);
    if (!user) {
      console.log('✗ User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    console.log('Comparing password...');
    const isMatch = await user.comparePassword(password);
    console.log('✓ Password comparison completed. Match:', isMatch);
    if (!isMatch) {
      console.log('✗ Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Generating token...');
    const token = generateToken(user._id);
    console.log('✓ Token generated');
    
    // Log login activity
    console.log('Logging activity...');
    await logActivity(user._id, 'LOGIN', 'USER', user._id, { email });
    console.log('✓ Activity logged');

    console.log('=== LOGIN SUCCESSFUL - Sending response ===');
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.log('✗✗✗ LOGIN ERROR ✗✗✗', error.message);
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, profilePicture } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { firstName, lastName, profilePicture, updatedAt: Date.now() },
      { new: true }
    ).select('-password');

    // Log profile update activity
    await logActivity(req.userId, 'PROFILE_UPDATE', 'PROFILE', req.userId, { firstName, lastName });

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    await logActivity(req.userId, 'PASSWORD_CHANGE', 'AUTH', req.userId, {}, req.ip, req.headers['user-agent']);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({ message: 'If email exists, password reset link sent' });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = generateToken(user._id, '1h');
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    await logActivity(user._id, 'PASSWORD_RESET_REQUEST', 'AUTH', user._id, {}, req.ip, req.headers['user-agent']);

    // In production, send email with reset link
    res.json({ 
      message: 'Password reset link sent',
      // For development only - in production remove this
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      resetToken,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    await logActivity(user._id, 'PASSWORD_RESET_COMPLETE', 'AUTH', user._id, {}, req.ip, req.headers['user-agent']);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
