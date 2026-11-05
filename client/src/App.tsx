import React, { lazy, Suspense } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import HomePage from "./components/HomePage";
import Header from "./components/Header";
import AdminRoute from "./components/AdminRoute";

// Lazy-loaded route views for optimized code splitting
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const Topics = lazy(() => import("./pages/Topics"));
const TopicPage = lazy(() => import("./pages/TopicPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const POTDPage = lazy(() => import("./pages/POTDPage"));
const SolutionPage = lazy(() => import("./pages/SolutionPage"));
const VisualizersPage = lazy(() => import("./pages/VisualizersPage"));
const VisualizerDetailPage = lazy(() => import("./pages/VisualizerDetailPage"));
const SupportCreatorPage = lazy(() => import("./pages/SupportCreatorPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));

const PageLoader: React.FC = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-500" />
      <span className="text-xs font-medium text-[var(--text-muted)]">Loading...</span>
    </div>
  </div>
);

function App() {
  const location = useLocation();

  return (
    <ThemeProvider>
      <div
        className="min-h-screen font-sans"
        style={{
          backgroundColor: 'var(--bg-base)',
          color: 'var(--text-primary)',
        }}
      >
        <Header />
        <ErrorBoundary>
          <div key={location.pathname} className="page-transition">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Main Landing Page */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                <Route path="/topics" element={<Topics />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/:username" element={<ProfilePage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/topic/:slug" element={<TopicPage />} />
                <Route path="/problem/:id/solution" element={<SolutionPage />} />
                <Route path="/potd" element={<POTDPage />} />
                <Route path="/visualizers" element={<VisualizersPage />} />
                <Route path="/visualizers/:slug" element={<VisualizerDetailPage />} />
                <Route path="/visualizer" element={<Navigate to="/visualizers" replace />} />
                <Route path="/support" element={<SupportCreatorPage />} />
                <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
              </Routes>
            </Suspense>
          </div>
        </ErrorBoundary>
      </div>
    </ThemeProvider>
  );
}

export default App;
