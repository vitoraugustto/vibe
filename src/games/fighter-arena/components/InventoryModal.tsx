import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Badge,
} from "@/components";
import { ShopManager } from "../shop";
import { useArenaStore } from "../state";
import { icons } from "lucide-react";
import { toast } from "sonner";

export type InventoryModalProps = {
  open: boolean;
  onClose: () => void;
};

export function InventoryModal({ open, onClose }: InventoryModalProps) {
  const store = useArenaStore();
  const { inventory } = store;

  const handleUseHealthPotion = () => {
    const result = store.useHealthPotion();
    switch (result) {
      case "ok":
        toast.success("Poção de vida usada! +50% HP");
        break;
      case "no-potions":
        toast.error("Você não tem poções!");
        break;
      case "full-hp":
        toast.error("Vida já está cheia!");
        break;
    }
  };

  const healthPotionItem = ShopManager.getItem("health_potion");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-400">
            <icons.Package className="size-5" />
            Inventário
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Consumíveis */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-200 flex items-center gap-2">
              <icons.Zap className="size-4" />
              Consumíveis
            </h3>
            
            {inventory.health_potions > 0 ? (
              <div className="border border-slate-600/40 rounded-lg p-4 bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{healthPotionItem.icon}</span>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-slate-200">{healthPotionItem.name}</h4>
                      <Badge variant="secondary" className="bg-emerald-600/20 text-emerald-400 border-emerald-500/30">
                        {inventory.health_potions}x
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-slate-400 mb-3">{healthPotionItem.description}</p>
                    
                    <Button
                      size="sm"
                      className="w-full bg-emerald-600/80 hover:bg-emerald-500/90 border-emerald-500/40"
                      onClick={handleUseHealthPotion}
                    >
                      <icons.Heart className="size-4 mr-2" />
                      Usar Poção
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <icons.Package className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum consumível no inventário</p>
                <p className="text-xs">Visite a loja para comprar itens!</p>
              </div>
            )}
          </div>

          {/* Seção para futuras expansões */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-200 flex items-center gap-2">
              <icons.Sword className="size-4" />
              Equipamentos
            </h3>
            
            <div className="text-center py-6 text-slate-500 border border-slate-700/50 rounded-lg bg-slate-900/30">
              <icons.Wrench className="size-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Em desenvolvimento</p>
              <p className="text-xs">Equipamentos virão em breve!</p>
            </div>
          </div>

          {/* Estatísticas do inventário */}
          <div className="pt-2 border-t border-slate-700/50">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs text-slate-500">Total de itens</p>
                <p className="text-lg font-bold text-slate-300">{inventory.health_potions}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Slots usados</p>
                <p className="text-lg font-bold text-slate-300">1/20</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
