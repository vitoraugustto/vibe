"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Badge,
} from "@/components";
import { icons } from "lucide-react";
import { HeroClassManager, type ClassId } from "@/games/fighter-arena/classes";

// Função utilitária para obter o ícone de uma classe
export function getClassIcon(heroClassId: ClassId): keyof typeof icons {
  const classInfo = HeroClassManager.getClass(heroClassId);
  return (classInfo?.icon || "Sword") as keyof typeof icons;
}

// Função utilitária para obter a cor de uma classe
export function getClassColor(heroClassId: ClassId): string {
  const classInfo = HeroClassManager.getClass(heroClassId);
  return classInfo?.color || "text-orange-400";
}

export type ClassSelectionModalProps = {
  open: boolean;
  onSelectClass: (heroClass: ClassId) => void;
  currentClass?: ClassId;
};

export function ClassSelectionModal({
  open,
  onSelectClass,
  currentClass,
}: ClassSelectionModalProps) {
  const handleSelectClass = (heroClass: ClassId) => {
    onSelectClass(heroClass);
  };

  const heroClasses = HeroClassManager.getAllClasses();

  return (
    <Dialog open={open} onOpenChange={() => {}} modal>
      <DialogContent
        showCloseButton={false}
        className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl lg:max-w-5xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto p-2 sm:p-4"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <icons.Users className="size-4 sm:size-5 text-muted-foreground" />
            Escolha sua Classe
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Selecione uma classe para seu herói. Cada classe tem características
            únicas que afetam seu estilo de jogo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 py-2 sm:py-3">
          {heroClasses.map((classInfo) => {
            const IconComponent =
              icons[classInfo.icon as keyof typeof icons] || icons.User;
            const isSelected = currentClass === classInfo.id;

            return (
              <div
                key={classInfo.id}
                className={`
                  relative rounded-lg p-2 sm:p-3 border-2 cursor-pointer transition-all duration-200 
                  hover:scale-[1.02] active:scale-[0.98] touch-manipulation
                  ${
                    isSelected
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : "border-muted hover:border-muted-foreground/50 bg-background/60"
                  }
                `}
                onClick={() => handleSelectClass(classInfo.id)}
              >
                {isSelected && (
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                    <Badge className="bg-primary text-primary-foreground text-xs px-1 py-0.5 sm:px-2 sm:py-1">
                      <icons.Check className="size-2 sm:size-3 mr-0.5 sm:mr-1" />
                      <span className="hidden sm:inline">Atual</span>
                      <span className="sm:hidden">✓</span>
                    </Badge>
                  </div>
                )}

                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <div
                    className={`p-1 sm:p-1.5 rounded-full bg-muted/50 ${classInfo.color} shrink-0`}
                  >
                    <IconComponent className="size-3 sm:size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-xs sm:text-base truncate">
                      {classInfo.name}
                    </h3>
                  </div>
                </div>

                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2 leading-relaxed">
                  {classInfo.description}
                </p>

                <div className="space-y-0.5 sm:space-y-1">
                  <h4 className="text-[9px] sm:text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                    Especialidades:
                  </h4>
                  <ul className="space-y-0.5">
                    {classInfo.strengths.map((strength, index) => (
                      <li
                        key={index}
                        className="text-[9px] sm:text-[10px] flex items-center gap-0.5 sm:gap-1"
                      >
                        <icons.Star className="size-1.5 sm:size-2 text-yellow-400 fill-yellow-400 shrink-0" />
                        <span className="truncate">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ClassSelectionModal;
