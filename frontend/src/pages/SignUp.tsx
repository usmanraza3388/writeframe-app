import React, { useState, type FormEvent } from "react";
import { supabase } from "../assets/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

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
      <span
        style={{
          width: 24,
          height: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </span>
      <span
        style={{
          fontFamily: "'Cormorant', serif",
          fontSize: 14,
          color: "#000",
        }}
      >
        {label}
      </span>
    </button>
  );
}

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, username: username },
        },
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      const user = data.user;
      if (!user) {
        setMessage("Sign up failed. No user returned.");
        setLoading(false);
        return;
      }

      console.log("Signup success:", user);

      // ✅ Upsert profile to ensure full_name and username are saved
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName,
        username: username,
        email: email,
        created_at: new Date(),
      });

      if (profileError) {
        console.error("Profile upsert error:", profileError);
        setMessage(profileError.message);
        setLoading(false);
        return;
      }

      // 🔹 Add user to MailerLite group via Edge Function
      try {
        await fetch("https://ycrvsbtqmjksdbyrefek.supabase.co/functions/v1/hyper-task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
      } catch (err) {
        console.error("Failed to add to MailerLite:", err);
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        navigate("/welcome");
      } else {
        setMessage("Check your email to confirm your account.");
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

      await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } catch (err: any) {
      setMessage(err?.message || String(err));
      setLoading(false);
    }
  };

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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FFFFFF",
      }}
    >
      <div style={containerStyle}>
        <h1
          style={{
            margin: 0,
            fontFamily: "'Playfair Display', serif",
            fontSize: 22,
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          Create your account
        </h1>

        <form
          onSubmit={handleSignUp}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p
          style={{
            margin: 0,
            fontFamily: "'Cormorant', serif",
            fontSize: 12,
            color: "#4B5563",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          By clicking Register or Continue with Google, you agree to{" "}
          <span style={{ textDecoration: "underline" }}>Terms of Use</span> and{" "}
          <span style={{ textDecoration: "underline" }}>Privacy Policy</span>.
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <hr style={{ flex: 1, border: "none", height: 1, background: "#E5E7EB" }} />
          <span style={{ fontSize: 12, color: "#6B7280" }}>or</span>
          <hr style={{ flex: 1, border: "none", height: 1, background: "#E5E7EB" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SocialButton label="Continue with Google" onClick={() => handleOAuth("google")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21.6 12.24c0-.72-.06-1.44-.18-2.12H12v4.02h5.76c-.24 1.3-.96 2.42-2.04 3.18v2.64h3.3c1.92-1.76 3.06-4.38 3.06-7.72z" fill="#4285F4"/>
              <path d="M12 22c2.7 0 4.98-.9 6.64-2.46l-3.3-2.64c-.9.6-2.04.96-3.34.96-2.56 0-4.72-1.72-5.49-4.04H3.96v2.54C5.64 19.94 8.64 22 12 22z" fill="#34A853"/>
              <path d="M6.51 13.82A6.996 6.996 0 0 1 6 12c0-.68.12-1.34.33-1.96V7.5H3.96A9.99 9.99 0 0 0 2 12c0 1.66.36 3.24 1 4.66l3.51-2.84z" fill="#FBBC05"/>
              <path d="M12 5.5c1.48 0 2.8.5 3.85 1.48L19.2 4.34C17.04 2.36 14.16 1.2 11 1.2 7.64 1.2 4.64 3.26 3 6.46l3.51 2.84C7.28 7.22 9.44 5.5 12 5.5z" fill="#EA4335"/>
            </svg>
          </SocialButton>
        </div>

        {message && (
          <p
            style={{
              marginTop: 8,
              textAlign: "center",
              color: "#DC2626",
              fontSize: 14,
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
