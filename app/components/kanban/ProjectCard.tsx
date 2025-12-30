import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ProjectModal } from './ProjectModal';
import { Calendar, Users, CheckSquare, Trash2, MoreVertical, Edit2, Plus } from 'lucide-react';
import { safeParseJSON } from '@/lib/utils';

export interface Project {
    id: number;
    column_id: number;
    title: string;
    description: string;
    order: number;
    labels?: string; // JSON string
    due_date?: string;
    subtasks?: string; // JSON string
    member_count?: number;
    members?: string; // JSON string for names
    created_at?: string;
    updated_at?: string;
}

interface ProjectCardProps {
    id: number;
    project: Project;
    onEdit: (project: Project) => void;
    onDelete: (id: number) => void;
}

export function ProjectCard({ id, project, onEdit, onDelete }: ProjectCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editValue, setEditValue] = useState(project.title);
    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: id,
        data: {
            type: 'Project',
            project,
        },
        disabled: isEditing,
    });

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
    };

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (editValue.trim() !== "" && editValue !== project.title) {
            onEdit({ ...project, title: editValue });
        } else {
            setEditValue(project.title);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setEditValue(project.title);
            setIsEditing(false);
        }
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-30 bg-green-100 p-4 min-h-[100px] rounded-lg border-2 border-green-300 mb-3 cursor-grabbing"
            />
        );
    }

    if (isEditing) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-white p-4 min-h-[80px] rounded-lg border-2 border-cyan-500 mb-3 shadow-lg"
            >
                <input
                    ref={inputRef}
                    className="w-full text-sm font-semibold text-gray-800 bg-transparent outline-none border-b border-cyan-200 focus:border-cyan-500 transition-colors"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                />
                <div className="flex justify-end gap-2 mt-3">
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={handleSave}
                        className="text-[10px] font-bold text-cyan-600 hover:text-cyan-800 uppercase tracking-tighter"
                    >
                        Save
                    </button>
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { setEditValue(project.title); setIsEditing(false); }}
                        className="text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase tracking-tighter"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    const labels = safeParseJSON(project.labels);
    const subtasks = safeParseJSON(project.subtasks);
    const members = safeParseJSON(project.members);
    const completedSubtasks = Array.isArray(subtasks) ? subtasks.filter((s: any) => s.completed).length : 0;

    const handleToggleSubtask = (e: React.MouseEvent, subtaskId: string) => {
        e.stopPropagation();
        const updatedSubtasks = subtasks.map((s: any) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        onEdit({ ...project, subtasks: JSON.stringify(updatedSubtasks) });
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this project?')) {
            onDelete(id);
        }
    };

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                onClick={() => setIsModalOpen(true)}
                className="group bg-white p-3 rounded-xl border border-gray-200 shadow-sm mb-3 cursor-pointer hover:shadow-lg hover:border-cyan-200 transition-all duration-300 relative flex flex-col"
            >
                {/* Content Wrapper for Hover Effect */}
                <div className="flex flex-col gap-2">

                    {/* Header: Labels & Menu */}
                    <div className="flex justify-between items-start">
                        {labels.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                                {labels.slice(0, 3).map((label: any, i: number) => (
                                    <span
                                        key={i}
                                        style={{ backgroundColor: label.color }}
                                        className="w-8 h-1.5 rounded-full"
                                    />
                                ))}
                            </div>
                        ) : <div className="h-1.5"></div>}

                        {/* Menu (Visible on Hover Only) */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity" ref={menuRef}>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                            >
                                <MoreVertical size={14} />
                            </button>
                            {showMenu && (
                                <div className="absolute top-6 right-0 w-32 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 overflow-hidden">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); setShowMenu(false); }}
                                        className="w-full px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Edit2 size={12} /> Rename
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); setShowMenu(false); }}
                                        className="w-full px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <Trash2 size={12} /> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <p className="text-sm font-bold text-gray-800 leading-tight">
                        {project.title}
                    </p>

                    {/* Basic Footer (Always Visible/Collapsed) */}
                    <div className="flex items-center justify-between mt-1">
                        {/* Members Avatars */}
                        <div className="flex -space-x-1.5">
                            {members.slice(0, 3).map((m: any, i: number) => {
                                const isObject = typeof m === 'object' && m !== null;
                                const name = isObject ? m.name : String(m);
                                const initial = name.length > 0 ? name.charAt(0).toUpperCase() : '?';
                                return (
                                    <div key={i} className="w-5 h-5 rounded-full bg-cyan-100 border border-white flex items-center justify-center text-[8px] font-bold text-cyan-700 shadow-sm" title={name}>
                                        {initial}
                                    </div>
                                )
                            })}
                            {members.length > 3 && (
                                <div className="w-5 h-5 rounded-full bg-gray-100 border border-white flex items-center justify-center text-[8px] font-bold text-gray-500 shadow-sm">
                                    +{members.length - 3}
                                </div>
                            )}
                        </div>

                        {/* Icons Summary */}
                        <div className="flex items-center gap-2 text-gray-400">
                            {project.due_date && <Calendar size={12} />}
                            {subtasks.length > 0 && (
                                <div className="flex items-center gap-0.5 text-[10px] font-medium">
                                    <CheckSquare size={12} />
                                    <span>{completedSubtasks}/{subtasks.length}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* EXPANDED DETAILS (Hover Only) - Smooth Animation */}
                    <div className="max-h-0 opacity-0 overflow-hidden group-hover:max-h-[500px] group-hover:opacity-100 transition-all duration-700 ease-in-out">
                        <div className="pt-3 mt-1 border-t border-dashed border-gray-200 space-y-3">

                            {/* Description */}
                            {project.description && (
                                <p className="text-xs text-gray-600 line-clamp-3">
                                    {project.description}
                                </p>
                            )}

                            {/* Full Labels */}
                            {labels.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {labels.map((label: any, i: number) => (
                                        <span key={i} style={{ backgroundColor: label.color }} className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase">{label.text}</span>
                                    ))}
                                </div>
                            )}

                            {/* Full Subtasks */}
                            {subtasks.length > 0 && (
                                <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase">Subtasks</p>
                                    {subtasks.map((task: any) => (
                                        <div key={task.id} className="flex items-center gap-1.5">
                                            <div className={`w-2.5 h-2.5 rounded border flex items-center justify-center ${task.completed ? 'bg-cyan-500 border-cyan-500' : 'border-gray-300'}`}>
                                                {task.completed && <CheckSquare size={6} className="text-white" />}
                                            </div>
                                            <span className={`text-[10px] ${task.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>{task.text}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Meta Data */}
                            <div className="grid grid-cols-2 gap-2 text-[9px] text-gray-400 font-mono pt-2 border-t border-gray-50">
                                <div>ID: {id}</div>
                                <div>Created: {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                </div>

                {showDeleteConfirm && (
                    <div className="absolute inset-0 z-[60] bg-white/95 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-4">
                        <p className="text-xs font-bold text-gray-800 mb-3">Delete Project?</p>
                        <div className="flex gap-2 w-full">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}
                                className="flex-1 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(id); setShowDeleteConfirm(false); }}
                                className="flex-1 py-1.5 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ProjectModal
                project={project}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpdate={onEdit}
            />
        </>
    );
}




