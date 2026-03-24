import { useEffect, useState } from 'react';

import { getPredictionHistory } from '../../api/wine.api.js';
import EmptyState from '../../components/common/EmptyState.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import StatusMessage from '../../components/common/StatusMessage.jsx';
import {
  formatDateTime,
  getCategoryClassName,
} from '../../utils/formatters.js';
import { getApiErrorMessage } from '../../utils/validation.js';

const categoryOptions = ['', 'Poor', 'Average', 'Good', 'Excellent'];

const HistoryPage = () => {
  const [history, setHistory] = useState({
    records: [],
    pagination: {
      page: 1,
      pages: 1,
      total: 0,
    },
  });
  const [filters, setFilters] = useState({
    page: 1,
    category: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      try {
        setLoading(true);
        const response = await getPredictionHistory({
          page: filters.page,
          limit: 10,
          category: filters.category || undefined,
        });

        if (isMounted) {
          setHistory(response.data);
          setError('');
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            getApiErrorMessage(
              requestError,
              'Unable to fetch prediction history',
            ),
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [filters.page, filters.category]);

  const handleCategoryChange = (event) => {
    const { value } = event.target;
    setFilters({
      page: 1,
      category: value,
    });
  };

  const handlePageChange = (nextPage) => {
    setFilters((current) => ({
      ...current,
      page: nextPage,
    }));
  };

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading prediction history" />;
  }

  if (error) {
    return <StatusMessage title="Unable to load history" message={error} />;
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <span className="page-header__eyebrow">History</span>
          <h2>Stored predictions and quality outcomes</h2>
          <p>
            Review previous analyses, filter by category, and track how each
            sample performed.
          </p>
        </div>
      </section>

      <section className="surface-card">
        <div className="filter-row">
          <div className="section-heading">
            <div>
              <h3>Prediction History</h3>
              <p>{history.pagination.total} records stored</p>
            </div>
          </div>

          <div className="filter-row__controls">
            <label className="filter-row__label">
              <span>Category</span>
              <select
                className="form-field__control form-field__control--select"
                value={filters.category}
                onChange={handleCategoryChange}
              >
                {categoryOptions.map((option) => (
                  <option key={option || 'all'} value={option}>
                    {option || 'All Categories'}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {history.records.length > 0 ? (
          <>
            <div className="table-wrapper">
              <table className="table table--responsive">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Score</th>
                    <th>Rating</th>
                    <th>Alcohol</th>
                    <th>pH</th>
                    <th>Volatile Acidity</th>
                  </tr>
                </thead>
                <tbody>
                  {history.records.map((record) => (
                    <tr key={record.id}>
                      <td data-label="Date">
                        {formatDateTime(record.createdAt)}
                      </td>
                      <td data-label="Category">
                        <span className="table__label" aria-hidden="true">
                          Category
                        </span>
                        <span
                          className={getCategoryClassName(
                            record.prediction.category,
                          )}
                        >
                          {record.prediction.category}
                        </span>
                      </td>
                      <td data-label="Score">{record.prediction.score}/100</td>
                      <td data-label="Rating">{record.prediction.rating}/10</td>
                      <td data-label="Alcohol">{record.inputs.alcohol}%</td>
                      <td data-label="pH">{record.inputs.pH}</td>
                      <td data-label="Volatile Acidity">
                        {record.inputs.volatileAcidity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button
                type="button"
                className="button button--secondary"
                disabled={filters.page <= 1}
                onClick={() => handlePageChange(filters.page - 1)}
              >
                Previous
              </button>
              <span className="pagination__status" aria-live="polite">
                Page {history.pagination.page} of {history.pagination.pages}
              </span>
              <button
                type="button"
                className="button button--secondary"
                disabled={filters.page >= history.pagination.pages}
                onClick={() => handlePageChange(filters.page + 1)}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <EmptyState
            title="History is empty"
            description="Predictions saved from the analyzer will appear here once you start using the app."
          />
        )}
      </section>
    </div>
  );
};

export default HistoryPage;
