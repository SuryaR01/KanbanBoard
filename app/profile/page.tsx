"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { FiUser, FiMail, FiSave, FiCamera } from "react-icons/fi";
import toast from "react-hot-toast";

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (session?.user?.name) {
            setName(session.user.name);
        }
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Mock update - in a real app this would call an API endpoint
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            // In a real app, you would update the session here after API call
            // await update({ name });
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-background)" }}>
                <p style={{ color: "var(--color-text)" }}>Please login to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 md:p-12 transition-colors duration-300" style={{ backgroundColor: "var(--color-background)" }}>
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8" style={{ color: "var(--color-text)" }}>Profile Settings</h1>

                <div className="rounded-2xl p-8 shadow-sm border transition-colors duration-300"
                    style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>

                    <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                        <div className="relative group">
                            {session.user.image ? (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name || "User"}
                                    className="w-32 h-32 rounded-full object-cover border-4 shadow-md"
                                    style={{ borderColor: "var(--color-surface)" }}
                                />
                            ) : (
                                <div
                                    className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold shadow-md"
                                    style={{ backgroundColor: "var(--color-primary)", color: "var(--color-surface)" }}
                                >
                                    {session.user.name?.[0]?.toUpperCase() || "U"}
                                </div>
                            )}
                            <button
                                className="absolute bottom-0 right-0 p-2 rounded-full shadow-lg transition-transform hover:scale-110"
                                style={{ backgroundColor: "var(--color-primary)", color: "var(--color-surface)" }}
                            >
                                <FiCamera size={20} />
                            </button>
                        </div>

                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>{session.user.name}</h2>
                            <p className="font-medium opacity-70" style={{ color: "var(--color-textSecondary)" }}>{session.user.role || "Member"}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1" style={{ color: "var(--color-textSecondary)" }}>Full Name</label>
                            <div className="relative">
                                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--color-textSecondary)" }} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border bg-transparent font-medium focus:ring-2 focus:ring-opacity-50 outline-none transition-all"
                                    style={{
                                        borderColor: "var(--color-border)",
                                        color: "var(--color-text)",
                                        // focus ring color would ideally be var(--color-primary) but tough with inline styles, leaving default browser focus or adding class if possible.
                                        // using class focus:border-[color] is easier if utility classes support vars, else explicit style.
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1" style={{ color: "var(--color-textSecondary)" }}>Email Address</label>
                            <div className="relative opacity-70">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--color-textSecondary)" }} />
                                <input
                                    type="email"
                                    value={session.user.email || ""}
                                    disabled
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border bg-transparent font-medium cursor-not-allowed"
                                    style={{
                                        borderColor: "var(--color-border)",
                                        color: "var(--color-text)"
                                    }}
                                />
                            </div>
                            <p className="text-xs ml-1" style={{ color: "var(--color-textSecondary)" }}>Email cannot be changed.</p>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-md transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: "var(--color-primary)", color: "var(--color-surface)" }}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <FiSave size={18} />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
}
