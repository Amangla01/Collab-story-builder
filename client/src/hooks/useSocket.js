import { useEffect, useRef } from "react";
import {io} from "socket.io-client";

const useSocket = (roomCode, handlers) =>{
    const socketRef = useRef(null);
    const handlersRef = useRef(handlers);

    useEffect(() => {
        handlersRef.current = handlers;
    })

    useEffect(() => {
        if (!roomCode) return;

        socketRef.current = io("http://localhost:5000", {
            transports: ["websocket"]
        })

        const socket = socketRef.current;

        socket.emit("joinRoom", {
            roomCode,
            userName: handlers.userName,
        })

        socket.on("userJoined", (data) => handlersRef.current.onUserJoined(data));
        socket.on("userLeft", (data) => handlersRef.current.onUserLeft(data));
        socket.on("userTyping", (data) => handlersRef.current.onUserTyping(data));
        socket.on("userStoppedTyping", (data) => handlersRef.current.onUserStoppedTyping(data));
        socket.on("entryAdded", (data) => handlersRef.current.onEntryAdded(data));
        socket.on("reactionAdded", (data) => handlersRef.current.onReactionAdded(data));
        socket.on("storyClosed", (data) => handlersRef.current.onStoryClosed(data));

        return () => {
            socket.emit("leaveRoom", {
                roomCode,
                userName: handlers.userName,
            })
            socket.disconnect();
        }
    }, [roomCode])

    const emitTyping = () => {
        socketRef.current?.emit("typing", {
            roomCode,
            userName: handlersRef.current.userName,
        })
    }

    const emitStopTyping =() => {
        socketRef.current?.emit("stopTyping", {roomCode})
    }

    const emitNewEntry = (entry) => {
        socketRef.current?.emit("newEntry", {roomCode, entry})
    }

    const emitReaction =(entryId, emoji) => {
        socketRef.current?.emit("newReaction", {roomCode, entryId, emoji})
    }

    const emitStoryCompleted =() => {
        socketRef.current?.emit("storyCompleted", {roomCode})
    }

    return {
        emitTyping,
        emitStopTyping,
        emitNewEntry,
        emitReaction,
        emitStoryCompleted,
    }
}

export default useSocket;