const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db")
const {notFound, errorHandler} = require("./middleware/errorMiddleware");
const mongoose = require("mongoose");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    }
})


app.use(cors({origin: "*"}))
app.use(express.json());

connectDB();

const authRoutes = require("./routes/authRoutes")
const storyRoutes = require("./routes/storyRoutes");

app.get("/", (req, res) => {
    res.json({message: "Collaborative Story Builder API is Running 🚀"})
})

app.use("/api/auth", authRoutes);
app.use("/api/stories", storyRoutes);

// mongoose    
//     .connect(process.env.MONGO_URI)
//     .then(() => console.log("✅ Mongo DB id connected"))
//     .catch((err) => console.log("❌MongoDb connection Error", err));


const socketHandler = require("./socket/socketHandler")
socketHandler(io);


app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
})
