"use client";
import React, { useState, useEffect } from 'react';
import { Project } from './ProjectCard';
import { X, Type, Tag, CheckSquare, Calendar, Users, Plus, Trash2 } from 'lucide-react';
import { safeParseJSON } from '@/lib/utils';

interface ProjectModalProps {
    project: Project;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updatedProject: Project) => void;
}

interface Label {
    text: string;
    color: string;
}

interface Subtask {
    id: string;
    text: string;
    completed: boolean;
}

const PRESET_COLORS = [
    '#BE123C', // Rose 700
    '#22C55E', // Green 500
    '#0EA5E9', // Sky 500
    '#849273', // Sage
    '#9333EA', // Purple 600
    '#DB2777', // Pink 600
    '#1E1B4B', // Navy
];

export function ProjectModal({ project, isOpen, onClose, onUpdate }: ProjectModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(project.title);
    const [description, setDescription] = useState(project.description || "");
    const [labels, setLabels] = useState<Label[]>([]);
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [dueDate, setDueDate] = useState(project.due_date || "");
    const [members, setMembers] = useState<any[]>([]);
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);
    const [newSubtask, setNewSubtask] = useState("");
    const [newLabel, setNewLabel] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

    useEffect(() => {
        setTitle(project.title);
        setDescription(project.description || "");

        // Ensure date is in YYYY-MM-DD format for the input[type="date"]
        let currentDueDate = project.due_date || "";
        if (currentDueDate && currentDueDate.includes('T')) {
            currentDueDate = currentDueDate.split('T')[0];
        }
        setDueDate(currentDueDate);

        setLabels(safeParseJSON(project.labels));
        setSubtasks(safeParseJSON(project.subtasks));
        setMembers(safeParseJSON(project.members));

        // Fetch available users
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                if (data.users) {
                    setAvailableUsers(data.users);
                }
            })
            .catch(err => console.error("Failed to fetch users", err));

        // Reset editing state when modal opens
        if (isOpen) setIsEditing(false);

    }, [project, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onUpdate({
            ...project,
            title,
            description,
            labels: JSON.stringify(labels),
            subtasks: JSON.stringify(subtasks),
            due_date: dueDate,
            members: JSON.stringify(members)
        });
        setIsEditing(false);
        // onClose(); // Keep open or close? Usually save closes or goes back to view. Let's go back to view.
    };

    const addLabel = () => {
        if (newLabel.trim()) {
            setLabels([...labels, { text: newLabel.trim(), color: selectedColor }]);
            setNewLabel("");
        }
    };

    const removeLabel = (index: number) => {
        setLabels(labels.filter((_, i) => i !== index));
    };

    const addSubtask = () => {
        if (newSubtask.trim()) {
            setSubtasks([...subtasks, { id: Date.now().toString(), text: newSubtask.trim(), completed: false }]);
            setNewSubtask("");
        }
    };

    const addMember = (userId: string) => {
        if (!userId) return;
        const userToAdd = availableUsers.find(u => u.id.toString() === userId);
        if (userToAdd) {
            const alreadyExists = members.some(m => {
                if (typeof m === 'string') return m === userToAdd.name;
                return m.id === userToAdd.id;
            });

            if (!alreadyExists) {
                setMembers([...members, { id: userToAdd.id, name: userToAdd.name, image: userToAdd.image }]);
            }
            setSelectedUser("");
        }
    };

    const removeMember = (index: number) => {
        setMembers(members.filter((_, i) => i !== index));
    };

    const toggleSubtask = (id: string) => {
        setSubtasks(subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
    };

    const removeSubtask = (id: string) => {
        setSubtasks(subtasks.filter(s => s.id !== id));
    };

    const completedCount = subtasks.filter(s => s.completed).length;
    const progress = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

    return (
        <div className="fixed inset-0 z-[100] mt-18 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--color-surface)' }}>

                {/* Header */}
                <div className="p-6 flex justify-between items-center border-b shrink-0" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-black uppercase tracking-widest px-2 py-1 rounded" style={{ color: 'var(--color-textSecondary)', backgroundColor: 'var(--color-surface)' }}>
                            {isEditing ? 'Editing' : 'Viewing'} Project
                        </span>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-all shadow-sm text-xs font-bold uppercase tracking-wider"
                            >
                                <Type size={14} /> Edit Details
                            </button>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-hidden p-0">

                    {/* ---------------- VIEW MODE (Split Layout) ---------------- */}
                    {!isEditing ? (
                        <div className="grid grid-cols-12 h-full">

                            {/* LEFT SIDE: Main Content (Scrollable) */}
                            <div className="col-span-12 md:col-span-8 p-8 overflow-y-auto custom-scrollbar border-r" style={{ borderColor: 'var(--color-border)' }}>
                                <h2 className="text-4xl font-extrabold mb-6 leading-tight" style={{ color: 'var(--color-text)' }}>{title}</h2>

                                <div className="space-y-8">
                                    {/* Description */}
                                    <div className="max-w-none" style={{ color: 'var(--color-textSecondary)' }}>
                                        <h4 className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--color-textSecondary)' }}>
                                            <Type size={14} /> Description
                                        </h4>
                                        {description ? (
                                            <p className="whitespace-pre-wrap leading-relaxed">{description}</p>
                                        ) : (
                                            <p className="italic text-gray-400">No description provided.</p>
                                        )}
                                    </div>

                                    {/* Subtasks */}
                                    <div>
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <CheckSquare size={14} /> Subtasks & Progress
                                        </h4>
                                        <div className="w-full bg-gray-100 h-2.5 rounded-full mb-4 overflow-hidden">
                                            <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                                        </div>

                                        <div className="rounded-xl p-4 border space-y-2" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
                                            {subtasks.map((task) => (
                                                <div key={task.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200 hover:shadow-sm">
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                                        {task.completed && <CheckSquare size={12} className="text-white" />}
                                                    </div>
                                                    <span className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.text}</span>
                                                </div>
                                            ))}
                                            {subtasks.length === 0 && <p className="text-sm text-gray-400 italic text-center py-2">No subtasks added yet.</p>}
                                        </div>
                                    </div>

                                    {/* Members */}
                                    <section>
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Users size={14} /> Assigned To
                                        </h4>
                                        <div className="space-y-2">
                                            {members.length > 0 ? members.map((member, i) => {
                                                const isObject = typeof member === 'object' && member !== null;
                                                const name = isObject ? member.name : member;
                                                return (
                                                    <div key={i} className="flex items-center gap-3 p-2 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                        <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-xs font-bold text-cyan-800">
                                                            {name[0]}
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-700">{name}</span>
                                                    </div>
                                                );
                                            }) : <span className="text-sm text-gray-400 italic">No members assigned</span>}
                                        </div>
                                    </section>
                                </div>
                            </div>

                            {/* RIGHT SIDE: Metadata (Sidebar) */}
                            <div className="col-span-12 md:col-span-4 p-8 overflow-y-auto custom-scrollbar h-full border-l" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
                                <div className="space-y-8">

                                    {/* Status / Labels */}
                                    <section>
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Tag size={14} /> Labels
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {labels.length > 0 ? labels.map((label, i) => (
                                                <span key={i} style={{ backgroundColor: label.color }} className="px-3 py-1 rounded-lg text-white text-xs font-bold shadow-sm">
                                                    {label.text}
                                                </span>
                                            )) : <span className="text-sm text-gray-400 italic">None</span>}
                                        </div>
                                    </section>



                                    {/* Dates */}
                                    <section>
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Calendar size={14} /> Dates
                                        </h4>
                                        <div className="bg-white p-3 rounded-xl border border-gray-100 space-y-3 shadow-sm">
                                            <div>
                                                <span className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Due Date</span>
                                                <span className="text-sm font-bold text-gray-800">
                                                    {dueDate ? new Date(dueDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }) : 'No Due Date'}
                                                </span>
                                            </div>
                                            <div className="border-t border-gray-50 my-2"></div>
                                            <div>
                                                <span className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Created At</span>
                                                <span className="text-xs font-mono text-gray-500">
                                                    {project.created_at ? new Date(project.created_at).toLocaleString() : 'N/A'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Last Updated</span>
                                                <span className="text-xs font-mono text-gray-500">
                                                    {project.updated_at ? new Date(project.updated_at).toLocaleString() : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </section>

                                    {/* System IDs */}
                                    <section>
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            System ID
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-gray-100 p-2 rounded-lg">
                                                <span className="block text-[9px] uppercase text-gray-400 font-bold">Proj ID</span>
                                                <span className="text-xs font-mono font-bold text-gray-600">#{project.id}</span>
                                            </div>
                                            <div className="bg-gray-100 p-2 rounded-lg">
                                                <span className="block text-[9px] uppercase text-gray-400 font-bold">Col ID</span>
                                                <span className="text-xs font-mono font-bold text-gray-600">{project.column_id}</span>
                                            </div>
                                            <div className="bg-gray-100 p-2 rounded-lg">
                                                <span className="block text-[9px] uppercase text-gray-400 font-bold">Order</span>
                                                <span className="text-xs font-mono font-bold text-gray-600">{project.order}</span>
                                            </div>
                                        </div>
                                    </section>

                                </div>
                            </div>
                        </div>
                    ) : (
                        // ---------------- EDIT MODE ----------------
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 p-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Left Column: Inputs */}
                                <div className="space-y-8">
                                    <section>
                                        <label className="text-xs font-black uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-textSecondary)' }}>Title</label>
                                        <input
                                            className="w-full text-lg font-bold border-b-2 outline-none p-2 transition-colors bg-transparent"
                                            style={{ color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Project Title"
                                        />
                                    </section>

                                    <section>
                                        <label className="text-xs font-black uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-textSecondary)' }}>Description</label>
                                        <textarea
                                            className="w-full text-sm border rounded-xl outline-none p-3 min-h-[120px] resize-none"
                                            style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textSecondary)', borderColor: 'var(--color-border)' }}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Detailed description..."
                                        />
                                    </section>

                                    <section>
                                        <label className="text-xs font-black uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-textSecondary)' }}>Manage Subtasks</label>
                                        <div className="space-y-2 mb-3">
                                            {subtasks.map((task) => (
                                                <div key={task.id} className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={task.completed}
                                                        onChange={() => toggleSubtask(task.id)}
                                                        className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
                                                    />
                                                    <input
                                                        value={task.text}
                                                        onChange={(e) => setSubtasks(subtasks.map(t => t.id === task.id ? { ...t, text: e.target.value } : t))}
                                                        className="flex-1 text-sm bg-transparent border-b border-transparent focus:border-gray-300 outline-none"
                                                        style={{ color: 'var(--color-text)' }}
                                                    />
                                                    <button onClick={() => removeSubtask(task.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                className="flex-1 text-sm p-2 border rounded-lg outline-none"
                                                style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                                placeholder="New subtask..."
                                                value={newSubtask}
                                                onChange={(e) => setNewSubtask(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                                            />
                                            <button onClick={addSubtask} className="p-2 bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200"><Plus size={18} /></button>
                                        </div>
                                    </section>
                                </div>

                                {/* Right Column: Meta Inputs */}
                                <div className="space-y-8">
                                    <section>
                                        <label className="text-xs font-black uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-textSecondary)' }}>Labels</label>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {labels.map((label, i) => (
                                                <span key={i} style={{ backgroundColor: label.color }} className="px-2 py-1 rounded-md text-white text-xs font-bold flex items-center gap-1">
                                                    {label.text}
                                                    <button onClick={() => removeLabel(i)} className="hover:text-black/50"><X size={12} /></button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex gap-1 mb-2">
                                            {PRESET_COLORS.map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`w-5 h-5 rounded-full ${selectedColor === color ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                className="flex-1 text-sm p-2 border rounded-lg"
                                                style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                                placeholder="New Label..."
                                                value={newLabel}
                                                onChange={(e) => setNewLabel(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLabel())}
                                            />
                                            <button onClick={addLabel} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"><Plus size={18} /></button>
                                        </div>
                                    </section>

                                    <section>
                                        <label className="text-xs font-black uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-textSecondary)' }}>Due Date</label>
                                        <input
                                            type="date"
                                            className="w-full text-sm p-2 border rounded-lg"
                                            style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                        />
                                    </section>

                                    <section>
                                        <label className="text-xs font-black uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-textSecondary)' }}>Members</label>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {members.map((member, i) => {
                                                const isObject = typeof member === 'object' && member !== null;
                                                const name = isObject ? member.name : member;
                                                return (
                                                    <span key={i} className="px-2 py-1 bg-cyan-50 text-cyan-700 rounded-md text-xs font-bold flex items-center gap-1">
                                                        {name}
                                                        <button onClick={() => removeMember(i)} className="hover:text-red-500"><X size={12} /></button>
                                                    </span>
                                                )
                                            })}
                                        </div>
                                        <select
                                            className="w-full text-sm p-2 border rounded-lg"
                                            style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                            value={selectedUser}
                                            onChange={(e) => { setSelectedUser(e.target.value); addMember(e.target.value); }}
                                        >
                                            <option value="">+ Add Member</option>
                                            {availableUsers.map(user => (
                                                <option key={user.id} value={user.id}>{user.name}</option>
                                            ))}
                                        </select>
                                    </section>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons (Edit Mode Only) */}
                {isEditing && (
                    <div className="p-6 border-t flex justify-end gap-3 animate-in slide-in-from-bottom-2" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-2.5 text-sm font-bold uppercase transition-colors hover:opacity-80"
                            style={{ color: 'var(--color-textSecondary)' }}
                        >
                            Cancel Edit
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-8 py-2.5 text-sm font-bold bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 uppercase shadow-lg hover:shadow-cyan-200 transition-all active:scale-95"
                        >
                            Save Changes
                        </button>
                    </div>
                )}
            </div >
        </div >
    );
}
