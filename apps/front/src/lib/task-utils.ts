import { TaskStatus } from "@templo/types";

export function getTaskStatusLabel(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.PENDING:
      return "A Fazer";
    case TaskStatus.COMPLETED:
      return "Concluído";
    default:
      return status;
  }
}

export function getKanbanColumns() {
  return [
    { id: TaskStatus.PENDING, title: "A Fazer" },
    { id: TaskStatus.COMPLETED, title: "Concluído" },
  ];
}
