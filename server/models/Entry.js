const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema(
    {
        story: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Story",
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        anonymousName: {
            type: String,
            trim: true,
            default: "",
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        reactions: {
            laugh: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],
            heart: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],
            fire: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],
            wow: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],            
            savage: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],            
        },
        turnNumber: {
            type: Number,
            default: 0,
        },
    },
    {timestamps: true}
);

module.exports = mongoose.model("Entry", entrySchema);