export const formatDateTime = (value) => {
  if (!value) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

export const formatMetricName = (value) =>
  value
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (character) => character.toUpperCase());

export const getCategoryClassName = (category = '') => {
  const normalizedCategory = category.toLowerCase();

  if (normalizedCategory === 'excellent') {
    return 'pill pill--excellent';
  }

  if (normalizedCategory === 'good') {
    return 'pill pill--good';
  }

  if (normalizedCategory === 'average') {
    return 'pill pill--average';
  }

  if (normalizedCategory === 'poor') {
    return 'pill pill--poor';
  }

  return 'pill pill--muted';
};
