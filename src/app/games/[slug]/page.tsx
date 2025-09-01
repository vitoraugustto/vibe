import { games } from "@/games/manifest"
import { Card, Button } from "@/components"
import ClientRenderer from "./ClientRenderer"
import Link from "next/link"

export default function GameSlugPage({ params }: { params: { slug: string } }) {
  const game = games.find(g => g.slug === params.slug)

  if (!game) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Card className="flex flex-col items-center gap-4 p-8">
          <h2 className="text-xl font-bold">Jogo não encontrado</h2>
          <Button asChild>
            <Link href="/games">Voltar aos jogos</Link>
          </Button>
        </Card>
      </div>
    )
  }

  return <ClientRenderer slug={params.slug} />
}
