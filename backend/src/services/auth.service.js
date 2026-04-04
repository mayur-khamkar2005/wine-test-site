import { USER_ROLES } from '../constants/roles.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { serializeUser } from '../utils/serializers.js';
import { generateAccessToken } from '../utils/token.js';

export const registerUser = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required');
  }

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    throw new ApiError(400, 'Name must be at least 2 characters long');
  }

  const existingUser = await User.findOne({ email: trimmedEmail });

  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  try {
    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password,
      role: USER_ROLES.USER,
      lastLoginAt: new Date(),
    });

    return {
      user: serializeUser(user),
      token: generateAccessToken(user),
    };
  } catch (error) {
    throw new ApiError(500, `Failed to create user: ${error.message}`);
  }
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const trimmedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: trimmedEmail }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  try {
    user.lastLoginAt = new Date();
    await user.save();

    return {
      user: serializeUser(user),
      token: generateAccessToken(user),
    };
  } catch (error) {
    throw new ApiError(500, `Failed to update login time: ${error.message}`);
  }
};

export const getCurrentUser = async (userId) => {
  if (!userId) {
    throw new ApiError(400, 'User ID is required');
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return serializeUser(user);
  } catch (error) {
    if (error.statusCode === 404) {
      throw error;
    }
    throw new ApiError(500, `Failed to fetch user: ${error.message}`);
  }
};
