"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const themes = {
  light: {
    name: "Light",
    primary: "#000000", // Black
    secondary: "#4b5563", // Gray 600
    background: "#ffffff", // White
    backgroundGradient: "linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)", // White to light gray
    surface: "#f9fafb", // Gray 50
    text: "#111827", // Gray 900
    textSecondary: "#6b7280", // Gray 500
    border: "#e5e7eb", // Gray 200
    accent: "#374151", // Gray 700
    icon: "☀️",
    dotPattern: "#d1d5db", // Gray 300
    // Column colors for Kanban - grayscale shades
    columnColors: ["#f3f4f6", "#e5e7eb", "#d1d5db", "#9ca3af", "#6b7280"],
  },
  dark: {
    name: "Dark",
    primary: "#ffffff", // White
    secondary: "#9ca3af", // Gray 400
    background: "#000000", // Pure black
    backgroundGradient: "linear-gradient(135deg, #000000 0%, #1f2937 100%)", // Black to dark gray
    surface: "#111827", // Gray 900
    text: "#f9fafb", // Gray 50
    textSecondary: "#9ca3af", // Gray 400
    border: "#374151", // Gray 700
    accent: "#d1d5db", // Gray 300
    icon: "🌙",
    dotPattern: "#374151", // Gray 700 - darker dots for dark theme
    // Column colors for Kanban - dark grayscale shades
    columnColors: ["#1f2937", "#374151", "#4b5563", "#6b7280", "#9ca3af"],
  },
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("theme", currentTheme);
      // Apply theme colors to CSS variables
      const theme = themes[currentTheme];
      Object.keys(theme).forEach((key) => {
        if (key !== "name" && key !== "icon") {
          if (key === "columnColors") {
            // Apply column colors as indexed CSS variables
            theme.columnColors.forEach((color, index) => {
              document.documentElement.style.setProperty(`--color-columnColors-${index}`, color);
            });
          } else {
            document.documentElement.style.setProperty(`--color-${key}`, theme[key]);
          }
        }
      });
    }
  }, [currentTheme, mounted]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  // We must render the Provider even if not mounted yet to avoid "useTheme must be used within a ThemeProvider" error
  // The children (like Navbar) will execute useTheme immediately upon rendering.
  
  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        theme: themes[currentTheme],
        changeTheme,
        themes,
      }}
    >
      {/* To avoid hydration mismatch, we render children. 
          The theme effect is applied via useEffect/CSS variables. */}
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
