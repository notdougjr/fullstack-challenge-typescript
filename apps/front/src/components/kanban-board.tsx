"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { TaskCard } from "@/components/task-card";
import { TaskStatus, type Task } from "@/lib/types";
import { getKanbanColumns } from "@/lib/task-utils";
import { fetchTasks, updateTask } from "@/lib/api";
import { useTaskDialog } from "@/contexts/task-dialog-context";
import { useTaskDialogStore } from "@/stores/task-dialog-store";

const COLUMNS = getKanbanColumns();

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const { openViewDialog } = useTaskDialog();
  const isDialogOpen = useTaskDialogStore((state) => state.isOpen);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (!isDialogOpen) {
      loadTasks();
    }
  }, [isDialogOpen]);

  const loadTasks = async () => {
    try {
      const data = await fetchTasks();
      const formattedTasks = data.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        startDate: task.startDate ? new Date(task.startDate) : undefined,
      }));
      setTasks(formattedTasks);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (status: TaskStatus) => {
    if (!draggedTask) return;

    try {
      await updateTask(draggedTask.id, { status });
      setTasks(
        tasks.map((task) =>
          task.id === draggedTask.id ? { ...task, status } : task
        )
      );

      if (
        draggedTask.status === TaskStatus.PENDING &&
        status === TaskStatus.COMPLETED
      ) {
        toast.success("Tarefa concluída!", {
          description: `${draggedTask.title} foi marcada como concluída.`,
        });
      } else if (status !== draggedTask.status) {
        toast.success("Status da tarefa atualizado!");
      }

      setDraggedTask(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar status da tarefa");
      console.error(error);
    }
  };

  const handleTaskClick = (task: Task) => {
    openViewDialog(task);
  };

  return (
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
              <h3 className="font-semibold text-foreground">{column.title}</h3>
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
  );
}
