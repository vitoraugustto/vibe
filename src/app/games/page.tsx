import { games } from "@/games/manifest"
import { Card, Button } from "@/components"
import { LucideIcon, icons } from "lucide-react"
import Link from "next/link"

export default function GamesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Catálogo de Jogos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {games.length === 0 ? (
          <Card className="flex flex-col items-center justify-center h-40">
            <span className="text-muted-foreground">Nenhum jogo ainda</span>
          </Card>
        ) : (
          games.map((game) => {
            const Icon = (icons as Record<string, LucideIcon>)[game.icon] || icons['Gamepad']
            return (
              <Card key={game.slug} className="flex flex-col gap-4 p-4 items-center">
                <Icon className="size-8 mb-2" />
                <h2 className="text-lg font-semibold">{game.title}</h2>
                <p className="text-sm text-muted-foreground text-center">{game.description}</p>
                <Button asChild>
                  <Link href={`/games/${game.slug}`}>Jogar</Link>
                </Button>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
