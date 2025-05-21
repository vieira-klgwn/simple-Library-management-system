const jwt = require('jsonwebtoken');


//Middleware to verify JWT (like checking a library card)

module.exports = async (req,res, next) => {
    //Get token from Authorization header (format: "Bearer <token>")
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({message: 'No token provided'});

    }
    
    try {
        //Verify token and attach user info
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adds userId and role to request 
        next(); // Let the request proceed
    } catch (err) {
        return res.status(401).json({message: 'Invalid token'});
    }
};


