"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { MdColorLens } from "react-icons/md";
import { FiCheck } from "react-icons/fi";

const ThemeToggle = () => {
  const { currentTheme, changeTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 
          hover:rotate-180 hover:scale-110 active:scale-95
        `}
        style={{
          backgroundColor: isOpen ? "var(--color-primary)" : "transparent",
          color: isOpen ? "white" : "var(--color-text)",
          border: isOpen ? "none" : "1px solid var(--color-border)",
        }}
        title="Change Theme"
      >
        <MdColorLens size={20} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-4 w-64 rounded-2xl shadow-xl overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-200 border"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <div 
            className="px-4 py-3 border-b flex justify-between items-center"
            style={{ borderColor: "var(--color-border)" }}
          >
             <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-textSecondary)" }}>Select Theme</span>
          </div>

          <div className="p-2 grid grid-cols-1 gap-1">
            {Object.keys(themes).map((themeKey) => {
              const theme = themes[themeKey];
              const isActive = currentTheme === themeKey;

              return (
                <button
                  key={themeKey}
                  onClick={() => {
                    changeTheme(themeKey);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-200
                    hover:scale-[1.02]
                  `}
                  style={{
                    backgroundColor: isActive ? "var(--color-surface)" : "transparent",
                    border: isActive ? `1px solid var(--color-primary)` : "1px solid transparent"
                  }}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-sm border" 
                    style={{ 
                        backgroundColor: theme.background, 
                        borderColor: theme.border 
                    }}
                  >
                    {theme.icon}
                  </div>
                  
                  <div className="flex-1 flex flex-col items-start">
                    <span 
                        className="text-sm font-bold" 
                        style={{ color: isActive ? "var(--color-primary)" : "var(--color-text)" }}
                    >
                        {theme.name}
                    </span>
                  </div>

                  {isActive && (
                      <div className="text-sm" style={{ color: "var(--color-primary)" }}>
                        <FiCheck size={18} />
                      </div>
                  )}

                  <div className="flex -space-x-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.primary }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.secondary }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accent }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
