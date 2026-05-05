const jwt = require("jsonwebtoken");
const User = require("../models/User");

const optionalAuth = async (req, res, next) => {
    let token;

    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select("-password");

            return next();
        } catch (error) {
            // res.status(401).json({message: "Not authorized, token failed"});
            req.user = null;
            return next();
        }
    } 
        req.user = null;

    return next();
}

module.exports = {optionalAuth} ;