const Book = require('../models/Book');
const User = require('../models/User');


//Get all books(public, like browsing the library catalog)
exports.getBooks = async (req, res) => {
    try{
        const books = await Book.find();
        res.json(books);
    }catch (err){
        res.status(500).json({message:'Server error'})
    }
};

//Add a book (admin-only, like adding a book to the library)
exports.addBook = async (req,res) => {
    const {title, author} = req.body;

    if (!title || !author) {
        return res.status(400).json({message: 'Title and author required'});
    } 

    try {
        const book = new Book({title, author});
        await book.save();
        return res.status(201).json(book);
    } catch (err) {
        res.status(500).json({message: 'Server error'});
    }
};


//Delete a book(admin -only), like removing a book from the library
exports.deleteBook = async (req, res) => {
    const { id } = req.params;

    try {
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({message: 'Book not found'})
        }
        await book.deleteOne();
        res.json({ message: 'Book deleted' });
    } catch (err) {
        res.status(500).json({message: 'Server error'})
    }
};


//Borrow a book (protected, like checking out a book)
exports.borrowBook = async(req,res) => {
    const { id } = req.params;

    try {
        const book = await Book.findById(id);
        if(!book) {
            return res.status(404).json({message: 'Book not found'});
        }
        if (!book.available) {
            return res.status(400).json({message: 'Book already borrowed'});
        }

        //Update book and user
        book.available = false;
        await book.save();
        const user = await User.findById(req.user.userId);
        user.borrowedBooks.push(book._id);
        await user.save();

        res.json({message: 'Book borrowed', book});

    } catch (err) {
        res.status(500).json({message: 'Server error'})
    }
}

//Return a book (protected, like returning a book)
exports.returnBook = async(req,res) => {
    const {id} = req.params;

    try {
        const book = await Book.findById(id);
        if (!book){
            return res.status(404).json({message: 'Book not found'})
        }
        if (book.available) {
            return res.status(400).json({message: 'Book already available'});
        }


        //Update book and user
        book.available = true;
        await book.save();
        const user = await User.findById(req.user.userId);
        user.borrowedBooks = user.borrowedBooks.filter(bookId => bookId.toString() !== id);
        await user.save();
        res.json({message: 'Book returned ',book});
    } catch (err) {
        res.status(500).json({message: 'Server error'});
    }
};