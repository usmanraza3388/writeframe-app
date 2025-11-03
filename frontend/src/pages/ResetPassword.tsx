// src/pages/ResetPassword.tsx
import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isValidToken, setIsValidToken] = useState(true);
  
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  // Check if we have a valid reset token (Supabase handles this automatically)
  useEffect(() => {
    // Supabase automatically validates the token from the URL
    // If the token is invalid, the updatePassword will fail
  }, []);

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Basic validation
    if (newPassword.length < 6) {
      setMessage({ 
        text: "Password must be at least 6 characters", 
        type: 'error' 
      });
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ 
        text: "Passwords do not match", 
        type: 'error' 
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await updatePassword(newPassword);
      
      if (error) {
        setMessage({ text: error, type: 'error' });
        setIsValidToken(false);
      } else {
        setMessage({ 
          text: "Password updated successfully! Redirecting to sign in...", 
          type: 'success' 
        });
        
        // Redirect to sign in after 2 seconds
        setTimeout(() => {
          navigate("/signin", { replace: true });
        }, 2000);
      }
    } catch (err: any) {
      setMessage({ 
        text: err?.message || "Something went wrong", 
        type: 'error' 
      });
      setIsValidToken(false);
    } finally {
      setLoading(false);
    }
  };

  // Container styles matching your design system
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
    fontFamily: "'Cormorant', serif"
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
    fontFamily: "'Cormorant', serif",
    fontWeight: 600,
    transition: "all 0.2s ease"
  };

  const messageStyle = (type: 'success' | 'error'): React.CSSProperties => ({
    marginTop: 8,
    textAlign: "center",
    color: type === 'success' ? "#10B981" : "#DC2626",
    fontSize: 14,
    fontFamily: "'Cormorant', serif",
    padding: "8px 12px",
    borderRadius: 8,
    background: type === 'success' ? "#F0FDF4" : "#FEF2F2",
    border: `1px solid ${type === 'success' ? "#BBF7D0" : "#FECACA"}`
  });

  if (!isValidToken) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        background: "#FFFFFF" 
      }}>
        <div style={containerStyle}>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ 
              margin: 0, 
              fontFamily: "'Playfair Display', serif", 
              fontSize: 28, 
              fontWeight: 700, 
              color: "#1A1A1A",
              marginBottom: 16
            }}>
              Invalid Reset Link
            </h1>
            <p style={{
              margin: "0 0 24px 0",
              fontFamily: "'Cormorant', serif",
              fontSize: 16,
              color: "#6B7280",
              lineHeight: 1.4
            }}>
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link 
              to="/forgot-password"
              style={{
                ...btnStyle,
                textDecoration: "none",
                display: "inline-block",
                textAlign: "center"
              }}
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      background: "#FFFFFF" 
    }}>
      <div style={containerStyle}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <h1 style={{ 
            margin: 0, 
            fontFamily: "'Playfair Display', serif", 
            fontSize: 28, 
            fontWeight: 700, 
            color: "#1A1A1A" 
          }}>
            Set New Password
          </h1>
          <p style={{
            margin: "12px 0 0 0",
            fontFamily: "'Cormorant', serif",
            fontSize: 16,
            color: "#6B7280",
            lineHeight: 1.4
          }}>
            Enter your new password below
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            style={inputStyle}
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            style={inputStyle}
            disabled={loading}
          />

          <button 
            type="submit" 
            disabled={loading || !newPassword || !confirmPassword}
            style={{ 
              ...btnStyle,
              opacity: (loading || !newPassword || !confirmPassword) ? 0.6 : 1,
              cursor: (loading || !newPassword || !confirmPassword) ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!loading && newPassword && confirmPassword) {
                e.currentTarget.style.backgroundColor = '#2A2A2A';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && newPassword && confirmPassword) {
                e.currentTarget.style.backgroundColor = '#1A1A1A';
              }
            }}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        {/* Message Display */}
        {message && (
          <div style={messageStyle(message.type)}>
            {message.text}
          </div>
        )}

        {/* Back to Sign In */}
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <Link 
            to="/signin"
            style={{
              color: "#6B7280",
              fontFamily: "'Cormorant', serif",
              fontSize: "14px",
              textDecoration: "underline",
              transition: "color 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#1A1A1A";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#6B7280";
            }}
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}