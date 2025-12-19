"use client";

import { createContext, useContext, ReactNode } from "react";
import { toast } from "sonner";
import { TaskDialog } from "@/components/task-dialog";
import { useTaskDialogStore } from "@/stores/task-dialog-store";
import {
  type Task,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "@/lib/types";
import { createTask, updateTask, deleteTask } from "@/lib/api";

interface TaskDialogContextType {
  openCreateDialog: () => void;
  openViewDialog: (task: Task) => void;
}

const TaskDialogContext = createContext<TaskDialogContextType | undefined>(
  undefined
);

export function useTaskDialog() {
  const context = useContext(TaskDialogContext);
  if (!context) {
    throw new Error("useTaskDialog must be used within TaskDialogProvider");
  }
  return context;
}

interface TaskDialogProviderProps {
  children: ReactNode;
}

export function TaskDialogProvider({ children }: TaskDialogProviderProps) {
  const { isOpen, mode, task, openDialog, closeDialog } = useTaskDialogStore();

  const openCreateDialog = () => {
    openDialog("create");
  };

  const openViewDialog = (task: Task) => {
    openDialog("view", task);
  };

  const handleCreate = async (newTask: CreateTaskInput) => {
    try {
      const payload = {
        ...newTask,
        startDate: newTask.startDate?.toISOString(),
        dueDate: newTask.dueDate?.toISOString(),
      };
      await createTask(payload);
      toast.success("Tarefa criada com sucesso!");
      closeDialog();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar tarefa");
      throw error;
    }
  };

  const handleUpdate = async (updatedTask: UpdateTaskInput) => {
    try {
      const { id, ...updateData } = updatedTask;
      const payload: any = {
        ...updateData,
        startDate: updateData.startDate?.toISOString(),
        dueDate: updateData.dueDate?.toISOString(),
      };
      await updateTask(id, payload);
      toast.success("Tarefa atualizada com sucesso!");
      closeDialog();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar tarefa");
      throw error;
    }
  };

  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId);
    closeDialog();
  };

  return (
    <TaskDialogContext.Provider value={{ openCreateDialog, openViewDialog }}>
      {children}
      <TaskDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
        mode={mode}
        task={task}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </TaskDialogContext.Provider>
  );
}
