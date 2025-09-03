"use client";

import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components";
import { icons } from "lucide-react";

export type GameOverModalProps = {
  open: boolean;
  onClose: () => void;
  onRestart: () => void;
};

export function GameOverModal({ open, onClose, onRestart }: GameOverModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent showCloseButton={false} className="max-w-[90vw] sm:max-w-sm p-4 sm:p-6">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <icons.Skull className="size-4 sm:size-5 text-muted-foreground" /> 
            Você caiu em batalha
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm leading-relaxed">
            Escolha uma nova classe para reiniciar sua jornada. Todo progresso será perdido.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 pt-4">
          <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
            Fechar
          </Button>
          <Button onClick={onRestart} className="w-full sm:w-auto order-1 sm:order-2">
            Escolher Classe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default GameOverModal;
