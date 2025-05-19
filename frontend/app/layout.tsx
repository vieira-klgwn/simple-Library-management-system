import type { Metadata } from "next";
import {Inter} from 'next/font/google';
import "./globals.css"
import { AuthProvider } from "../context/AuthContext";
import React from "react";

const inter = Inter({subsets: ['latin']});
export const metadata: Metadata = {
  title: 'Library management System',
  description: 'A simple library management system'
};

export default function RootLayout ({
  children,

} : {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="{inter.className}">
                <AuthProvider>{children}</AuthProvider>                
            </body>
        </html>
    );
}