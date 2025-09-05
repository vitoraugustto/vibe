import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
} from "@/components";
import { ShopManager } from "../shop";
import { useArenaStore } from "../state";
import { icons } from "lucide-react";
import { toast } from "sonner";

export type ShopModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ShopModal({ open, onClose }: ShopModalProps) {
  const store = useArenaStore();
  const { gold, inventory, buyItem } = store;

  const handleBuyItem = (itemId: "health_potion") => {
    const result = buyItem(itemId);
    switch (result) {
      case "ok":
        toast.success("Item comprado com sucesso!");
        break;
      case "no-gold":
        toast.error("Ouro insuficiente!");
        break;
      case "max-quantity":
        toast.error("Quantidade máxima atingida!");
        break;
      case "invalid":
        toast.error("Item inválido!");
        break;
    }
  };

  const healthPotionItem = ShopManager.getItem("health_potion");
  const canBuyHealthPotion = ShopManager.canBuyItem("health_potion", inventory.health_potions, gold);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-400">
            <icons.ShoppingBag className="size-5" />
            Loja do Comerciante
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do jogador */}
          <div className="flex items-center justify-between p-3 rounded border border-slate-600/40 bg-slate-800/40">
            <span className="text-sm text-slate-300">Seu ouro:</span>
            <div className="flex items-center gap-1 text-lg font-bold text-amber-400">
              <icons.Coins className="size-4" />
              {gold}
            </div>
          </div>

          {/* Itens da loja */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-200">Consumíveis Disponíveis</h3>
            
            <div className="border border-slate-600/40 rounded-lg p-4 bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{healthPotionItem.icon}</span>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-200">{healthPotionItem.name}</h4>
                    <div className="flex items-center gap-1 text-amber-400 font-medium">
                      <icons.Coins className="size-4" />
                      {healthPotionItem.price}
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-400 mb-3">{healthPotionItem.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      Máximo: {healthPotionItem.maxQuantity} | Você tem: {inventory.health_potions}
                    </div>
                    
                    <Button
                      size="sm"
                      className="bg-amber-600/80 hover:bg-amber-500/90 border-amber-500/40"
                      disabled={!canBuyHealthPotion}
                      onClick={() => handleBuyItem("health_potion")}
                    >
                      Comprar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-700/50">
            💡 Mais itens serão adicionados em breve!
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
