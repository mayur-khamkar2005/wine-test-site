import { User } from '../models/user.model.js';
import { WineRecord } from '../models/wineRecord.model.js';
import { serializeUser, serializeWineRecord } from '../utils/serializers.js';

export const getAdminOverview = async () => {
  const [
    totalUsers,
    totalPredictions,
    averageScoreResult,
    categoryBreakdown,
    recentUsers,
    topUsers,
    recentRecords,
  ] = await Promise.all([
    User.countDocuments(),
    WineRecord.countDocuments(),
    WineRecord.aggregate([
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$prediction.score' },
        },
      },
    ]),
    WineRecord.aggregate([
      {
        $group: {
          _id: '$prediction.category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, _id: 1 } },
    ]),
    User.find().sort({ createdAt: -1 }).limit(6).lean(),
    WineRecord.aggregate([
      {
        $group: {
          _id: '$user',
          predictionCount: { $sum: 1 },
          averageScore: { $avg: '$prediction.score' },
          lastPredictionAt: { $max: '$createdAt' },
        },
      },
      { $sort: { predictionCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$user._id',
          name: '$user.name',
          email: '$user.email',
          role: '$user.role',
          predictionCount: 1,
          averageScore: { $round: ['$averageScore', 1] },
          lastPredictionAt: 1,
        },
      },
    ]),
    WineRecord.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('user', 'name email role createdAt lastLoginAt')
      .lean(),
  ]);

  return {
    stats: {
      totalUsers,
      totalPredictions,
      averageScore: Number(
        (averageScoreResult[0]?.averageScore || 0).toFixed(1),
      ),
    },
    categoryBreakdown: categoryBreakdown.map((item) => ({
      category: item._id,
      count: item.count,
    })),
    recentUsers: recentUsers.map((user) => serializeUser(user)),
    topUsers,
    recentRecords: recentRecords.map((record) => serializeWineRecord(record)),
  };
};

export const getAdminUsers = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(),
  ]);

  const userIds = users.map((user) => user._id);

  const userStats = userIds.length
    ? await WineRecord.aggregate([
        {
          $match: {
            user: { $in: userIds },
          },
        },
        {
          $group: {
            _id: '$user',
            predictionCount: { $sum: 1 },
            averageScore: { $avg: '$prediction.score' },
            lastPredictionAt: { $max: '$createdAt' },
          },
        },
      ])
    : [];

  const statsByUser = new Map(
    userStats.map((stat) => [
      stat._id.toString(),
      {
        predictionCount: stat.predictionCount,
        averageScore: Number((stat.averageScore || 0).toFixed(1)),
        lastPredictionAt: stat.lastPredictionAt || null,
      },
    ]),
  );

  return {
    users: users.map((user) => ({
      ...serializeUser(user),
      analytics: statsByUser.get(user._id.toString()) || {
        predictionCount: 0,
        averageScore: 0,
        lastPredictionAt: null,
      },
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getAdminRecords = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    WineRecord.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email role createdAt lastLoginAt')
      .lean(),
    WineRecord.countDocuments(),
  ]);

  return {
    records: records.map((record) => serializeWineRecord(record)),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};
