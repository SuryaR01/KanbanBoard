"use client";

import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { FiMoon, FiSun, FiBell, FiMonitor, FiCheck } from "react-icons/fi";
import { Switch } from "@headlessui/react"; // If headlessui is not installed, I will implement a custom switch or simple checkbox. 
// I'll check package.json or just build a simple custom switch since I don't want to assume deps.
// Actually I'll implement a custom switch using standard div/button to avoid dependency issues.

export default function SettingsPage() {
    const { currentTheme, changeTheme, themes } = useTheme();
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);

    return (
        <div className="min-h-screen p-6 md:p-12 transition-colors duration-300" style={{ backgroundColor: "var(--color-background)" }}>
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-text)" }}>Settings</h1>
                <p className="mb-8" style={{ color: "var(--color-textSecondary)" }}>Manage your application preferences</p>

                {/* Theme Settings */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4" style={{ color: "var(--color-text)" }}>Appearance</h2>
                    <div className="rounded-2xl p-6 shadow-sm border transition-colors duration-300"
                        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => changeTheme("light")}
                                className={`relative flex items-center p-4 rounded-xl border-2 transition-all ${currentTheme === "light" ? "ring-2 ring-offset-2" : "hover:bg-black/5"}`}
                                style={{
                                    borderColor: currentTheme === "light" ? "var(--color-primary)" : "var(--color-border)",
                                    backgroundColor: currentTheme === "light" ? "transparent" : "transparent"
                                    // ring color cannot be easily set with inline styles for tailwind ring utilities, but border handles selection visibility.
                                }}
                            >
                                <div className="p-2 rounded-full mr-4 bg-gray-100 text-amber-500">
                                    <FiSun size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold" style={{ color: "var(--color-text)" }}>Light Mode</p>
                                    <p className="text-xs" style={{ color: "var(--color-textSecondary)" }}>Clean and bright</p>
                                </div>
                                {currentTheme === "light" && (
                                    <div className="absolute top-4 right-4 text-cyan-500">
                                        <FiCheck size={20} style={{ color: "var(--color-primary)" }} />
                                    </div>
                                )}
                            </button>

                            <button
                                onClick={() => changeTheme("dark")}
                                className={`relative flex items-center p-4 rounded-xl border-2 transition-all ${currentTheme === "dark" ? "ring-2 ring-offset-2" : "hover:bg-black/5"}`}
                                style={{
                                    borderColor: currentTheme === "dark" ? "var(--color-primary)" : "var(--color-border)",
                                }}
                            >
                                <div className="p-2 rounded-full mr-4 bg-gray-800 text-purple-400">
                                    <FiMoon size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold" style={{ color: "var(--color-text)" }}>Dark Mode</p>
                                    <p className="text-xs" style={{ color: "var(--color-textSecondary)" }}>Easy on the eyes</p>
                                </div>
                                {currentTheme === "dark" && (
                                    <div className="absolute top-4 right-4">
                                        <FiCheck size={20} style={{ color: "var(--color-primary)" }} />
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Notification Settings */}
                <section>
                    <h2 className="text-xl font-bold mb-4" style={{ color: "var(--color-text)" }}>Notifications</h2>
                    <div className="rounded-2xl p-6 shadow-sm border transition-colors duration-300"
                        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                                        <FiBell size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold" style={{ color: "var(--color-text)" }}>Push Notifications</p>
                                        <p className="text-xs" style={{ color: "var(--color-textSecondary)" }}>Receive notifications about board updates</p>
                                    </div>
                                </div>
                                <Toggle checked={pushNotifications} onChange={setPushNotifications} />
                            </div>

                            <div className="w-full h-px" style={{ backgroundColor: "var(--color-border)" }}></div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-full bg-green-100 text-green-600">
                                        <FiBell size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold" style={{ color: "var(--color-text)" }}>Email Notifications</p>
                                        <p className="text-xs" style={{ color: "var(--color-textSecondary)" }}>Receive daily summaries</p>
                                    </div>
                                </div>
                                <Toggle checked={emailNotifications} onChange={setEmailNotifications} />
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2`}
            style={{ backgroundColor: checked ? "var(--color-primary)" : "var(--color-border)" }}
        >
            <span
                className={`${checked ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
        </button>
    );
}
