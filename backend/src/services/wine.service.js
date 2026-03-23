import { WineRecord } from '../models/wineRecord.model.js';
import { calculateWinePrediction } from '../utils/prediction.js';
import { serializeWineRecord } from '../utils/serializers.js';

export const createPredictionRecord = async ({ userId, inputs }) => {
  const prediction = calculateWinePrediction(inputs);

  const record = await WineRecord.create({
    user: userId,
    inputs,
    prediction,
  });

  return serializeWineRecord(record);
};

export const getUserHistory = async ({
  userId,
  page = 1,
  limit = 10,
  category,
}) => {
  const query = { user: userId };

  if (category) {
    query['prediction.category'] = category;
  }

  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    WineRecord.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    WineRecord.countDocuments(query),
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
