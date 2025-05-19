//Middleware to check user role (like ensuring only librarian manage books)
module.exports = (allowedRoles) => (req,res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({message: 'Access denied'})
    }
    next();
};