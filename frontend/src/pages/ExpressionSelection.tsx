// src/pages/ExpressionSelection.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../assets/lib/supabaseClient";

const expressions = [
  "Writing Scene",
  "Writing Monologue",
  "Creating a Character",
  "Cinematic Frame",
];

export default function ExpressionSelection() {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userReady, setUserReady] = useState(false);
  const navigate = useNavigate();

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

      if (!profile?.genre_persona) {
        navigate("/genre-selection", { replace: true });
        return;
      }

      if (profile?.expression) {
        // User already completed expressions, redirect to home feed
        navigate("/home-feed", { replace: true });
        return;
      }

      setUserReady(true);
    }

    checkSession();
  }, [navigate]);

  const handleSave = async () => {
    if (!selected) {
      setError("Please select an expression to continue.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        setError("No active session. Please sign up or sign in.");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ expression: selected })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Redirect to Home Feed after expression selection
      navigate("/home-feed", { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!userReady) return <div>Loading...</div>;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#EFEFEF",
      }}
    >
      <div
        style={{
          width: 375,
          minHeight: 812,
          background: "#FAFAFA",
          borderRadius: 18,
          padding: "60px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            fontWeight: 700,
            color: "#1F1F1F",
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          Choose Your Expression
        </h1>

        {expressions.map((exp) => {
          const isSelected = selected === exp;
          return (
            <div
              key={exp}
              onClick={() => setSelected(exp)}
              style={{
                width: "100%",
                padding: "14px 20px",
                background: isSelected ? "#F4F4F4" : "#FFFFFF",
                border: isSelected ? "2px solid #1A1A1A" : "1px solid #D6D6D6",
                borderRadius: 12,
                marginBottom: 16,
                fontFamily: "'Cormorant', serif",
                fontSize: 20,
                color: "#1F1F1F",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.18s ease",
              }}
            >
              {exp}
            </div>
          );
        })}

        {error && (
          <div
            style={{
              marginTop: 12,
              color: "#E03E3E",
              fontFamily: "sans-serif",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={!selected || loading}
          style={{
            width: "100%",
            padding: "14px 20px",
            background: "#1A1A1A",
            color: "#FFFFFF",
            fontSize: 20,
            border: "none",
            borderRadius: 12,
            cursor: selected && !loading ? "pointer" : "default",
            fontFamily: "'Cormorant', serif",
            marginTop: 30,
            opacity: selected && !loading ? 1 : 0.45,
            pointerEvents: selected && !loading ? "auto" : "none",
            transition: "all 0.18s ease",
          }}
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  );
}