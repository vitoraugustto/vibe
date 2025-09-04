"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components";
import { icons } from "lucide-react";

export type GameOverModalProps = {
  open: boolean;
  onRestart: () => void;
};

export function GameOverModal({ open, onRestart }: GameOverModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}} modal>
      <DialogContent
        showCloseButton={false}
        className="max-w-[90vw] sm:max-w-sm p-4 sm:p-6"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <icons.Skull className="size-4 sm:size-5 text-muted-foreground" />
            Você caiu em batalha
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm leading-relaxed">
            Escolha uma nova classe para reiniciar sua jornada. Todo progresso
            será perdido.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-6">
          <Button onClick={onRestart} className="w-full">
            Escolher Classe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default GameOverModal;
