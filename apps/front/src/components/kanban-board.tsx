"use client";

import type React from "react";

import { useState } from "react";
import { TaskCard } from "@/components/task-card";
import { TaskDialog } from "@/components/task-dialog";
import { TaskStatus, TaskType, type Task } from "@/lib/types";
import { getKanbanColumns } from "@/lib/task-utils";

const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    title: "Implementar autenticação",
    description: "Adicionar sistema de login e registro com JWT",
    status: TaskStatus.PENDING,
    type: TaskType.TASK,
    createdBy: "user-1",
    assignedTo: "user-2",
    createdAt: new Date("2025-12-15"),
  },
  {
    id: "2",
    title: "Criar dashboard",
    description: "Desenvolver interface principal do sistema",
    status: TaskStatus.PENDING,
    type: TaskType.TASK,
    createdBy: "user-1",
    assignedTo: "user-3",
    createdAt: new Date("2025-12-14"),
  },
  {
    id: "3",
    title: "Configurar CI/CD",
    description: "Setup pipeline de deploy automático",
    status: TaskStatus.COMPLETED,
    type: TaskType.TASK,
    createdBy: "user-1",
    assignedTo: "user-4",
    createdAt: new Date("2025-12-13"),
  },
];

const COLUMNS = getKanbanColumns();

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: TaskStatus) => {
    if (!draggedTask) return;

    setTasks(
      tasks.map((task) =>
        task.id === draggedTask.id ? { ...task, status } : task
      )
    );
    setDraggedTask(null);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const handleCreateTask = (newTask: Omit<Task, "id" | "createdAt">) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date(),
      type: newTask.type || TaskType.TASK,
      status: newTask.status || TaskStatus.PENDING,
    };
    setTasks([...tasks, task]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    setSelectedTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    setSelectedTask(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.id);

          return (
            <div
              key={column.id}
              className="flex flex-col rounded-lg bg-muted/50 p-4"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-foreground">
                  {column.title}
                </h3>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {columnTasks.length}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDragStart={handleDragStart}
                    onClick={handleTaskClick}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        mode="view"
        task={selectedTask}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        onCreate={handleCreateTask}
      />
    </>
  );
}
