import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    getStoryByRoomCode,
    submitEntry,
    reactToEntry,
    completeStory,
} from "../services/storyService"
import useSocket from "../hooks/useSocket";

export default function StoryRoom() {
    const {roomCode} = useParams();
    const {user} = useAuth();
    const navigate = useNavigate();

    const [story, setStory] = useState(null);
    const [entries, setEntries] = useState([])
    const [content, setContent] = useState("");
    const [anonymousName, setAnonymousName] = useState("")
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [notification, setNotification] = useState("")
    const [typingUser, setTypingUser] = useState(false)
    const [timeLeft, setTimeLeft] = useState(120)
    const [timerActive, setTimerActive] = useState(false)

    const bottomRef = useRef(null)
    const typingTimeout = useRef(null)
    const timerRef = useRef(null)

    const socket = useSocket(roomCode, {
        userName: user?.name || anonymousName || "Guest",
        onUserJoined: ({message}) => showNotification(message),
        onUserTyping: ({userName}) => setTypingUser(userName),
        onUserStoppedTyping: () => setTypingUser(""),
        onEntryAdded: (entry) => {
            setEntries((prev) => {
                const exists = prev.find((e) => e._id === entry._id)
                if (exists) return prev
                return [...prev, entry];
            })
        },

        onReactionAdded: ({ entryId, emoji}) => {
            setEntries((prev) => 
            prev.map((e) => 
                e._id === entryId
                    ? {...e, reactions: {...e.reactions, [emoji]: (e.reactions[emoji] || 0) + 1}}
                    : e
            ))
        },

        onStoryClosed: ({message}) => {
            showNotification(message);
            setStory((prev) => ({...prev, status: "completed"}))
        }
    })

    useEffect(() => {
        fetchStory();
    }, [roomCode]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: "smooth"});
    }, [entries]);

    useEffect(() => {
        if(timerActive && timeLeft > 0) {
            timerRef.current = setTimeout(() => setTimeLeft((t) => t-1), 1000)
        } else if (timeLeft === 0) {
            setTimerActive(false)
            showNotification("⏰ Time's up!")
        }
        return () => clearTimeout(timerRef.current);
    }, [timerActive, timeLeft])


    const fetchStory = async () => {
        try {
            const data = await getStoryByRoomCode(roomCode)
            setStory(data.story)
            setEntries(data.entries)
        } catch (err) {
            setError("Story not found or access denied", err)
        } finally {
            setLoading(false);
        }
    }

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(""), 3000)
    }

    const handleTyping = (e) => {
        setContent(e.target.value);
        socket.emitTyping();
        clearTimeout(typingTimeout.current)
        typingTimeout.current = setTimeout(() => {
            socket.emitStopTyping();
        }, 1000)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!content.trim()) return;

        if(story.requiresAuth && !user) {
            setError("This story requires you to be logged in")
            return
        }

        setSubmitting(true);
        setError("");

        try {
            const entry = await submitEntry(
                roomCode,
                content,
                user ? null : anonymousName || "Anonymous"
            )
            socket.emitNewEntry(entry)
            setContent("")
            setTimerActive(false)
            setTimeLeft(100)
            socket.emitStopTyping()
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit entry")
        } finally {
            setSubmitting(false);
        }
    }

    const handleReaction = async (entryId, reactionKey) => {
        try {
            const updatedEntry = await reactToEntry(entryId, reactionKey);

            setEntries((prev) => 
                prev.map((e) => (e._id === entryId ? updatedEntry : e))
                );
            socket.emitReaction(entryId, reactionKey)
        } catch (err) {
            console.log("Reaction failed", err)
        }
    }

    const handleComplete = async () => {
        if (!window.confirm("Are you sure you want to complete this story?(Hai Baski)")) return
        try {
            await completeStory(roomCode)
            socket.emitStoryCompleted()
            setStory((prev) => ({...prev, status: "completed"}))
        } catch (err) {
            setError(err.response?.data?.message || "Failed to complete story")
        }
    }

    const startTimer = () => {
        if (timerActive) {
            setTimerActive(false)
            setTimeLeft(100)
        } else {
            setTimeLeft(100);
            setTimerActive(true);
        }
    }

    if (loading) return <div style={{padding: "40px", color: "white"}}>Loading story...</div>
    if(error && !story) return (
        <div style={{padding: "40px", color: "white"}}>
            <p style={{color: "red"}}>{error}</p>
            <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
        </div>
    )
    
    const isCreator = user && story?.createdBy?._id === user._id;
    const isCompleted = story?.status === "completed";

    return (
        <div style={{minWidth: "800px", margin: "0 auto ", padding: "20px"}}>

        {/* // notification */}
        {notification && (
            <div style={{ background: "transparent", padding: "10px", borderRadius: "8px", marginBottom: "10px", textAlign: "center"}}>
                {notification}
            </div>
        )}

        {/* // Header */}

        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
            <div>
                <button onClick={() => navigate("/dashboard")} style={{marginBottom: "8px"}}>
                    ← Back
                </button>
                <h1>{story?.title}</h1>
                <div style={{display: "flex", gap: "10px", fontSize: "13px", color: "#94a3b8"}}>
                    <span>🤔{story?.genre}</span>
                    <span>🔑{story?.roomCode}</span>
                    <span>🧑‍🤝‍🧑{story?.contributors?.length}/{story?.maxContributors}</span>
                    <span style={{color: isCompleted ? "#94a3b8" : "#22c55e"}}>
                        •{story?.status}
                    </span>
                    {!story?.requiresAuth && <span>🌏Open Story</span>}
                </div>
            </div>
            {isCreator && !isCompleted && (
                <button onClick={handleComplete} style={{background: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer"}}>
                    Complete Story
                </button>
            )}
        </div>

        {/* // Opening Line */}

        <div style={{background: "#1e1e2e", padding: "16px", borderRadius: "10px", marginBottom: "20px", borderLeft: "4px solid transparent"}}>
            <p style={{ color: "#a78bfa", fontSize: "13px", marginBottom: "6px"}}>Opening Line</p>
            <p style={{ fontStyle: "Italic"}}>{story?.openingLine}</p>
        </div>
        
        {/* Entries */}
        <div style={{display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px"}}>
            {entries.length === 0 && (
                <p style={{color: "#94a3b8"}}>No entries yet. Be the first to Write!</p>
            )}
            {entries.map((entry, index) => (
                <div key={entry._id} style={{background: "#1e1e2e", padding: "16px", borderRadius: "10px"}}>
                    <div style={{display: "flex", justifyContent: "space-between", marginBottom: "8px"}}>
                        <span style={{color: "#a78bfa", fontWeight: "600"}}>
                            {entry.author?.name || entry.anonymousName || "Anonymous"}
                        </span>
                        <span style={{color: "#94a3b8", fontSize: "12px"}}>
                            Turn #{entry.turnNumber}
                        </span>
                    </div>
                    <p style={{lineHeight: "1.6"}}>{entry.content}</p>

                    {/* Reactions */}
                    <div style={{display: "flex", gap: "8px", marginTop: "12px"}}>
                        {["😂", "💘", "🔥", "😲", "💀"].map((emoji) => {
                            const keyMap = {"😂": "laugh", "💘": "heart", "🔥": "fire", "😲": "wow", "💀": "savage" }
                            const reactionKey = keyMap[emoji];
                            const count = entry.reactions?.[reactionKey]?.length || 0;
                            const userReacted = user && entry.reactions?.[reactionKey]
                                ?.map(id => id.toString())
                                .includes(user._id);
                            return (<button
                                key={emoji}
                                onClick={() => handleReaction(entry._id, reactionKey)}
                                style={{ background: userReacted ? "transparent" : "#2a2a3a",
                                     border: "none",
                                     borderRadius: "20px",
                                     padding: "4px 10px",
                                     cursor: "pointer",
                                     color: "white", 
                                     fontSize: "14px"}}
                            >
                                {emoji} {count}
                            </button>)
                        })}
                    </div>
                </div>
            ))}
            <div ref={bottomRef} />
        </div>

        {/* Typing Indicator */}
        {typingUser && (
            <p style={{color: "#94a3b8", fontSize: "13px", marginBottom: "8px"}}>
                ✍🏻 {typingUser} is typing...
            </p>
        )}

        {/* Write Entry */}
        {!isCompleted ? (
            <div style={{background: "#1e1e2a", padding: "20px", borderRadius: "10px"}}>
                <div style={{display: "flex", gap: "10px", alignItems: "center"}}>
                    <h3>Your Turn ✍🏻</h3>
                    <div style={{display: "flex", gap: "10px", alignItems: "center"}}>
                        {timerActive && (
                            <span style={{color: timeLeft < 30 ? "#ef4444" : "#22c55e"}}>
                                ⨶ {timeLeft}s
                            </span>
                        )}
                        <button onClick={startTimer} style={{fontSize: "12px", padding: "4px 10px"}}>
                            {timerActive ? "Stop Timer" : "Start Timer"}
                        </button>
                    </div>
                </div>

                {error && <p style={{color: "red", marginBottom: "10px"}}>{error}</p>}

                {/* Guest name input */}
                {!user && (
                    <div style={{marginBottom: "10px"}}>
                        <input  
                            type="text"
                            placeholder="Your name (optional)"
                            value={anonymousName}
                            onChange={(e) => setAnonymousName(e.target.value)}
                            style={{width: "100%", padding: "8px", marginBottom: "8px"}}
                        />
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <textarea
                        placeholder="Continue the story... (max 500 characters)"
                        value={content}
                        onChange={handleTyping}
                        rows={4}
                        maxLength={500}
                        style={{width: "100%", padding: "10px", marginBottom: "8px"}}
                    />
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                        <span style={{color: "#94a3b8", fontSize: "13px"}}>
                            {content.length}/500
                        </span>
                        <button type="submit" disabled={submitting || !content.trim()}>
                            {submitting ? "Submitting..." : "Submit Entry🚀"}
                        </button>
                    </div>
                </form>
            </div>
        ): (
            <div style={{background: "#1e1e2e", padding: "20px", borderRadius: "10px", textAlign: "center"}}>
                <h2>💐 Story Completed</h2>
                <p style={{color: "#94a3b8", marginTop: "8px"}}>This Story has been Completed. Thanks for Contributing!</p>
            </div>
        )}
    </div>
    )
}