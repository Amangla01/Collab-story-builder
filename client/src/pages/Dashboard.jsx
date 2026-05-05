import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getStories, getMyStories, createStory } from "../services/storyService";

export default function Dashboard(){
    const {user, logout} = useAuth();
    const navigate = useNavigate();
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [roomCode, setRoomCode] = useState("");
    const [error, setError] = useState("");
    const [mystories, setMyStories] = useState([]);
    const [form, setForm] = useState({
        title: "",
        genre: "fantasy",
        openingLine: "",
        isPrivate: false,
        requiresAuth: true,
        maxContributors: 5,
    })

    useEffect(() => {
        fetchStories();
        fetchMyStories();
    }, []);

    const fetchStories = async () => {
        try {
            const data = await getStories();
            // console.log()
            setStories(data);

        } catch (err) {
            setError("Failed to load stories", err)
        } finally {
            setLoading(false);
        }
    }

    const fetchMyStories = async () => {
        try {
            const data = await getMyStories();
            setMyStories(data);
        } catch (err) {
            console.log("failed to load my stories", err)
        }
    }
    
    const handleChange = (e) => {
        const value = 
        e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value});
    }

    const handleCreate = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const story = await createStory(form);
            setShowForm(false);
            fetchMyStories();
            if(!story.isPrivate) fetchStories();
            navigate(`/story/${story.roomCode}`);
        } catch(err) {
            setError(err.response?.data?.message || "Failed to create story");
        }
    }

    const handleJoin = (e) => {
        e.preventDefault();
        if (roomCode.trim()){
            navigate(`/story/${roomCode.trim().toUpperCase()}`)
        }
    }

    const handleLogout = () => {
        logout();
        navigate("/login");
    }

    const StoryCard = ({story}) => (
        <div
            key={story._id}
            style={{background: "#1e1e2e", padding: "16px", borderRadius: "10px", cursor: "pointer"}}
            onClick={() => navigate(`/story/${story.roomCode}`)}
        >
            <div style={{ display: "flex", justifyContent: "space-between"}}>
                <h3>{story.title}</h3>
                <div style={{display: "flex", gap: "6px"}}>
                    {story.isPrivate && (
                        <span style={{background: "#374151", padding: "2px 10px", borderRadius: "20px", fontSize: "12px"}}>
                            🔒 Private
                        </span>
                    )}
                    {story.requiresAuth && (
                        <span style={{background: "#064e3b", padding: "2px 10px", borderRadius: "20px", fontSize: "12px"}}>
                            🌏 Open
                        </span>
                    )}
                        <span style={{background: "transparent", padding: "2px 10px", borderRadius: "20px", fontSize: "12px"}}>
                            {story.genre}
                        </span>
                </div>
            </div>
            <p style={{color: "#94a3b8", margin: "8px 0"}}>{story.openingLine}</p>
            <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#94a3b8"}}>
                <span>🙍🏻 {story.createdBy?.name}</span>
                <span>👥🧑‍🤝‍🧑 {story.contributors?.length}/{story.maxContributors}</span>
                <span>🔑 {story.roomCode}</span>
                <span style={{color: story.status === "active" ? "#22c55e" : "#94a3b8"}}>
                    • {story.status}</span>
            </div>
        </div>
    )

    return (
        <div style={{padding: "20px ", maxWidth: "900px", margin: "0 auto "}}>
            {/* Header */}
            <div style={{diplay: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px"}}>
                <h1>🔪 Story Builder</h1>
                <div style={{ display: "flex", gap: "10px", alignItems: "center"}}>
                    <span>Hey, {user?.name}!</span>
                    <button onClick={() => navigate("/archive")}>📚 Archive</button>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>

            {error && <p style={{color: "red"}}>{error}</p>}

            {/* Action */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "30px"}}>
                    <button onClick={() => setShowForm(!showForm)}>
                        {showForm ? "Cencel" : "➕ Create Story"}
                    </button>

                    <form onSubmit={handleJoin} style={{display: "flex", gap: "10px"}}>
                        <input type="text" 
                            placeholder="Enter Room Code"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value)}
                        />
                        <button type="submit">Join Story</button>
                    </form>
            </div>

            {/* Create story form         */}
            {showForm && (
                <div style={{background: "1e1e2e", padding:"20px", borderRadius: "10px", marginBottom: "30px" }}>
                    <h2 style={{ marginBottom: "16px"}}>Create a new Story</h2>
                    <form onSubmit={handleCreate} style={{display: "flex", flexDirection: "column", gap: "12px"}}>

                        <div>
                            <label >Title</label><br />
                            <input type="text" 
                                name="title"
                                placeholder="Story title"
                                value={form.title}
                                onChange={handleChange}
                                required
                                style={{width: "100%", padding: "8px"}}
                            />
                        </div>

                        <div>
                            <label >Genre</label><br />
                            <select name="genre" value={form.genre}
                                onChange={handleChange}
                                style={{width: "100%", padding: "8px"}}
                            >
                                <option value="fantasy">Fantasy</option>
                                <option value="horror">Horror</option>
                                <option value="romance">Romance</option>
                                <option value="sci-fi">Sci-fi</option>
                                <option value="comedy">Comedy</option>
                                <option value="mystery">Mystery</option>
                            </select>
                        </div>

                        <div>
                            <label >Opening Line</label><br />
                            <textarea name="openingLine" 
                                placeholder="Start your Story..."
                                value={form.openingLine}
                                onChange={handleChange}
                                required
                                rows={3}
                                style={{ width: "100%", padding: "8px"}}
                            ></textarea>
                        </div>

                        <div>
                            <label >Max Contributors: {form.maxContributors}</label><br />
                            <input type="range" 
                                name="maxContributors"
                                min="2"
                                max="10"
                                value={form.maxContributors}
                                onChange={handleChange}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "20px"}}>
                            <label >
                                <input type="checkbox"
                                    name="isPrivate"
                                    checked={form.isPrivate}
                                    onChange={handleChange}
                                 />
                                 {" "} Private Room
                            </label>
                            <label >
                                <input type="checkbox"
                                    name="requiresAuth"
                                    checked={form.requiresAuth}
                                    onChange={handleChange}
                                 />
                                 {" "}Requires Login
                            </label>
                        </div>

                    <button type="submit">Create Story</button>    
                    </form>
                </div>
            )}

            {/* Mystories */}
            {mystories.length > 0 && (
                <div style={{ marginBottom: "30px"}}>
                    <h2 style={{ marginBottom: "16px"}}>🥹 My Stories</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap:"12px"}}>
                        {mystories.map((story) => (
                            <StoryCard key={story._id} story={story} />
                        ))}
                    </div>
                </div>
            )}

            {/* public stories */}
            <h2 style={{ marginBottom: "16px"}}>☠️ Public Stories</h2>
            {loading ? (
                <p>Loading Stories...</p>
            ) : stories.length === 0 ? (
                <p>No public stories yet. Create one! <br /> Keep in mind Public Stories can be contributed by Anyoone☠️</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px"}}>
                    {stories.map((story) => (
                        <StoryCard key={story._id} story={story} />
                    ))}
                </div>
            )}

        </div>
    )
    
    
    
}