'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import React from 'react';

interface Book {
  _id: string;
  title: string;
  author: string;
  available: boolean;
}

export default function Books() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [newBook, setNewBook] = useState({ title: '', author: '' });
  const [error, setError] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      router.push('/login');
    } else {
      fetchBooks();
    }
  }, [token, router]);

  // Fetch all books
  const fetchBooks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/books', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(res.data);
    } catch (err) {
      setError('Failed to fetch books');
    }
  };

  // Add a new book (admin-only)
  const addBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/books', newBook, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks([...books, res.data]);
      setNewBook({ title: '', author: '' });
    } catch (err) {
      setError('Failed to add book');
    }
  };

  // Delete a book (admin-only)
  const deleteBook = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(books.filter(book => book._id !== id));
    } catch (err) {
      setError('Failed to delete book');
    }
  };

  // Borrow a book
  const borrowBook = async (id: string) => {
    try {
      await axios.post(`http://localhost:5000/books/${id}/borrow`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBooks(); // Refresh book list
    } catch (err) {
      setError('Failed to borrow book');
    }
  };

  // Return a book
  const returnBook = async (id: string) => {
    try {
      await axios.post(`http://localhost:5000/books/${id}/return`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBooks(); // Refresh book list
    } catch (err) {
      setError('Failed to return book');
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Library Books</h1>
        {user && <p className="mb-4">Welcome, {user.username}!</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {user?.role === 'admin' && (
          <form onSubmit={addBook} className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Add New Book</h2>
            <div className="flex flex-col space-y-4">
              <input
                type="text"
                value={newBook.title}
                onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                placeholder="Book Title"
                className="p-2 border rounded"
                required
              />
              <input
                type="text"
                value={newBook.author}
                onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                placeholder="Author"
                className="p-2 border rounded"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Add Book
              </button>
            </div>
          </form>
        )}
        <h2 className="text-xl font-semibold mb-4">Book List</h2>
        <ul className="space-y-2">
          {books.map(book => (
            <li key={book._id} className="flex items-center justify-between p-2 border-b">
              <div>
                <p className="font-semibold">{book.title}</p>
                <p className="text-gray-600">{book.author}</p>
                <p className={book.available ? 'text-green-500' : 'text-red-500'}>
                  {book.available ? 'Available' : `Borrowed${user?.borrowedBooks.includes(book._id) ? ' by you' : ''}`}
                </p>
              </div>
              <div className="space-x-2">
                {book.available ? (
                  <button
                    onClick={() => borrowBook(book._id)}
                    className="bg-green-500 text-white p-1 rounded hover:bg-green-600"
                  >
                    Borrow
                  </button>
                ) : (
                  user?.borrowedBooks.includes(book._id) && (
                    <button
                      onClick={() => returnBook(book._id)}
                      className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                    >
                      Return
                    </button>
                  )
                )}
                {user?.role === 'admin' && (
                  <button
                    onClick={() => deleteBook(book._id)}
                    className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
        <button
          onClick={logout}
          className="w-full bg-red-500 text-white p-2 rounded mt-6 hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}