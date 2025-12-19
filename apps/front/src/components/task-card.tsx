"use client";

import type { Task } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onDragStart: (task: Task) => void;
  onClick: (task: Task) => void;
}

export function TaskCard({ task, onDragStart, onClick }: TaskCardProps) {
  const initials = task.assignedTo
    ? task.assignedTo.substring(0, 2).toUpperCase()
    : "?";

  return (
    <Card
      draggable
      onDragStart={() => onDragStart(task)}
      onClick={() => onClick(task)}
      className="group cursor-pointer border-border bg-card p-4 transition-all hover:shadow-md hover:ring-2 hover:ring-primary/50"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium leading-tight text-card-foreground line-clamp-2">
            {task.title}
          </h4>
        </div>

        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {task.createdAt && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {task.createdAt.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })}
              </div>
            )}
          </div>
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </Card>
  );
}
