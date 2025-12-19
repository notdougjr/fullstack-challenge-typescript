"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { KanbanBoard } from "@/components/kanban-board";
import { Button } from "@/components/ui/button";
import { Plus, LogOut } from "lucide-react";
import { logout } from "@/lib/api";
import { useTaskDialog } from "@/contexts/task-dialog-context";

export default function Home() {
  const router = useRouter();
  const { openCreateDialog } = useTaskDialog();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logout realizado com sucesso!");
      router.push("/login");
    } catch (error: any) {
      toast.error("Erro ao fazer logout");
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-card-foreground">
                Gerenciador de Projetos
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Tarefa
            </Button>
            <Button onClick={handleLogout} variant="outline" className="gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <KanbanBoard />
      </main>
    </div>
  );
}
