import { gameMeta as genericClicker } from "@/games/generic-clicker/meta";
import { gameMeta as fighterArena } from "@/games/fighter-arena/meta"; // mantenha imports existentes de outros jogos, se houver

export type GameMeta = {
  slug: string;
  title: string;
  description: string;
  icon: string; // nome do ícone do lucide-react
  version: number;
};

export const games = [
  genericClicker,
  // ...outros metas,
  fighterArena,
];
