import { Navigate, Outlet } from 'react-router-dom';

import AnimatedBackdrop from '../components/common/AnimatedBackdrop.jsx';
import { useAuth } from '../hooks/useAuth.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ThemeToggleButton from '../components/common/ThemeToggleButton.jsx';

const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Preparing authentication" />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-shell">
      <AnimatedBackdrop variant="auth" />
      <section className="auth-hero">
        <div className="auth-hero__content">
          <div className="auth-hero__top">
            <span className="auth-hero__eyebrow">Wine Intelligence Platform</span>
            <ThemeToggleButton />
          </div>
          <h1>Analyze wine chemistry, predict quality, and monitor performance at scale.</h1>
        </div>
      </section>

      <section className="auth-panel layout-container">
        <Outlet />
      </section>
    </div>
  );
};

export default AuthLayout;
