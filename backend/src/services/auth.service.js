import { USER_ROLES } from '../constants/roles.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { serializeUser } from '../utils/serializers.js';
import { generateAccessToken } from '../utils/token.js';

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: USER_ROLES.USER,
    lastLoginAt: new Date(),
  });

  return {
    user: serializeUser(user),
    token: generateAccessToken(user),
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save();

  return {
    user: serializeUser(user),
    token: generateAccessToken(user),
  };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return serializeUser(user);
};
