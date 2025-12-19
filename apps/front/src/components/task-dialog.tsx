"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Calendar, User, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TaskStatus,
  TaskType,
  type Task,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "@/lib/types";
import { getTaskStatusLabel } from "@/lib/task-utils";
import { fetchUsers, fetchTask, fetchTasks } from "@/lib/api";

interface User {
  id: string;
  username?: string;
  email: string;
}

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "view";
  task?: Task | null;
  parentTask?: Task | null;
  users?: User[];
  onCreate?: (task: CreateTaskInput) => void;
  onUpdate?: (task: UpdateTaskInput) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskDialog({
  open,
  onOpenChange,
  mode,
  task,
  parentTask,
  users: propUsers = [],
  onCreate,
  onUpdate,
  onDelete,
}: TaskDialogProps) {
  const [isEditing, setIsEditing] = useState(mode === "create");
  const [users, setUsers] = useState<User[]>(propUsers);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: TaskStatus.PENDING,
    assignedTo: "",
  });
  const isEditingRef = useRef(false);
  const [showSubtaskDialog, setShowSubtaskDialog] = useState(false);
  const [loadedParentTask, setLoadedParentTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<Task[]>([]);
  const [selectedSubtask, setSelectedSubtask] = useState<Task | null>(null);
  const [showSubtaskViewDialog, setShowSubtaskViewDialog] = useState(false);
  const formId = useRef<string | undefined>(undefined);

  if (!formId.current) {
    formId.current = `task-form-${Date.now()}-${Math.random()}`;
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const fetchedUsers = await fetchUsers();
        setUsers(fetchedUsers);

        if (task?.parentId) {
          const parentTaskData = await fetchTask(task.parentId);
          setLoadedParentTask({
            ...parentTaskData,
            createdAt: new Date(parentTaskData.createdAt),
          });
        } else {
          setLoadedParentTask(null);
        }

        if (task && task.type === TaskType.TASK) {
          const allTasks = await fetchTasks();
          const taskSubtasks = allTasks
            .filter((t: any) => t.parentId === task.id)
            .map((t: any) => ({
              ...t,
              createdAt: new Date(t.createdAt),
            }));
          setSubtasks(taskSubtasks);
        } else {
          setSubtasks([]);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    if (open) {
      loadData();
    }
  }, [open, task]);

  useEffect(() => {
    if (!open) {
      isEditingRef.current = false;
      return;
    }

    if (isEditingRef.current) {
      return;
    }

    if (task && mode === "view") {
      setFormData({
        title: task.title,
        description: task.description || "",
        status: task.status,
        assignedTo: task.assignedTo?.id || "",
      });
      setIsEditing(false);
    } else if (mode === "create") {
      setFormData({
        title: "",
        description: "",
        status: TaskStatus.PENDING,
        assignedTo: "",
      });
      setIsEditing(true);
      isEditingRef.current = true;
    }
  }, [task, mode, open]);

  useEffect(() => {
    if (!open) {
      setIsEditing(mode === "create");
      isEditingRef.current = false;
    }
  }, [open, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (mode === "view" && !isEditing) {
      return;
    }

    if (mode === "create" && onCreate) {
      try {
        await onCreate({
          ...formData,
          type: parentTask ? TaskType.SUBTASK : TaskType.TASK,
          parentId: parentTask?.id,
          assignedTo: formData.assignedTo || undefined,
        } as CreateTaskInput);
        onOpenChange(false);
        setFormData({
          title: "",
          description: "",
          status: TaskStatus.PENDING,
          assignedTo: "",
        });
      } catch (error) {
        console.error("Erro ao criar tarefa:", error);
      }
    } else if (mode === "view" && task && onUpdate && isEditing) {
      try {
        const updatePayload: UpdateTaskInput = {
          id: task.id,
          ...formData,
        };
        if (!formData.assignedTo || formData.assignedTo.trim() === "") {
          updatePayload.assignedTo = undefined;
        }
        await onUpdate(updatePayload);
        setIsEditing(false);
        onOpenChange(false);
      } catch (error) {
        console.error("Erro ao atualizar tarefa:", error);
      }
    }
  };

  const handleDelete = () => {
    if (task && onDelete) {
      onDelete(task.id);
      onOpenChange(false);
    }
  };

  const handleSubtaskClick = (subtask: Task) => {
    setSelectedSubtask(subtask);
    setShowSubtaskViewDialog(true);
  };

  const handleSubtaskViewDialogClose = (open: boolean) => {
    setShowSubtaskViewDialog(open);
    if (!open) {
      const loadSubtasks = async () => {
        if (task && task.type === TaskType.TASK) {
          try {
            const allTasks = await fetchTasks();
            const taskSubtasks = allTasks
              .filter((t: any) => t.parentId === task.id)
              .map((t: any) => ({
                ...t,
                createdAt: new Date(t.createdAt),
              }));
            setSubtasks(taskSubtasks);
          } catch (error) {
            console.error("Erro ao recarregar subtarefas:", error);
          }
        }
      };
      loadSubtasks();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? parentTask
                ? "Criar Nova Subtarefa"
                : "Criar Nova Tarefa"
              : isEditing
              ? "Editar Tarefa"
              : "Detalhes da Tarefa"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? parentTask
                ? "Preencha os detalhes da nova subtarefa"
                : "Preencha os detalhes da nova tarefa"
              : isEditing
              ? "Atualize as informações da tarefa"
              : "Visualize os detalhes completos da tarefa"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 -mx-6 px-6">
          {(parentTask || loadedParentTask) && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 p-3 mb-6">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                Subtarefa de:{" "}
                <strong>{parentTask?.title || loadedParentTask?.title}</strong>
              </p>
            </div>
          )}

          <form
            id={formId.current}
            onSubmit={handleSubmit}
            className="space-y-6"
            onKeyDown={(e) => {
              if (e.key === "Enter" && mode === "view" && !isEditing) {
                e.preventDefault();
              }
            }}
          >
            {mode === "view" && task && !isEditing && (
              <div className="space-y-6">
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                      Título
                    </p>
                    <h3 className="text-lg font-semibold text-foreground">
                      {task.title}
                    </h3>
                  </div>

                  {task.description && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                          Descrição
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {task.description}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground mb-4 font-medium uppercase tracking-wide">
                    Informações
                  </p>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        Status
                      </span>
                      <Badge variant="outline" className="font-medium">
                        {getTaskStatusLabel(task.status)}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Responsável
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {task.assignedTo
                          ? task.assignedTo.username ||
                            task.assignedTo.email ||
                            "Usuário não encontrado"
                          : "Não atribuído"}
                      </span>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Data de Criação
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {task.createdAt.toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {task.type === TaskType.TASK && subtasks.length > 0 && (
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="text-xs text-muted-foreground mb-4 font-medium uppercase tracking-wide">
                      Subtarefas ({subtasks.length})
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Título</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Responsável</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subtasks.map((subtask) => (
                          <TableRow
                            key={subtask.id}
                            className="cursor-pointer"
                            onClick={() => handleSubtaskClick(subtask)}
                          >
                            <TableCell className="font-medium">
                              {subtask.title}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {getTaskStatusLabel(subtask.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {subtask.assignedTo
                                ? subtask.assignedTo.username ||
                                  subtask.assignedTo.email
                                : "Não atribuído"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}

            {(mode === "create" || isEditing) && (
              <>
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      placeholder="Digite o título da tarefa"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      placeholder="Adicione uma descrição detalhada..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: TaskStatus) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TaskStatus.PENDING}>
                          A Fazer
                        </SelectItem>
                        <SelectItem value={TaskStatus.COMPLETED}>
                          Concluído
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Responsável</Label>
                    <Select
                      value={formData.assignedTo || "unassigned"}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          assignedTo: value === "unassigned" ? "" : value,
                        })
                      }
                    >
                      <SelectTrigger id="assignedTo">
                        <SelectValue placeholder="Selecione um usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.length > 0 ? (
                          <>
                            <SelectItem value="unassigned">
                              Não atribuído
                            </SelectItem>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.username || user.email}
                              </SelectItem>
                            ))}
                          </>
                        ) : (
                          <SelectItem value="unassigned" disabled>
                            Nenhum usuário disponível
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </form>
        </div>

        <DialogFooter className="gap-2">
          {mode === "view" && !isEditing ? (
            <>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
              <div className="flex-1" />
              {task?.type === TaskType.TASK && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSubtaskDialog(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Criar Subtarefa
                </Button>
              )}
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  isEditingRef.current = true;
                  if (task) {
                    setFormData({
                      title: task.title,
                      description: task.description || "",
                      status: task.status,
                      assignedTo: task.assignedTo?.id || "",
                    });
                  }
                  setIsEditing(true);
                }}
              >
                Editar
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (mode === "view") {
                    isEditingRef.current = false;
                    setIsEditing(false);
                    if (task) {
                      setFormData({
                        title: task.title,
                        description: task.description || "",
                        status: task.status,
                        assignedTo: task.assignedTo?.id || "",
                      });
                    }
                  } else {
                    onOpenChange(false);
                  }
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" form={formId.current}>
                {mode === "create" ? "Criar Tarefa" : "Salvar Alterações"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>

      {task && (
        <TaskDialog
          open={showSubtaskDialog}
          onOpenChange={setShowSubtaskDialog}
          mode="create"
          parentTask={task}
          users={users}
          onCreate={onCreate}
        />
      )}

      {selectedSubtask && (
        <TaskDialog
          open={showSubtaskViewDialog}
          onOpenChange={handleSubtaskViewDialogClose}
          mode="view"
          task={selectedSubtask}
          users={users}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      )}
    </Dialog>
  );
}
