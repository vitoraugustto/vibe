import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@/components";
import { ShopManager } from "../shop";
import { useArenaStore } from "../state";
import { icons } from "lucide-react";
import { toast } from "sonner";

export function ShopCard() {
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

  const handleUseHealthPotion = () => {
    const result = store.useHealthPotion();
    switch (result) {
      case "ok":
        toast.success("Poção de vida usada!");
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
  const canBuyHealthPotion = ShopManager.canBuyItem("health_potion", inventory.health_potions, gold);

  return (
    <Card className="bg-slate-900/60 border-slate-700/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-200 flex items-center gap-2">
          <icons.ShoppingBag className="size-4 text-amber-400" />
          Loja
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Inventário compacto */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-slate-300">Inventário</h4>
          <div className="flex items-center justify-between p-2 rounded border border-slate-600/40 bg-slate-800/40">
            <div className="flex items-center gap-2">
              <span className="text-sm">{healthPotionItem.icon}</span>
              <span className="text-xs text-slate-300">{healthPotionItem.name}</span>
              <Badge variant="secondary" className="h-5 px-2 text-xs bg-slate-700/60 text-slate-200">
                {inventory.health_potions}
              </Badge>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="h-6 px-2 text-xs bg-green-600/80 hover:bg-green-500/90 border-green-500/40"
              disabled={inventory.health_potions === 0}
              onClick={handleUseHealthPotion}
            >
              Usar
            </Button>
          </div>
        </div>

        {/* Item da loja compacto */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-slate-300">Comprar</h4>
          <div className="flex items-center justify-between p-2 rounded border border-slate-600/40 bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-sm">{healthPotionItem.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-slate-200 truncate">{healthPotionItem.name}</div>
                <div className="text-xs text-slate-400 truncate">{healthPotionItem.description}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 text-xs font-medium text-amber-400">
                <icons.Coins className="size-3" />
                {healthPotionItem.price}
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="h-6 px-2 text-xs bg-amber-600/80 hover:bg-amber-500/90 border-amber-500/40"
                disabled={!canBuyHealthPotion}
                onClick={() => handleBuyItem("health_potion")}
              >
                Comprar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
