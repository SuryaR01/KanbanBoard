"use client";

import { ThemeProvider } from "../context/ThemeContext";
import Provider from "../provider";
import { Toaster } from "react-hot-toast";
import Navbar from "./Nav";

export default function ClientWrapper({ children, session }) {
  return (
    <ThemeProvider>
      <Provider session={session}>
        <Toaster position="top-right" />
        <Navbar />
        <main className="min-h-[calc(100vh-64px)] overflow-hidden">
          {children}
        </main>
      </Provider>
    </ThemeProvider>
  );
}
