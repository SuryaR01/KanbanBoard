"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, X, Layout } from "lucide-react";

const BASE_PATH = "";

interface Board {
    id: number;
    name: string;
    created_at: string;
}

export default function BoardsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [boards, setBoards] = useState<Board[]>([]);
    const [confirmingBoardId, setConfirmingBoardId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingMode, setIsAddingMode] = useState(false);
    const [newBoardName, setNewBoardName] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchBoards();
        }
    }, [status]);

    const fetchBoards = async () => {
        try {
            const res = await fetch(`${BASE_PATH}/api/boards`);
            const data = await res.json();
            setBoards(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Failed to fetch boards");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddBoard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBoardName.trim()) return;

        try {
            const res = await fetch(`${BASE_PATH}/api/boards`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newBoardName }),
            });

            if (res.ok) {
                const newBoard = await res.json();
                setBoards([newBoard, ...boards]);
                setNewBoardName("");
                setIsAddingMode(false);
                toast.success("Board created successfully!");
                // Navigate to the new board
                router.push(`/boards/${newBoard.id}`);
            } else {
                toast.error("Failed to create board");
            }
        } catch (error) {
            toast.error("Error creating board");
        }
    };

    const deleteBoard = async (e: React.MouseEvent, id: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (confirmingBoardId !== id) {
            setConfirmingBoardId(id);
            // Reset confirmation after 3 seconds if not clicked again
            setTimeout(() => setConfirmingBoardId(null), 3000);
            return;
        }

        try {
            const res = await fetch(`${BASE_PATH}/api/boards/${id}`, { method: "DELETE" });
            if (res.ok) {
                setBoards(boards.filter(b => b.id !== id));
                setConfirmingBoardId(null);
                toast.success("Board deleted");
            } else {
                toast.error("Failed to delete board");
            }
        } catch (error) {
            toast.error("Error deleting board");
        }
    };


    if (status === "loading" || isLoading) {
        return (
            <div className="flex h-screen items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 md:p-12 lg:p-20" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>My Boards</h1>
                    <p style={{ color: 'var(--color-textSecondary)' }}>Organize your work and manage your projects.</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {/* Board Cards */}
                    {boards.map((board) => (
                        <Link
                            key={board.id}
                            href={`/boards/${board.id}`}
                            className="group relative h-40 rounded-xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 duration-500 flex items-center justify-center cursor-pointer overflow-hidden"
                            style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => deleteBoard(e, board.id)}
                                    className={`flex items-center gap-1 p-1 px-2 rounded-full transition-all shadow-lg ${confirmingBoardId === board.id
                                        ? "bg-red-500 scale-105"
                                        : "bg-white/20 hover:bg-white/40"
                                        }`}
                                    style={{ color: 'var(--color-surface)' }}
                                >
                                    {confirmingBoardId === board.id ? (
                                        <>
                                            <span className="text-[10px] font-bold uppercase">Confirm?</span>
                                            <X size={16} />
                                        </>
                                    ) : (
                                        <X size={20} />
                                    )}
                                </button>
                            </div>
                            <div className="text-center">
                                <Layout className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" style={{ color: 'var(--color-surface)', opacity: 0.5 }} />
                                <h3 className="font-bold text-xl underline decoration-2 underline-offset-4 group-hover:decoration-current transition-all" style={{ color: 'var(--color-surface)', textDecorationColor: 'rgba(255, 255, 255, 0.3)' }}>
                                    {board.name}
                                </h3>
                            </div>
                        </Link>
                    ))}

                    {/* Add Board Card */}
                    {isAddingMode ? (
                        <div className="h-40 border-2 border-dashed rounded-xl p-6 flex flex-col justify-center items-center" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                            <form onSubmit={handleAddBoard} className="w-full space-y-3">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Enter board name..."
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}
                                    value={newBoardName}
                                    onChange={(e) => setNewBoardName(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="flex-1 text-white py-2 rounded-lg font-bold hover:opacity-90 transition-all"
                                        style={{ backgroundColor: 'var(--color-primary)' }}
                                    >
                                        Create
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingMode(false)}
                                        className="px-3 py-2 font-medium hover:opacity-70"
                                        style={{ color: 'var(--color-textSecondary)' }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAddingMode(true)}
                            className="h-40 border-2 border-dashed rounded-xl p-6 flex items-center justify-center gap-2 transition-all hover:opacity-70"
                            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-textSecondary)' }}
                        >
                            <Plus size={24} />
                            <span className="font-bold">Add Board</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
