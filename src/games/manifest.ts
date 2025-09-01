import { gameMeta as genericClicker } from "@/games/generic-clicker/meta";

export type GameMeta = {
  slug: string;
  title: string;
  description: string;
  icon: string; // nome do ícone do lucide-react
  version: number;
};

export const games = [genericClicker];
