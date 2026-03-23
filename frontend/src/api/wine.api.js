import apiClient from './client.js';

export const createPrediction = async (payload) => {
  const response = await apiClient.post('/wines/predict', payload);
  return response.data;
};

export const getPredictionHistory = async ({ page = 1, limit = 10, category } = {}) => {
  const response = await apiClient.get('/wines', {
    params: {
      page,
      limit,
      ...(category ? { category } : {})
    }
  });

  return response.data;
};

export const getDashboardSummary = async () => {
  const response = await apiClient.get('/dashboard/summary');
  return response.data;
};

