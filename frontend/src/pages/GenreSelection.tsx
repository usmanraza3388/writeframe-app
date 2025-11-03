import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../assets/lib/supabaseClient";

export default function GenreSelection() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userReady, setUserReady] = useState(false);

  const genres = [
    { id: "indie-drifter", label: "Indie Drifter" },
    { id: "romantic-antihero", label: "Romantic Antihero" },
    { id: "neon-dreamer", label: "Neon Dreamer" },
    { id: "lonely-archivist", label: "Lonely Archivist" },
  ];

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/signup", { replace: true });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("genre_persona")
        .eq("id", session.user.id)
        .single();

      if (profile?.genre_persona) {
        navigate("/expression-selection", { replace: true });
        return;
      }

      setUserReady(true);
    }

    checkSession();
  }, [navigate]);

  const handleContinue = async () => {
    const finalChoice = custom.trim() !== "" ? custom.trim() : selected;

    if (!finalChoice) {
      setErrorMsg("Please choose or write a genre to continue.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        setErrorMsg("No active session found. Please sign in again.");
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ genre_persona: finalChoice })
        .eq("id", user.id);

      if (error) {
        setErrorMsg(error.message || "Failed to save selection.");
        setLoading(false);
        return;
      }

      navigate("/expression-selection");
    } catch (err: any) {
      setErrorMsg(err?.message || "Unexpected error occurred.");
      console.error(err);
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
          Choose Your Genre Identity
        </h1>

        {genres.map((g) => {
          const isSelected = selected === g.label;
          return (
            <div
              key={g.id}
              onClick={() => {
                setSelected(g.label);
                setCustom("");
              }}
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
              {g.label}
            </div>
          );
        })}

        <input
          type="text"
          placeholder="Or write your own genre persona..."
          value={custom}
          onChange={(e) => {
            setCustom(e.target.value);
            setSelected(null);
          }}
          style={{
            width: "100%",
            padding: "14px 20px",
            border: "1px solid #D6D6D6",
            borderRadius: 12,
            marginTop: 8,
            fontFamily: "'Cormorant', serif",
            fontSize: 18,
            color: "#1F1F1F",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <button
          style={{
            width: "100%",
            padding: "14px 20px",
            background: "#1A1A1A",
            color: "#FFFFFF",
            fontSize: 20,
            border: "none",
            borderRadius: 12,
            cursor: (selected || custom.trim()) && !loading ? "pointer" : "default",
            fontFamily: "'Cormorant', serif",
            marginTop: 30,
            opacity: (selected || custom.trim()) && !loading ? 1 : 0.45,
            pointerEvents: (selected || custom.trim()) && !loading ? "auto" : "none",
            transition: "all 0.18s ease",
          }}
          onClick={handleContinue}
          disabled={(!selected && !custom.trim()) || loading}
        >
          {loading ? "Saving..." : "Continue"}
        </button>

        {errorMsg && (
          <div
            style={{
              marginTop: 12,
              color: "#E03E3E",
              fontFamily: "sans-serif",
              textAlign: "center",
            }}
          >
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}
