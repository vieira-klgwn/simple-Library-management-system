'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import React from "react";
import { useRouter } from "next/navigation";



interface AuthContextType {
    user: { userId: string; username: string; role: string; borrowedBooks: string[] } | null;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    signup: (username: string, password: string, role: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<{ userId: string; username: string, role: string , borrowedBooks: string[]} | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();


    //Check for stored token on page load
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            // Fetch user data from the new /user endpoint
            axios
                .get('http://localhost:5000/user', {
                    headers: { Authorization: `Bearer ${storedToken}` },
                })
                .then(res => {
                    setUser(res.data.user); // Set user data from response
                    console.log('User fetched on load:', JSON.stringify(res.data.user, null, 2));
                })
                .catch(err => {
                    console.error('Failed to fetch user:', err);
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                });
        }
    }, []);


const login = async (username: string, password: string) => {
    try {
      const res = await axios.post('http://localhost:5000/login', { username, password });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user); // Set user data from login response
      console.log('Login response:', JSON.stringify(res.data, null, 2));
      router.push('/books');
    } catch (err) {
      console.error('Login error:', err);
      throw new Error('Login failed');
    }
  };

  const signup = async (username: string, password: string, role: string) => {
    try {
      const res = await axios.post('http://localhost:5000/signup', { username, password, role });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user); // Set user data from signup response
      console.log('Signup response:', JSON.stringify(res.data, null, 2));
      router.push('/books');
    } catch (err) {
      console.error('Signup error:', err);
      throw new Error('Signup failed');
    }
  };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        router.push('/login');

    };

    return (
        <AuthContext.Provider value={{ user, token, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );








}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used with an AuthProvider');
    }
    return context;
}