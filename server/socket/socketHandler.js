const socketHandler = (io) => {
    io.on("connection", (socket) => {
        console.log(`⚡ New Client connected: ${socket.id}`);

        socket.on("joinRoom", ({ roomCode, userName}) => {
            socket.join(roomCode);
            console.log(`🙍🏻${userName} joined room: ${roomCode}`);

            socket.to(roomCode).emit("userJoined", {
                message: `${userName} joined the story!`,
                userName,
            })
        })
        socket.on("leaveRoom", ({roomCode, userName}) => {
            socket.leave(roomCode);
            console.log(`👋🏻 ${userName} left room: ${roomCode}`);

            socket.to(roomCode).emit("userLeft", {
                message: `${userName} left the story.`,
                userName,
            })
        })

        socket.on("typing", ({ roomCode, userName}) => {
            socket.to(roomCode).emit("userTyping", {userName});
        });
        
        socket.on("stopTyping", ({ roomCode}) => {
            socket.to(roomCode).emit("userStoppedTyping");
        });
        
        socket.on("newEntry", ({ roomCode, entry}) => {
            io.to(roomCode).emit("entryAdded", entry);
        });
        
        socket.on("newReaction", ({ roomCode, entryId, emoji}) => {
            io.to(roomCode).emit("reactionAdded", {entryId, emoji});
        });
        
        socket.on("storyCompleted", ({ roomCode}) => {
            io.to(roomCode).emit("storyClosed", {
                message: "The story has been completed! 💐"
            });
        });
        
        socket.on("disconnect", () => {
            console.log(`🔌 client disconnected: ${socket.id}`);
        });
    })
}

module.exports = socketHandler;