const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        genre: {
            type: String,
            enum: ["fantasy", "horror", "romance", "sci-fi", "comedy", "mystery"],
            default: "fantasy",
        },
        openingLine: {
            type: String,
            required: true,
            trim: true,
        },
        roomCode: {
            type: String,
            required: true,
            unique: true,
        },
        isPrivate: {
            type: Boolean,
            default: false,
        },
        requiresAuth: {
            type: Boolean,
            default: true,
        },
        status: {
            type: String,
            enum: ["waiting" , "active", "completed"],
            default: "waiting",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        contributors: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
        ],
        currentTurn: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        maxContributors: {
            type: Number,
            default: 5,
        },
        
    },
    {timestamps: true}
);

module.exports = mongoose.model("Story", storySchema);