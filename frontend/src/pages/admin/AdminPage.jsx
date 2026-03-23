import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  getAdminOverview,
  getAdminRecords,
  getAdminUsers,
} from '../../api/admin.api.js';
import ChartCard from '../../components/common/ChartCard.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import { useTheme } from '../../hooks/useTheme.js';
import {
  formatDateTime,
  getCategoryClassName,
} from '../../utils/formatters.js';
import { getApiErrorMessage } from '../../utils/validation.js';

const AdminPage = () => {
  const { isDark } = useTheme();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const chartTheme = isDark
    ? {
        primary: '#f0dde1',
        poor: '#8d6d78',
        average: '#d7b067',
        good: '#b8c7b5',
        excellent: '#ffffff',
        grid: 'rgba(240, 221, 225, 0.12)',
        axis: '#ccb8be',
        tooltipBackground: 'rgba(14, 14, 14, 0.96)',
        tooltipBorder: 'rgba(240, 221, 225, 0.14)',
        tooltipText: '#fbf4f2',
        shadow: '0 18px 36px rgba(0, 0, 0, 0.26)',
      }
    : {
        primary: '#6d1731',
        poor: '#c08b9a',
        average: '#b78a3b',
        good: '#6a806d',
        excellent: '#571225',
        grid: 'rgba(109, 23, 49, 0.12)',
        axis: '#6e5a61',
        tooltipBackground: 'rgba(255, 251, 248, 0.98)',
        tooltipBorder: 'rgba(109, 23, 49, 0.16)',
        tooltipText: '#241317',
        shadow: '0 18px 40px rgba(57, 16, 31, 0.12)',
      };

  const categoryColors = {
    Poor: chartTheme.poor,
    Average: chartTheme.average,
    Good: chartTheme.good,
    Excellent: chartTheme.excellent,
  };

  const tooltipContentStyle = {
    background: chartTheme.tooltipBackground,
    border: `1px solid ${chartTheme.tooltipBorder}`,
    borderRadius: '16px',
    color: chartTheme.tooltipText,
    boxShadow: chartTheme.shadow,
  };

  useEffect(() => {
    let isMounted = true;

    const loadAdminData = async () => {
      try {
        setLoading(true);

        const [overviewResponse, usersResponse, recordsResponse] =
          await Promise.all([
            getAdminOverview(),
            getAdminUsers({ page: 1, limit: 6 }),
            getAdminRecords({ page: 1, limit: 8 }),
          ]);

        if (isMounted) {
          setOverview(overviewResponse.data.overview);
          setUsers(usersResponse.data.users);
          setRecords(recordsResponse.data.records);
          setError('');
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            getApiErrorMessage(requestError, 'Unable to load admin insights'),
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAdminData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading admin workspace" />;
  }

  if (error) {
    return <div className="status-card status-card--error">{error}</div>;
  }

  const stats = overview?.stats || {
    totalUsers: 0,
    totalPredictions: 0,
    averageScore: 0,
  };

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <span className="page-header__eyebrow">Admin Panel</span>
          <h2>Platform monitoring and user analytics</h2>
          <p>
            Track adoption, prediction distribution, active users, and the
            latest saved analyses.
          </p>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          helper="Registered accounts"
          tone="rose"
        />
        <StatCard
          label="Total Predictions"
          value={stats.totalPredictions}
          helper="Stored records platform-wide"
          tone="gold"
        />
        <StatCard
          label="Average Score"
          value={`${stats.averageScore}/100`}
          helper="Across every prediction"
          tone="green"
        />
        <StatCard
          label="Top Contributors"
          value={overview?.topUsers?.length || 0}
          helper="Users in the leaderboard"
          tone="slate"
        />
      </section>

      <section className="split-grid">
        <ChartCard
          title="Global Category Mix"
          subtitle="Prediction categories across all users"
        >
          {overview?.categoryBreakdown?.length ? (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={overview.categoryBreakdown}
                    dataKey="count"
                    nameKey="category"
                    innerRadius={68}
                    outerRadius={105}
                  >
                    {overview.categoryBreakdown.map((entry) => (
                      <Cell
                        key={entry.category}
                        fill={categoryColors[entry.category] || '#7e6c67'}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipContentStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No platform data yet"
              description="The admin charts will appear once users start saving predictions."
            />
          )}
        </ChartCard>

        <ChartCard
          title="Top Active Users"
          subtitle="Users ranked by saved predictions"
        >
          {overview?.topUsers?.length ? (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={overview.topUsers}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={chartTheme.grid}
                  />
                  <XAxis dataKey="name" stroke={chartTheme.axis} />
                  <YAxis stroke={chartTheme.axis} />
                  <Tooltip contentStyle={tooltipContentStyle} />
                  <Bar
                    dataKey="predictionCount"
                    fill={chartTheme.primary}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No active users yet"
              description="This chart will rank users once prediction records exist."
            />
          )}
        </ChartCard>
      </section>

      <section className="surface-card">
        <div className="section-heading">
          <div>
            <h3>User Monitoring</h3>
            <p>Recent accounts with prediction analytics and last activity.</p>
          </div>
        </div>

        {users.length > 0 ? (
          <div className="table-wrapper">
            <table className="table table--responsive">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Predictions</th>
                  <th>Average Score</th>
                  <th>Last Prediction</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td data-label="User">
                      <strong>{user.name}</strong>
                      <div className="muted-text">{user.email}</div>
                    </td>
                    <td data-label="Role">
                      <span className="table__label" aria-hidden="true">
                        Role
                      </span>
                      <span className="pill pill--muted">{user.role}</span>
                    </td>
                    <td data-label="Predictions">
                      {user.analytics.predictionCount}
                    </td>
                    <td data-label="Average Score">
                      {user.analytics.averageScore}/100
                    </td>
                    <td data-label="Last Prediction">
                      {formatDateTime(user.analytics.lastPredictionAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No users found"
            description="Registered users will appear here after sign up."
          />
        )}
      </section>

      <section className="surface-card">
        <div className="section-heading">
          <div>
            <h3>Latest Prediction Records</h3>
            <p>Cross-user prediction activity for platform monitoring.</p>
          </div>
        </div>

        {records.length > 0 ? (
          <div className="table-wrapper">
            <table className="table table--responsive">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Category</th>
                  <th>Score</th>
                  <th>Rating</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td data-label="User">
                      <strong>{record.user?.name || 'Unknown User'}</strong>
                      <div className="muted-text">
                        {record.user?.email || 'No email'}
                      </div>
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
                    <td data-label="Created">
                      {formatDateTime(record.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No records yet"
            description="Prediction activity will appear here when users start analyzing wine samples."
          />
        )}
      </section>
    </div>
  );
};

export default AdminPage;
