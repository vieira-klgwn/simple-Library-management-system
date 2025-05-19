const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

//Signup function (like issuing a new library card)

exports.signup = async (req, res) => {
    const { username, password, role } = req.body;

    //Check if all required fields are provided
    if (!username || !password || !['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Username, password, and valid role required' });

    }

    try {

        //Check if username is taken
        if (await User.findOne({ username })) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        //hash the password (like encrypting the library card PIN)
        const hashedPassword = await bcrypt.hash(password, 10);

        //create a new user
        const user = new User({ username, password: hashedPassword, role });
        await user.save();

        //Generate JWT (the library card)
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({
            token,
            user: { userId: user._id, username: user.username, role: user.role, borrowedBooks: user.borrowedBooks },
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }

};



//Login function (like checking the library card)
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        //Find user by username
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        //Check password
        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        //Generate JWT
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({
            token,
            user: { userId: user._id, username: user.username, role: user.role, borrowedBooks: user.borrowedBooks },
        })
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user details (like checking membership details)
exports.getUser = async (req, res) => {
  try {
    // Find user by ID from JWT
    const user = await User.findById(req.user.userId).select('-password'); // Exclude password for security
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      user: { userId: user._id, username: user.username, role: user.role, borrowedBooks: user.borrowedBooks },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};