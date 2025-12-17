import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { supabase } from "./assets/lib/supabaseClient";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useUserSettings } from "./hooks/useUserSettings";
import LandingPage from "./pages/LandingPage";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback"; // 👈 ADDED IMPORT
import Welcome from "./pages/Welcome";
import GenreSelection from "./pages/GenreSelection";
import ExpressionSelection from "./pages/ExpressionSelection";
import StudioReadyGuide from "./pages/StudioReadyGuide"; // 👈 ADDED IMPORT
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Drafts from "./pages/Drafts";
import Settings from "./pages/Settings";
import AboutPage from "./pages/AboutPage"; // 👈 ADDED IMPORT
import { SceneComposer } from "./components/Scenes/SceneComposer";
import { MonologueComposer } from "./components/Monologues/MonologueComposer";
import CharacterComposer from "./components/Characters/CharacterComposer";
import FrameComposer from "./components/Frames/FrameComposer";
import HomeFeed from "./components/HomeFeed/HomeFeed";
import { WhisperComposer } from "./components/Whisper/WhisperComposer";
import { InboxPage } from "./components/Whisper/InboxPage";
import { WhisperThread } from "./components/Whisper/WhisperThread";

function AppContent() {
  useUserSettings();
  
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, username, genre_persona, expression")
          .eq("id", session.user.id)
          .single();
        setProfile(profileData);
      }

      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* Temporary testing route - REMOVE BEFORE DEPLOYMENT */}
        <Route path="/test-scene-composer" element={<SceneComposer />} />
        <Route path="/test-monologue-composer" element={<MonologueComposer />} />
        <Route path="/test-home-feed" element={<HomeFeed />} />
        <Route path="/test-frame-composer" element={<FrameComposer />} />

        {/* 👇 UPDATED: Landing Page as Root Route 👇 */}
        <Route path="/" element={<LandingPage />} />

        {/* 👇 ADDED: About Page Route (Public) 👇 */}
        <Route path="/about" element={<AboutPage />} />

        {/* 👇 ADDED: New root route for logged-in users 👇 */}
        <Route
          path="/app"
          element={
            !session ? (
              <Navigate to="/" replace />
            ) : !profile?.genre_persona ? (
              <Navigate to="/welcome" replace />
            ) : !profile?.expression ? (
              <Navigate to="/expression-selection" replace />
            ) : (
              <Navigate to="/home-feed" replace />
            )
          }
        />

        {/* Main Home Feed Route */}
        <Route
          path="/home-feed"
          element={session ? <HomeFeed /> : <Navigate to="/signin" replace />}
        />

        {/* NEW: Dashboard Route */}
        <Route
          path="/dashboard"
          element={session ? <Dashboard /> : <Navigate to="/signin" replace />}
        />

        {/* NEW: Drafts Route */}
        <Route
          path="/drafts"
          element={session ? <Drafts /> : <Navigate to="/signin" replace />}
        />

        {/* NEW: Settings Route */}
        <Route
          path="/settings"
          element={session ? <Settings /> : <Navigate to="/signin" replace />}
        />

        {/* NEW: Inbox Route */}
        <Route
          path="/inbox"
          element={session ? <InboxPage /> : <Navigate to="/signin" replace />}
        />

        {/* ADDED: Whisper Thread Route */}
        <Route
          path="/whisper-thread/:userId"
          element={session ? <WhisperThread /> : <Navigate to="/signin" replace />}
        />

        {/* Auth Screens - REMOVED session checks to fix OAuth */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} /> {/* 👈 ADDED ROUTE */}

        {/* Onboarding Flow */}
        <Route
          path="/welcome"
          element={session ? <Welcome /> : <Navigate to="/signup" replace />}
        />
        <Route
          path="/genre-selection"
          element={session ? <GenreSelection /> : <Navigate to="/signup" replace />}
        />
        <Route
          path="/expression-selection"
          element={session ? <ExpressionSelection /> : <Navigate to="/signup" replace />}
        />
        
        {/* ADDED: Studio Ready Guide Route */}
        <Route
          path="/studio-ready"
          element={session ? <StudioReadyGuide /> : <Navigate to="/signin" replace />}
        />

        {/* Profile Route */}
        <Route
          path="/profile/:id"
          element={session ? <Profile /> : <Navigate to="/signin" replace />}
        />

        {/* Scene Composer Route */}
        <Route
          path="/compose-scene"
          element={session ? <SceneComposer /> : <Navigate to="/signin" replace />}
        />

        {/* Monologue Composer Route */}
        <Route
          path="/compose-monologue"
          element={session ? <MonologueComposer /> : <Navigate to="/signin" replace />}
        />

        {/* Character Composer Route */}
        <Route
          path="/compose-character"
          element={session ? <CharacterComposer /> : <Navigate to="/signin" replace />}
        />

        {/* Frame Composer Route */}
        <Route
          path="/compose-frame"
          element={session ? <FrameComposer /> : <Navigate to="/signin" replace />}
        />

        {/* ADDED: Whisper Composer Route */}
        <Route
          path="/whisper/:userId"
          element={session ? <WhisperComposer /> : <Navigate to="/signin" replace />}
        />

        {/* Fallback 404 */}
        <Route
          path="*"
          element={
            <div style={{ 
              display: 'flex', 
              minHeight: '100vh', 
              flexDirection: 'column', 
              gap: '24px', 
              alignItems: 'center', 
              justifyContent: 'center', 
              backgroundColor: '#f5f5f5',
              fontFamily: 'Playfair Display, serif'
            }}>
              <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1C1C1C' }}>404 | Page Not Found</h1>
              <div style={{ display: 'flex', gap: '16px' }}>
                <Link
                  to="/"
                  style={{
                    backgroundColor: '#1C1C1C',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontFamily: 'Playfair Display, serif'
                  }}
                >
                  Go to Home
                </Link>
                <Link
                  to="/signin"
                  style={{
                    backgroundColor: '#55524F',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontFamily: 'Playfair Display, serif'
                  }}
                >
                  Go to Sign In
                </Link>
                <Link
                  to="/home-feed"
                  style={{
                    backgroundColor: '#FAF8F2',
                    color: '#1C1C1C',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    border: '1px solid #1C1C1C',
                    fontFamily: 'Playfair Display, serif'
                  }}
                >
                  Go to Home Feed
                </Link>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;