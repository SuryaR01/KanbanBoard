"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import KanbanBoard from "@/app/components/kanban/KanbanBoard";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function BoardDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { status } = useSession();
    const [boardName, setBoardName] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && id) {
            fetchBoardDetails();
        }
    }, [status, id]);

    const fetchBoardDetails = async () => {
        try {
            const res = await fetch(`/api/boards`);
            const boards = await res.json();
            const board = boards.find((b: any) => b.id === Number(id));
            if (board) {
                setBoardName(board.name);
            } else {
                toast.error("Board not found");
                router.push("/boards");
            }
        } catch (error) {
            toast.error("Failed to fetch board details");
        } finally {
            setIsLoading(false);
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
        <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="absolute  top-15 left-4 z-50 cursor-pointer fixed">
                {/* <Link
                    href="/boards"
                    className="flex items-center gap-1 text-white bg-black/30 hover:bg-black/50 px-3 py-1.5 rounded-lg transition-colors font-medium text-sm backdrop-blur-sm"
                >
                    <ChevronLeft size={18} />
                    Back to Boards
                </Link> */}
            </div>
            <KanbanBoard boardId={Number(id)} boardName={boardName} />
        </div>
    );
}
