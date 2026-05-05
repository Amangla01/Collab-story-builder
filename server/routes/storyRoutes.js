const express = require("express");
const router = express.Router()

const {
    createStory,
    getStories,
    getStoryByRoomCode,
    joinStory,
    submitEntry,
    reactToEntry,
    completeStory,
    getMyStories,
} = require("../controllers/storyController");

const { protect } = require("../middleware/authMiddleware");
const { optionalAuth } = require("../middleware/optionalAuth")

router.get("/", getStories);

router.post("/", protect, createStory);

router.get("/mine", protect, getMyStories);

router.get("/:roomCode", optionalAuth, getStoryByRoomCode);

router.post("/:roomCode/join", optionalAuth, joinStory);

router.post("/:roomCode/entries", optionalAuth, submitEntry);

router.put("/entries/:entryId/react", optionalAuth, reactToEntry);

router.put("/:roomCode/complete", protect, completeStory)


module.exports = router;
