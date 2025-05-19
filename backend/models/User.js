//Import mongoose to interact with Mongodb
const mongoose = require('mongoose');

//define the user schema  (structure of user data)

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique:true,
    }, 
    password: {
        type: String,
        required:true
    },
    role: {
        type: String,
        enum: ['user','admin'],
        default: 'user',
    },
    borrowedBooks : [{
        type: mongoose.Schema.Types.ObjectId, //links to borrowed books
        ref:'Book',
    }],
});

//Create and export the user model
module.exports = mongoose.model('User',userSchema)