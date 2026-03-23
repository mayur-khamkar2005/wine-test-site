import {
  getAdminOverview,
  getAdminRecords,
  getAdminUsers,
} from '../services/admin.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getOverview = asyncHandler(async (_req, res) => {
  const overview = await getAdminOverview();
  res
    .status(200)
    .json(
      new ApiResponse(200, { overview }, 'Admin overview fetched successfully'),
    );
});

export const getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit, 10) || 10, 1),
    50,
  );
  const users = await getAdminUsers({ page, limit });

  res
    .status(200)
    .json(new ApiResponse(200, users, 'Admin users fetched successfully'));
});

export const getRecords = asyncHandler(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit, 10) || 10, 1),
    50,
  );
  const records = await getAdminRecords({ page, limit });

  res
    .status(200)
    .json(new ApiResponse(200, records, 'Admin records fetched successfully'));
});
