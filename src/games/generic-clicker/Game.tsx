"use client";
import { Card, Button } from "@/components";
import { useGenericStore } from "./state";

export default function Game() {
  const { points, tap } = useGenericStore();

  return (
    <div className="container mx-auto py-8 flex flex-col items-center gap-8">
      <h1 className="text-2xl font-bold">Generic Clicker</h1>
      <Card className="w-full max-w-sm flex flex-col items-center gap-4 p-8">
        <div className="text-4xl font-bold text-primary">Points: {points}</div>
        <Button size="lg" className="w-full text-xl py-6" onClick={() => tap(Date.now())}>
          Tap!
        </Button>
        <div className="text-sm text-muted-foreground">Crit chance 10% · x2</div>
      </Card>
    </div>
  );
}
