"use client";

import { Plus } from "lucide-react";
import { Button } from "./ui/button";

export function AppHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-card-foreground">
              Task Manager
            </h1>
          </div>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">Board</span>
        </div>
        <Button
          onClick={() => {
            // setIsCreateDialogOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </div>
    </header>
  );
}
