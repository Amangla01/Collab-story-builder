import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStories } from "../services/storyService";

export default function Archive() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompleted();
  }, []);

  const fetchCompleted = async () => {
    try {
      const data = await getStories();
      setStories(data.filter((s) => s.status === "completed"));
    } catch (err) {
      console.log("Failed to load archive", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1>📚 Story Archive</h1>
        <button onClick={() => navigate("/dashboard")}>← Back</button>
      </div>

      {loading ? (
        <p>Loading archive...</p>
      ) : stories.length === 0 ? (
        <p>No completed stories yet!</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {stories.map((story) => (
            <div
              key={story._id}
              style={{ background: "#1e1e2e", padding: "20px", borderRadius: "10px", cursor: "pointer" }}
              onClick={() => navigate(`/story/${story.roomCode}`)}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h2>{story.title}</h2>
                <span style={{ background: "#7c3aed", padding: "2px 10px", borderRadius: "20px", fontSize: "12px" }}>
                  {story.genre}
                </span>
              </div>
              <p style={{ color: "#94a3b8", margin: "8px 0", fontStyle: "italic" }}>
                "{story.openingLine}"
              </p>
              <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#94a3b8" }}>
                <span>👤 {story.createdBy?.name}</span>
                <span>👥 {story.contributors?.length} contributors</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}