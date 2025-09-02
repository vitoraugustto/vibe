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
      <DialogContent showCloseButton={false} className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <icons.Skull className="size-5 text-muted-foreground" /> Você caiu em batalha
          </DialogTitle>
          <DialogDescription>
            Reiniciar recomeça tudo do zero. Você perderá progresso, ouro e gemas.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Fechar</Button>
          <Button onClick={onRestart}>Reiniciar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default GameOverModal;
