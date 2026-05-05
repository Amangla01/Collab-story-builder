const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "30d"});
};

const registerUser = async (req, res, next) => {
    try {
        const {name, email, password} = req.body;

        if(!name || !email || !password) {
            res.status(400);
            throw new Error("Please Provide all fields!");
        }
        const userExists = await User.findOne({ email });
        if(userExists) {
            res.status(400);
            throw new Error("User Already Exists");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        })

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        })
    } catch (error) {
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const {email, password} = req.body;

        if(!email || !password) {
            res.status(400);
            throw new Error("Please provide all fields");
        }

        const user = await User.findOne({email});

        if(user && (await bcrypt.compare(password, user.password))){
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            })
        } else {
            res.status(401);
            throw new Error("Invalid email or password");
        }
    } catch (error) {
        next(error);
    }
};

const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    } catch (error){
        next(error);
    }
    
}

module.exports = {registerUser, loginUser, getMe} ;