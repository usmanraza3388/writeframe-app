import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { supabase } from "../assets/lib/supabaseClient";
import { useNavigate, Link } from "react-router-dom";

/** Social button (accepts inline style prop to guarantee spacing) */
function SocialButton({
  label,
  onClick,
  children,
  style,
}: {
  label: string;
  onClick: () => Promise<void> | void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: "100%",
        borderRadius: 12,
        padding: "12px 16px",
        border: "1px solid rgba(0,0,0,0.8)",
        background: "#ffffff",
        boxSizing: "border-box",
        cursor: "pointer",
        ...style,
      }}
    >
      <span style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </span>
      <span style={{ fontFamily: "'Cormorant', serif", fontSize: 14, color: "#000" }}>{label}</span>
    </button>
  );
}

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check for pending prompt on component mount
  useEffect(() => {
    // Intentionally empty - we don't need to do anything on mount
    // The prompt will be handled after sign in
  }, []);

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Signed in successfully");
        
        // Check for pending prompt after successful sign in
        const pendingPrompt = sessionStorage.getItem('pending_prompt');

        if (pendingPrompt) {
          sessionStorage.removeItem('pending_prompt');
          navigate(`/compose-scene?prompt=${pendingPrompt}`);
        } else {
          navigate("/home-feed");
        }
      }
    } catch (err: any) {
      setMessage(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "facebook" | "apple") => {
    try {
      setMessage(null);
      setLoading(true);
      
      // Store any pending prompt in localStorage for OAuth redirect
      const pendingPrompt = sessionStorage.getItem('pending_prompt');
      
      if (pendingPrompt) {
        localStorage.setItem('oauth_pending_prompt', pendingPrompt);
        sessionStorage.removeItem('pending_prompt');
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`, // 👈 CHANGED: redirect to auth callback
        },
      });
      
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Redirecting...");
      }
    } catch (err: any) {
      setMessage(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  // Reusable inline styles
  const containerStyle: React.CSSProperties = {
    width: 375,
    height: 812,
    background: "#ffffff",
    borderRadius: 18,
    padding: 32,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: 24,
    overflowY: "auto",
    alignSelf: "center",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    display: "block",
    boxSizing: "border-box",
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#FAF8F2",
    outline: "none",
    fontSize: 15,
    margin: 0,
  };

  const btnStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    background: "#1A1A1A",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFFF" }}>
      <div style={containerStyle}>
        {/* Title */}
        <h1 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, textAlign: "center" }}>
          Sign in to continue
        </h1>

        {/* Form */}
        <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          <button type="submit" disabled={loading} style={{ ...btnStyle }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Forgot Password Link */}
        <Link 
          to="/forgot-password"
          style={{
            color: "#6B7280",
            fontFamily: "'Cormorant', serif",
            fontSize: "14px",
            textDecoration: "underline",
            textAlign: "center",
            marginTop: "-8px",
            transition: "color 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#1A1A1A";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#6B7280";
          }}
        >
          Forgot your password?
        </Link>

        {/* Terms */}
        <p style={{ margin: 0, fontFamily: "'Cormorant', serif", fontSize: 12, color: "#4B5563", textAlign: "center", lineHeight: 1.4 }}>
          By clicking Sign in or Continue with Google, you agree to{" "}
          <span style={{ textDecoration: "underline" }}>Terms of Use</span> and{" "}
          <span style={{ textDecoration: "underline" }}>Privacy Policy</span>.
        </p>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <hr style={{ flex: 1, border: "none", height: 1, background: "#E5E7EB" }} />
          <span style={{ fontSize: 12, color: "#6B7280" }}>or</span>
          <hr style={{ flex: 1, border: "none", height: 1, background: "#E5E7EB" }} />
        </div>

        {/* Social buttons - Only Google shown */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SocialButton label="Continue with Google" onClick={() => handleOAuth("google")} style={{}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M21.6 12.24c0-.72-.06-1.44-.18-2.12H12v4.02h5.76c-.24 1.3-.96 2.42-2.04 3.18v2.64h3.3c1.92-1.76 3.06-4.38 3.06-7.72z" fill="#4285F4"/>
              <path d="M12 22c2.7 0 4.98-.9 6.64-2.46l-3.3-2.64c-.9.6-2.04.96-3.34.96-2.56 0-4.72-1.72-5.49-4.04H3.96v2.54C5.64 19.94 8.64 22 12 22z" fill="#34A853"/>
              <path d="M6.51 13.82A6.996 6.996 0 0 1 6 12c0-.68.12-1.34.33-1.96V7.5H3.96A9.99 9.99 0 0 0 2 12c0 1.66.36 3.24 1 4.66l3.51-2.84z" fill="#FBBC05"/>
              <path d="M12 5.5c1.48 0 2.8.5 3.85 1.48L19.2 4.34C17.04 2.36 14.16 1.2 11 1.2 7.64 1.2 4.64 3.26 3 6.46l3.51 2.84C7.28 7.22 9.44 5.5 12 5.5z" fill="#EA4335"/>
            </svg>
          </SocialButton>
        </div>

        {message && (
          <p style={{ marginTop: 8, textAlign: "center", color: "#DC2626", fontSize: 14 }}>{message}</p>
        )}
      </div>
    </div>
  );
}