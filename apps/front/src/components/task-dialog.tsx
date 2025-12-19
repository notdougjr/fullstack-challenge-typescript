"use client";

import { useState, useEffect } from "react";
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
import { Trash2, Calendar, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { TaskStatus, TaskType, type Task } from "@/lib/types";
import { getTaskStatusLabel } from "@/lib/task-utils";

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
  users?: User[];
  onCreate?: (task: Omit<Task, "id" | "createdAt">) => void;
  onUpdate?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskDialog({
  open,
  onOpenChange,
  mode,
  task,
  users = [],
  onCreate,
  onUpdate,
  onDelete,
}: TaskDialogProps) {
  const [isEditing, setIsEditing] = useState(mode === "create");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: TaskStatus.PENDING,
    assignedTo: "",
  });

  useEffect(() => {
    if (task && mode === "view") {
      setFormData({
        title: task.title,
        description: task.description || "",
        status: task.status,
        assignedTo: task.assignedTo || "",
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
    }
  }, [task, mode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create" && onCreate) {
      onCreate({
        ...formData,
        type: TaskType.TASK,
        createdBy: "current-user-id",
        assignedTo: formData.assignedTo || undefined,
      });
      onOpenChange(false);
      setFormData({
        title: "",
        description: "",
        status: TaskStatus.PENDING,
        assignedTo: "",
      });
    } else if (mode === "view" && task && onUpdate) {
      onUpdate({ ...task, ...formData });
      setIsEditing(false);
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (task && onDelete) {
      onDelete(task.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Criar Nova Tarefa"
              : isEditing
              ? "Editar Tarefa"
              : "Detalhes da Tarefa"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Preencha os detalhes da nova tarefa"
              : isEditing
              ? "Atualize as informações da tarefa"
              : "Visualize os detalhes completos da tarefa"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                        ? users.find((u) => u.id === task.assignedTo)
                            ?.username ||
                          users.find((u) => u.id === task.assignedTo)?.email ||
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
                      setFormData({ ...formData, description: e.target.value })
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
                <Button type="button" onClick={() => setIsEditing(true)}>
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
                      setIsEditing(false);
                    } else {
                      onOpenChange(false);
                    }
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {mode === "create" ? "Criar Tarefa" : "Salvar Alterações"}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
