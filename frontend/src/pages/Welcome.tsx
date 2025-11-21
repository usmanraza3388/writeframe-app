import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../assets/lib/supabaseClient";
import heroImage from "../assets/cineverse-hero.png";

export default function Welcome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/signup", { replace: true });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("genre_persona, expression")
        .eq("id", session.user.id)
        .single();

      if (profile?.genre_persona && profile?.expression) {
        navigate("/home-feed", { replace: true });
      }

      setLoading(false);
    }

    checkSession();
  }, [navigate]);

  const container: React.CSSProperties = {
    width: 375,
    height: 812,
    background: "#E5E5E5",
    borderRadius: 18,
    padding: "60px 32px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
  };

  const heading: React.CSSProperties = {
    fontFamily: "'Playfair Display', serif",
    fontSize: 34,
    fontWeight: 700,
    color: "#1F1F1F",
    textAlign: "center",
    marginBottom: 6,
  };

  const sub: React.CSSProperties = {
    fontFamily: "'Cormorant', serif",
    fontSize: 24,
    color: "#4B4B4B",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 1.4,
  };

  const hero: React.CSSProperties = {
    width: 320,
    height: 250,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 30,
    objectFit: "cover",
  };

  const button: React.CSSProperties = {
    width: 320,
    padding: "12px 16px",
    background: "#1A1A1A",
    color: "#FFFFFF",
    fontSize: 20,
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "'Cormorant', serif",
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FAFAFA",
      }}
    >
      <div style={container}>
        <h1 style={heading}>Welcome to writeFrame</h1>
        <p style={sub}>Where Your Memories Become Cinematic Scenes</p>

        {heroImage && <img src={heroImage} alt="Cineverse Hero" style={hero} />}

        <button style={button} onClick={() => navigate("/genre-selection")}>
          Begin Your Journey
        </button>
      </div>
    </div>
  );
}