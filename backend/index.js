//import required packages

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require ('dotenv').config();

const authController = require('./auth/authController');
const bookController = require('./controllers/bookController');
const authMiddleware = require('./middlewares/authMiddleware');
const roleMiddleware = require('./middlewares/roleMiddleware');
const { default: helmet } = require('helmet');

//Initialize Express app
const app = express();
app.use(cors()); // Allows frontend to connect
app.use(express.json()); // Parses JSON requests
app.use(helmet());


//Connect to mongodb
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error: ', err));

// Routes

app.post('/signup',authController.signup);
app.post('/login', authController.login);
app.get('/user', authMiddleware, authController.getUser);//fetch user details
app.get('/books', bookController.getBooks);
app.post('/books',authMiddleware, roleMiddleware(['admin']),bookController.addBook);
app.delete('/books/:id',authMiddleware,roleMiddleware(['admin']),bookController.deleteBook);
app.post('/books/:id/borrow',authMiddleware,bookController.borrowBook);
app.post('/books/:id/return',authMiddleware,bookController.returnBook);

//Start Server
app.listen(5000, () => console.log('Backend running on port 5000'));
