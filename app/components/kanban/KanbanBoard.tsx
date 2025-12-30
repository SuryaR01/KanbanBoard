"use client";
import React, { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Column } from './Column';
import { Project, ProjectCard } from './ProjectCard';
import toast from 'react-hot-toast';

export interface KanbanColumn {
    id: number;
    board_id: number;
    name: string;
    order: number;
}

const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

interface KanbanBoardProps {
    boardId: number;
    boardName: string;
}

export default function KanbanBoard({ boardId, boardName }: KanbanBoardProps) {
    const [columns, setColumns] = useState<KanbanColumn[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        // Fetch current user
        fetch('/api/user/profile')
            .then(res => res.json())
            .then(data => {
                if (data.user) setCurrentUser(data.user);
            })
            .catch(err => console.error("Failed to fetch user profile", err));
    }, []);

    useEffect(() => {
        if (boardId && currentUser) {
            fetchData();
        }
    }, [boardId, currentUser]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [colsRes, tasksRes] = await Promise.all([
                fetch(`/api/columns?boardId=${boardId}`),
                fetch(`/api/tasks?boardId=${boardId}`)
            ]);

            if (colsRes.ok && tasksRes.ok) {
                const colsData = await colsRes.json();
                const tasksData: Project[] = await tasksRes.json();

                setColumns(colsData);

                // Filter projects where current user is a member
                if (currentUser) {
                    const filteredProjects = tasksData.filter(project => {
                        try {
                            const members = typeof project.members === 'string'
                                ? JSON.parse(project.members)
                                : project.members || [];

                            return members.some((m: any) => {
                                if (typeof m === 'string') return m === currentUser.name;
                                return m.id === currentUser.id || m.name === currentUser.name;
                            });
                        } catch (e) {
                            return false;
                        }
                    });
                    setProjects(filteredProjects);
                } else {
                    setProjects([]); // Or show all? User requirements say "not their in project, no need to show"
                }


            } else {
                toast.error('Failed to fetch data');
            }
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setIsLoading(false);
        }
    };


    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === 'Project') {
            setActiveProject(event.active.data.current.project);
        }
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveAProject = active.data.current?.type === 'Project';
        const isOverAProject = over.data.current?.type === 'Project';

        if (!isActiveAProject) return;

        // Dropping a Project over another Project
        if (isActiveAProject && isOverAProject) {
            setProjects((prevProjects) => {
                const activeIndex = prevProjects.findIndex((p) => p.id === activeId);
                const overIndex = prevProjects.findIndex((p) => p.id === overId);

                if (prevProjects[activeIndex].column_id !== prevProjects[overIndex].column_id) {
                    const updatedProjects = [...prevProjects];
                    updatedProjects[activeIndex].column_id = prevProjects[overIndex].column_id;
                    return arrayMove(updatedProjects, activeIndex, overIndex);
                }

                return arrayMove(prevProjects, activeIndex, overIndex);
            });
        }

        // Dropping a Project over a Column
        const isOverAColumn = over.data.current?.type !== 'Project';
        if (isActiveAProject && isOverAColumn) {
            setProjects((prevProjects) => {
                const activeIndex = prevProjects.findIndex((p) => p.id === activeId);
                const updatedProjects = [...prevProjects];
                updatedProjects[activeIndex].column_id = overId as number;
                return arrayMove(updatedProjects, activeIndex, activeIndex);
            });
        }
    };

    const onDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) {
            setActiveProject(null);
            return;
        }

        const activeId = active.id;
        const overId = over.id;

        if (active.data.current?.type === 'Project') {
            const project = projects.find(p => p.id === activeId);
            if (!project) return;

            try {
                const overColumnId = over.data.current?.type === 'Project'
                    ? (over.data.current.project as Project).column_id
                    : overId as number;

                await fetch(`/api/tasks/${activeId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        column_id: overColumnId,
                    }),
                });
            } catch (error) {
                toast.error('Failed to save project move');
                fetchData(); // Rollback
            }
        }

        setActiveProject(null);
    };

    const addNewColumn = async (name: string) => {
        try {
            const res = await fetch('/api/columns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    board_id: boardId,
                    name,
                    order: columns.length
                }),
            });
            if (res.ok) {
                const newCol = await res.json();
                setColumns([...columns, newCol]);
                toast.success('Column added');
            } else {
                toast.error('Failed to add column');
            }
        } catch (error) {
            toast.error('Failed to add column');
        }
    };

    const deleteColumn = async (columnId: number) => {
        if (!confirm('Are you sure you want to delete this column and all its projects?')) return;

        try {
            const res = await fetch(`/api/columns/${columnId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setColumns(columns.filter(c => c.id !== columnId));
                setProjects(projects.filter(p => p.column_id !== columnId));
                toast.success('Column deleted');
            } else {
                toast.error('Failed to delete column');
            }
        } catch (error) {
            toast.error('Failed to delete column');
        }
    };

    const renameColumn = async (columnId: number, newName: string) => {
        try {
            const res = await fetch(`/api/columns/${columnId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName }),
            });
            if (res.ok) {
                const updatedCol = await res.json();
                setColumns(columns.map(c => c.id === columnId ? updatedCol : c));
                toast.success('Column renamed');
            } else {
                toast.error('Failed to rename column');
            }
        } catch (error) {
            toast.error('Failed to rename column');
        }
    };

    const addNewProject = async (columnId: number, title: string) => {
        try {
            if (!currentUser) {
                toast.error("You must be logged in to create a project");
                return;
            }

            const initialMembers = [
                // Add current user as specific object structure
                { id: currentUser.id, name: currentUser.name, image: currentUser.image }
            ];

            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    column_id: columnId,
                    title,
                    description: '',
                    order: projects.filter(p => p.column_id === columnId).length,
                    members: JSON.stringify(initialMembers) // Add creator as member
                }),
            });
            if (res.ok) {
                const newProject = await res.json();
                setProjects([...projects, newProject]);
                toast.success('Project added');
            } else {
                toast.error('Failed to add project');
            }
        } catch (error) {
            toast.error('Failed to add project');
        }
    };

    const handleEditProject = async (updatedProject: Project) => {
        try {
            const res = await fetch(`/api/tasks/${updatedProject.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: updatedProject.title,
                    description: updatedProject.description,
                    labels: updatedProject.labels,
                    due_date: updatedProject.due_date,
                    subtasks: updatedProject.subtasks,
                    members: updatedProject.members
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setProjects(projects.map(p => p.id === updatedProject.id ? data : p));
                toast.success('Project updated');
            } else {
                const errorData = await res.json();
                toast.error(`Update failed: ${errorData.error || 'Server error'}`);
            }
        } catch (error: any) {
            toast.error(`Failed to update project: ${error.message}`);
        }
    };

    const deleteProject = async (id: number) => {
        try {
            const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setProjects(projects.filter(p => p.id !== id));
                toast.success('Project deleted');
            } else {
                toast.error('Failed to delete project');
            }
        } catch (error) {
            toast.error('Failed to delete project');
        }
    };

    if (isLoading) return <div className="p-10 text-center font-bold" style={{ color: 'var(--color-text)' }}>Loading Board...</div>;

    return (
        <div className="flex flex-col h-screen overflow-hidden">

            {/* Board Layout */}
            <div className="flex-1 overflow-x-auto p-6 md:p-10 flex justify-start items-start">
                <h1 className="text-2xl mt-10 mr-7 md:text-3xl font-bold tracking-wider uppercase drop-shadow-md [writing-mode:vertical-rl]" style={{ color: 'var(--color-text)' }}>
                    {boardName}
                </h1>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={onDragStart}
                    onDragOver={onDragOver}
                    onDragEnd={onDragEnd}
                >
                    <div className="flex min-w-full lg:min-w-0">
                        <div className="flex flex-wrap justify-start gap-6">
                            {columns.length > 0 ? (
                                <>
                                    {columns.map((col, index) => (
                                        <Column
                                            key={col.id}
                                            id={col.id}
                                            title={col.name}
                                            index={index}
                                            tasks={projects.filter((p) => p.column_id === col.id)}
                                            onEditTask={handleEditProject}
                                            onAddTask={addNewProject}
                                            onDeleteColumn={deleteColumn}
                                            onRenameColumn={renameColumn}
                                            onDeleteProject={deleteProject}
                                        />
                                    ))}
                                    <AddColumnForm onAdd={addNewColumn} />
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center w-full py-20 border-4 border-dashed rounded-3xl backdrop-blur-sm" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                                    <div className="p-6 rounded-full mb-6" style={{ backgroundColor: 'var(--color-primary)20' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--color-primary)' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--color-text)' }}>Empty Board</h3>
                                    <p className="mb-8 max-w-xs text-center font-medium" style={{ color: 'var(--color-textSecondary)' }}>Create your first column to start organizing your projects.</p>
                                    <AddColumnForm onAdd={addNewColumn} isInitial />
                                </div>
                            )}
                        </div>
                    </div>

                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeProject ? <ProjectCard id={activeProject.id} project={activeProject} onEdit={() => { }} onDelete={() => { }} /> : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
}

function AddColumnForm({ onAdd, isInitial }: { onAdd: (name: string) => void, isInitial?: boolean }) {
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState("");

    if (!isAdding) {
        return (
            <button
                onClick={() => setIsAdding(true)}
                className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-2xl transition-all group shrink-0 ${isInitial ? 'px-8 py-4 shadow-xl' : 'min-w-72 h-14'}`}
                style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-textSecondary)',
                    backgroundColor: 'var(--color-surface)'
                }}
            >
                <span className="text-xl group-hover:scale-125 transition-transform">+</span>
                <span className="text-sm font-bold uppercase tracking-wider">Add Column</span>
            </button>
        );
    }

    return (
        <div className={`rounded-2xl p-4 shadow-sm border h-fit shrink-0 ${isInitial ? 'w-80 shadow-2xl scale-110' : 'min-w-72'}`} style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <input
                autoFocus
                type="text"
                placeholder="Column Name"
                className="w-full p-2 mb-2 rounded-lg border outline-none font-bold"
                style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text)',
                    borderColor: 'var(--color-border)'
                }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && name.trim()) {
                        onAdd(name.trim());
                        setName("");
                        setIsAdding(false);
                    } else if (e.key === 'Escape') {
                        setIsAdding(false);
                    }
                }}
            />
            <div className="flex justify-end gap-2">
                <button
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-1.5 text-xs font-bold uppercase hover:opacity-70"
                    style={{ color: 'var(--color-textSecondary)' }}
                >
                    Cancel
                </button>
                <button
                    onClick={() => {
                        if (name.trim()) {
                            onAdd(name.trim());
                            setName("");
                            setIsAdding(false);
                        }
                    }}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg uppercase shadow-md hover:opacity-90"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-surface)' }}
                >
                    Add
                </button>
            </div>
        </div>
    );
}
