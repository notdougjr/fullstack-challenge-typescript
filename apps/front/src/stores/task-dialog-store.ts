import { create } from "zustand";
import { type Task } from "@/lib/types";

interface TaskDialogState {
  isOpen: boolean;
  mode: "create" | "view";
  task: Task | null;
  openDialog: (mode: "create" | "view", task?: Task | null) => void;
  closeDialog: () => void;
}

export const useTaskDialogStore = create<TaskDialogState>((set) => ({
  isOpen: false,
  mode: "create",
  task: null,
  openDialog: (mode, task = null) => {
    set({
      isOpen: true,
      mode,
      task,
    });
  },
  closeDialog: () => {
    set({
      isOpen: false,
      task: null,
    });
  },
}));

