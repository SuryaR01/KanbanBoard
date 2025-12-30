"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { RiKanbanView2 } from "react-icons/ri";
import { FiLogOut, FiUser, FiGrid, FiChevronDown, FiSettings } from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { data: session } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      className="w-full py-3 px-6 md:px-12 flex justify-between items-center sticky bg-transparent top-0 z-50 backdrop-blur-md transition-all duration-300"
      style={{
        // backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Logo Area */}
      <Link href="/" className="flex items-center gap-2 group">
        <div 
          className="p-2 rounded-xl transition-all duration-300 group-hover:scale-110"
          style={{ backgroundColor: "var(--color-primary)", color: "var(--color-surface)" }}
        >
          <RiKanbanView2 size={24} />
        </div>
        <h1 
          className="text-2xl font-bold tracking-tight font-sans"
          style={{ color: "var(--color-text)" }}
        >
          Kanban<span style={{ color: "var(--color-primary)" }}>Board</span>
        </h1>
      </Link>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4 md:gap-6">
        <ThemeToggle />

        {session ? (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 py-1.5 px-2 pr-3 rounded-full border transition-all duration-200 hover:shadow-md"
              style={{ 
                borderColor: "var(--color-border)",
                backgroundColor: isProfileOpen ? "rgba(0,0,0,0.05)" : "transparent"
              }}
            >
              {session.user.image ? (
                 <img src={session.user.image} alt={session.user.name} className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm" />
              ) : (
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-sm"
                  style={{ backgroundColor: "var(--color-primary)", color: "var(--color-surface)" }}
                >
                  {session.user.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-bold leading-none" style={{ color: "var(--color-text)" }}>
                  {session.user.name}
                </span>
                <span className="text-[10px] font-medium opacity-70" style={{ color: "var(--color-textSecondary)" }}>
                  {session.user.role || 'Member'}
                </span>
              </div>
              <FiChevronDown 
                size={16} 
                className={`transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
                style={{ color: "var(--color-textSecondary)" }}
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div 
                className="absolute right-0 mt-3 w-56 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 border"
                style={{ 
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border)"
                }}
              >
                <div className="p-4 border-b" style={{ borderColor: "var(--color-border)" }}>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-50 mb-1" style={{ color: "var(--color-text)" }}>Signed in as</p>
                  <p className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>{session.user.email}</p>
                </div>
                
                <div className="p-2">
                  <Link 
                    href="/boards" 
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-black/5"
                    onClick={() => setIsProfileOpen(false)}
                    style={{ color: "var(--color-text)" }}
                  >
                    <FiGrid size={18} />
                    <span className="font-medium text-sm">My Boards</span>
                  </Link>
                  <Link 
                    href="/settings" 
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-black/5"
                    onClick={() => setIsProfileOpen(false)}
                    style={{ color: "var(--color-text)" }}
                  >
                    <FiSettings size={18} />
                    <span className="font-medium text-sm">Settings</span>
                  </Link>
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-black/5"
                     onClick={() => setIsProfileOpen(false)}
                     style={{ color: "var(--color-text)" }}
                  >
                    <FiUser size={18} />
                    <span className="font-medium text-sm">Profile Settings</span>
                  </Link>
                </div>

                <div className="p-2 border-t" style={{ borderColor: "var(--color-border)" }}>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-red-50 text-red-600"
                  >
                    <FiLogOut size={18} />
                    <span className="font-medium text-sm">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
            style={{ 
              backgroundColor: "var(--color-primary)", 
              color: "white",
              boxShadow: "0 4px 14px 0 rgba(0,0,0,0.1)" // Soft shadow matching theme
            }}
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
