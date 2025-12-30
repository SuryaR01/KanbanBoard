'use client';
import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Project, ProjectCard } from './ProjectCard';
import { MoreVertical, Trash2, Edit2, Plus, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ColumnProps {
    id: number;
    title: string;
    tasks: Project[];
    onEditTask: (task: Project) => void;
    onAddTask: (columnId: number, title: string) => void;
    onDeleteColumn: (columnId: number) => void;
    onRenameColumn: (columnId: number, newTitle: string) => void;
    onDeleteProject: (id: number) => void;
    index: number;
}

export function Column({ id, title, tasks, onEditTask, onAddTask, onDeleteColumn, onRenameColumn, onDeleteProject, index }: ColumnProps) {
    const { theme } = useTheme();
    const [isAdding, setIsAdding] = React.useState(false);
    const [newTaskTitle, setNewTaskTitle] = React.useState("");
    const [isEditingTitle, setIsEditingTitle] = React.useState(false);
    const [newTitle, setNewTitle] = React.useState(title);
    const [showMenu, setShowMenu] = React.useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const titleRef = React.useRef<HTMLInputElement>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);

    // Get column color index (cycles through 0-4)
    const columnColorIndex = index % 5;

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const { setNodeRef } = useDroppable({
        id: id,
    });

    React.useEffect(() => {
        if (isAdding && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isAdding]);

    React.useEffect(() => {
        if (isEditingTitle && titleRef.current) {
            titleRef.current.focus();
        }
    }, [isEditingTitle]);

    const handleAddTask = () => {
        if (newTaskTitle.trim()) {
            onAddTask(id, newTaskTitle.trim());
            setNewTaskTitle("");
            setIsAdding(false);
        }
    };

    const handleRename = () => {
        if (newTitle.trim() && newTitle.trim() !== title) {
            onRenameColumn(id, newTitle.trim());
        } else {
            setNewTitle(title);
        }
        setIsEditingTitle(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddTask();
        } else if (e.key === 'Escape') {
            setIsAdding(false);
            setNewTaskTitle("");
        }
    };

    return (
        <div className="flex flex-col w-72 min-h-[500px] rounded-2xl p-4 mr-6 last:mr-0 shadow-sm" style={{ backgroundColor: `var(--color-columnColors-${columnColorIndex})`, borderColor: 'var(--color-border)', borderWidth: '1px' }}>
            <div className="flex items-center justify-between mb-6 group/column">
                <div className="flex items-center flex-1">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-2 shrink-0" style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-surface)' }}>
                        {index + 1}
                    </span>
                    {isEditingTitle ? (
                        <input
                            ref={titleRef}
                            className="text-sm font-black uppercase tracking-wider p-1 border rounded outline-none w-full"
                            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderColor: 'var(--color-primary)' }}
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onBlur={handleRename}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRename();
                                if (e.key === 'Escape') {
                                    setNewTitle(title);
                                    setIsEditingTitle(false);
                                }
                            }}
                        />
                    ) : (
                        <h2
                            onClick={() => setIsEditingTitle(true)}
                            className="text-sm font-black uppercase tracking-wider cursor-pointer hover:opacity-70 transition-opacity truncate"
                            style={{ color: 'var(--color-text)' }}
                        >
                            {title}
                        </h2>
                    )}
                </div>
                <div className="flex items-center gap-2 ml-2 relative" ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
                        // style={{ color: 'var(--color-textSecondary)' }}
                    >
                        <MoreVertical size={16} />
                    </button>

                    {showMenu && (
                        <div className="absolute top-full right-0 mt-1 w-48 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
                            <button
                                onClick={() => { setIsEditingTitle(true); setShowMenu(false); }}
                                className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"
                                style={{ color: 'var(--color-text)' }}
                            >
                                <Edit2 size={14} /> Rename Column
                            </button>
                            <button
                                onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
                                className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <Trash2 size={14} /> Delete Column
                            </button>
                        </div>
                    )}

                    {showDeleteConfirm && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                            <div className="p-6 rounded-3xl shadow-2xl max-w-sm w-full animate-in zoom-in duration-200" style={{ backgroundColor: 'var(--color-surface)' }}>
                                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text)' }}>Delete Column?</h3>
                                <p className="text-sm mb-6" style={{ color: 'var(--color-textSecondary)' }}>This will permanently delete "{title}" and all its projects.</p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 py-2 text-sm font-bold rounded-xl transition-colors"
                                        style={{ color: 'var(--color-textSecondary)', backgroundColor: 'var(--color-background)' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => { onDeleteColumn(id); setShowDeleteConfirm(false); }}
                                        className="flex-1 py-2 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 shadow-lg shadow-red-200 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: 'var(--color-text)', backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
                        {tasks.length}
                    </span>
                </div>
            </div>

            <div ref={setNodeRef} className="flex-1 overflow-y-auto min-h-[100px]">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <ProjectCard key={task.id} id={task.id} project={task} onEdit={onEditTask} onDelete={onDeleteProject} />
                    ))}
                </SortableContext>

                {isAdding ? (
                    <div className="p-3 rounded-2xl shadow-xl mt-2 animate-in fade-in zoom-in duration-200" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-primary)', borderWidth: '2px' }}>
                        <textarea
                            ref={inputRef as any}
                            placeholder="Type project title..."
                            className="w-full text-sm p-2 outline-none bg-transparent min-h-[60px] resize-none"
                            style={{ color: 'var(--color-text)' }}
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={handleKeyDown as any}
                        />
                        <div className="flex justify-end gap-2 pt-2" style={{ borderTopColor: 'var(--color-border)', borderTopWidth: '1px' }}>
                            <button
                                onClick={() => { setIsAdding(false); setNewTaskTitle(""); }}
                                className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest hover:opacity-70"
                                style={{ color: 'var(--color-textSecondary)' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddTask}
                                className="px-4 py-2 text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg transition-all active:scale-95"
                                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-surface)' }}
                            >
                                Add Card
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full mt-3 flex items-center gap-2 px-3 py-2 rounded-xl transition-all group hover:opacity-70"
                        style={{ color: 'var(--color-textSecondary)' }}
                    >
                        <Plus size={16} className="group-hover:scale-125 transition-transform" />
                        <span className="text-xs font-bold tracking-tight">Add Card</span>
                    </button>
                )}

                {tasks.length === 0 && !isAdding && (
                    <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl mt-4 opacity-50" style={{ borderColor: 'var(--color-border)' }}>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--color-textSecondary)' }}>Ready</p>
                    </div>
                )}
            </div>
        </div>
    );
}
