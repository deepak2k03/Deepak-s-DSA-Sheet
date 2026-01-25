import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import HomePage from "./components/HomePage"; // Ensure this points to your new Home
import Header from "./components/Header";
import TopicPage from "./pages/TopicPage"; // The new generic page we built
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Topics from "./pages/Topics";
import ProfilePage from "./pages/ProfilePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import POTDPage from './pages/POTDPage';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans text-slate-900 dark:text-slate-100">
        <Header />
        <Routes>
          {/* Main Landing Page */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/topic/:slug" element={<TopicPage />} />
          <Route path="/potd" element={<POTDPage />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
