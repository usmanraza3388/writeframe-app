// src/pages/ForgotPassword.tsx
import React, { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  const { resetPassword } = useAuth();

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        setMessage({ text: error, type: 'error' });
      } else {
        setMessage({ 
          text: "Check your email for the password reset link.", 
          type: 'success' 
        });
        setEmail(""); // Clear email on success
      }
    } catch (err: any) {
      setMessage({ 
        text: err?.message || "Something went wrong", 
        type: 'error' 
      });
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
            Reset Password
          </h1>
          <p style={{
            margin: "12px 0 0 0",
            fontFamily: "'Cormorant', serif",
            fontSize: 16,
            color: "#6B7280",
            lineHeight: 1.4
          }}>
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
            disabled={loading}
          />

          <button 
            type="submit" 
            disabled={loading || !email}
            style={{ 
              ...btnStyle,
              opacity: (loading || !email) ? 0.6 : 1,
              cursor: (loading || !email) ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!loading && email) {
                e.currentTarget.style.backgroundColor = '#2A2A2A';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && email) {
                e.currentTarget.style.backgroundColor = '#1A1A1A';
              }
            }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
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