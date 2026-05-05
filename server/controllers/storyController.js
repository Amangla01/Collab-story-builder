const Story = require("../models/Story")
const Entry = require("../models/Entry")
const generateRoomCode = require("../utils/generateRoomCode") 

const createStory = async (req, res, next) => {
    try {
        const {title, genre, openingLine, isPrivate, requiresAuth, maxContributors} = req.body;

        if(!title || !openingLine) {
            res.status(400);
            throw new Error("Please provide title and opening line");
        }

        let roomCode = generateRoomCode()
        let codeExists = await Story.findOne({roomCode});
        while (codeExists){
            roomCode = generateRoomCode();
            codeExists = await Story.findOne({roomCode})
        }

        const story = await Story.create({
            title,
            genre: genre || "fantasy",
            openingLine,
            roomCode,
            isPrivate: isPrivate || false,
            requiresAuth: requiresAuth !== undefined ? requiresAuth: true,
            maxContributors: maxContributors || S,
            createdBy: req.user._id,
            contributors: [req.user._id],
            currentTurn: req.user._id,
        });

        res.status(201).json(story);
    } catch (error) {
        next(error);
    }
};

const getStories = async (req, res, next) => {
    try {
        const stories = await Story.find({isPrivate: false})
            .populate("createdBy", "name")
            .populate("contributors", "name")
            .sort({createdAt: -1})
        
        res.status(200).json(stories);
    } catch (error){
        next(error);
    }
}

const getMyStories = async (req, res, next) => {
    try{
        const stories = await Story.find({
            $or: [
                {createdBy: req.user._id},
                {contributors: req.user._id}
            ]
        })
            .populate("createdBy", "name")
            .populate("contributors", "name")
            .sort({ createdAt: -1});

        res.status(200).json(stories);
    } catch (error) {
        next(error);
    }
}

const getStoryByRoomCode = async (req, res, next) => {
    try{
        const roomCode = req.params.roomCode.trim().toUpperCase();
        console.log("req.params:", req.params);    
        console.log("Looking for roomCode:", req.params.roomCode);

        const story = await Story.findOne({roomCode: req.params.roomCode})
            .populate("createdBy", "name")
            .populate("contributors", "name")
            .populate("currentTurn", "name");

        // console.log("story found:", story)

        if(!story) {
            return res.status(404).json({message: "story not found"});
            // throw new Error("Story not found");
        }

        const entries = await Entry.find({story: story._id})
            .populate("author", "name")
            .sort({turnNumber: 1});
        
        return res.status(200).json({story, entries});
    } catch (error) {
        next(error);
    }
}

const joinStory = async (req, res, next) => {
    try {
        const story = await Story.findOne({roomCode: req.params.roomCode});

        if(!story){
            res.status(404);
            throw new Error("Story not found");
        }

        if (story.status === "completed"){
            res.status(400);
            throw new Error("This Story is Already Completed")
        }
        if (story.contributors.length >= story.maxContributors){
            res.status(400);
            throw new Error("Story Room is Full")
        }

        if(req.user) {
            const alreadyJoined = story.contributors.includes(req.user._id);
            if(!alreadyJoined){
                story.contributors.push(req.user._id);
                story.status = "active";
                await story.save();
            }
        }
        
        res.status(200).json(story);
    } catch(error) {
        next(error);
    }
}

const submitEntry = async (req, res, next) => {
    try {
        const {content, anonymousName} = req.body;

        if(!content) {
            res.status((400));
            throw new Error("Please provide content");
        }

        const story = await Story.findOne({roomCode: req.params.roomCode})

        if(!story) {
            res.status(404);
            throw new Error("Story not found")
        }

        if(story.status === 'completed'){
            res.status(400);
            throw new Error("This story is already completed")
        }

        const entryCount = await Entry.countDocuments({story: story._id}) || 0;

        const entry = await Entry.create({
            story: story._id,
            author: req.user ? req.user._id : null,
            anonymousName: req.user ? "" : anonymousName || "Anonymous",
            content,
            turnNumber : entryCount + 1,
        })

        await entry.populate("author", "name");

        return res.status(201).json(entry);
    } catch (error) {
        next(error)
    }
}

const reactToEntry = async (req, res, next) => {
    try {
        const {reactionKey} = req.body;
        console.log("reactionKey recieved", reactionKey)
        console.log("EntryId:", req.params.entryId)

        const validKeys = ["laugh", "heart", "fire", "wow", "savage"];
        if(!validKeys.includes(reactionKey)){
            return res.status(400).json({message: "Invalid reaction"});
        }

        const entry = await Entry.findById(req.params.entryId);

        if(!entry) {
            return res.status(404).json({message: "Entry not found"});
        }

        console.log("Current reaction:", entry.reactions);
        const userId = req.user ? req.user._id.toString() : null;
        console.log("userId:", userId)
        const alreadyReacted = entry.reactions[reactionKey]
            .map(id => id.toString())
            .includes(userId);
        if(userId) {
            if(!entry.reactions[reactionKey]) {
                entry.reactions[reactionKey] = []
            }
            
        }
        if(alreadyReacted){
            entry.reactions[reactionKey] = entry.reactions[reactionKey]
                .filter(id => id.toString() !== userId);
        } else {
             entry.reactions[reactionKey].push(req.user._id)
        }
       console.log("About to save Entry...");
       entry.markModified("reactions");
       await entry.save();
       
        return res.status(200).json(entry);
    } catch (error) {
        console.log("Reaction ERROR: ", error.message)
        // console.log("FULL ERROR:", error);
        next(error)
    }
}

const completeStory = async (req, res, next) => {
    try {
        const story = await Story.findOne({ roomCode: req.params.roomCode})

        if(!story) {
            res.status(404);
            throw new Error("Story not found");
        }

        if(story.createdBy.toString() !== req.user._id.toString()){
            res.status(403);
            throw new Error("Only the story creator can complete it");
        }
        
        story.status = "completed";
        await story.save();

        res.status(200).json(story);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createStory,
    getStories,
    getMyStories,
    getStoryByRoomCode,
    joinStory,
    submitEntry,
    reactToEntry,
    completeStory,
}