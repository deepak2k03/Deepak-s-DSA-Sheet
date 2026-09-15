import { Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import HomePage from "./components/HomePage"; // Ensure this points to your new Home
import Header from "./components/Header";
import AdminRoute from "./components/AdminRoute";
import TopicPage from "./pages/TopicPage"; // The new generic page we built
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Topics from "./pages/Topics";
import ProfilePage from "./pages/ProfilePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import POTDPage from './pages/POTDPage';
import AdminPage from './pages/AdminPage';
import SupportCreatorPage from './pages/SupportCreatorPage';
import SolutionPage from './pages/SolutionPage';

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
        <div key={location.pathname} className="page-transition">
        <Routes>
          {/* Main Landing Page */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/topic/:slug" element={<TopicPage />} />
          <Route path="/problem/:id/solution" element={<SolutionPage />} />
          <Route path="/potd" element={<POTDPage />} />
          <Route path="/support" element={<SupportCreatorPage />} />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        </Routes>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
