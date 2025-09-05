export type ShopItemId = "health_potion";

export interface ShopItem {
  id: ShopItemId;
  name: string;
  description: string;
  icon: string;
  price: number;
  maxQuantity?: number;
  category: "consumables" | "equipment" | "misc";
}

export interface PlayerInventory {
  health_potions: number;
}

export class ShopManager {
  private static items: Record<ShopItemId, ShopItem> = {
    health_potion: {
      id: "health_potion",
      name: "Poção de Vida",
      description: "Restaura 50% da vida máxima",
      icon: "🧪",
      price: 25,
      maxQuantity: 5,
      category: "consumables",
    },
  };

  static getItem(id: ShopItemId): ShopItem {
    return this.items[id];
  }

  static getAllItems(): ShopItem[] {
    return Object.values(this.items);
  }

  static getItemsByCategory(category: ShopItem["category"]): ShopItem[] {
    return this.getAllItems().filter(item => item.category === category);
  }

  static canBuyItem(itemId: ShopItemId, currentQuantity: number, gold: number): boolean {
    const item = this.getItem(itemId);
    if (!item) return false;
    
    // Verifica se tem ouro suficiente
    if (gold < item.price) return false;
    
    // Verifica limite de quantidade se existir
    if (item.maxQuantity && currentQuantity >= item.maxQuantity) return false;
    
    return true;
  }

  static useHealthPotion(currentHp: number, maxHp: number): number {
    const healAmount = Math.floor(maxHp * 0.5);
    return Math.min(currentHp + healAmount, maxHp);
  }
}
