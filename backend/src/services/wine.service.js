import { WineRecord } from '../models/wineRecord.model.js';
import { calculateWinePrediction } from '../utils/prediction.js';
import { serializeWineRecord } from '../utils/serializers.js';

export const createPredictionRecord = async ({ userId, inputs }) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const prediction = calculateWinePrediction(inputs);

  try {
    const record = await WineRecord.create({
      user: userId,
      inputs,
      prediction,
    });

    return serializeWineRecord(record);
  } catch (error) {
    throw new Error(`Failed to create prediction record: ${error.message}`);
  }
};

export const getUserHistory = async ({
  userId,
  page = 1,
  limit = 10,
  category,
}) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const query = { user: userId };

  if (category) {
    query['prediction.category'] = category;
  }

  const skip = (page - 1) * limit;

  try {
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
  } catch (error) {
    throw new Error(`Failed to fetch user history: ${error.message}`);
  }
};
