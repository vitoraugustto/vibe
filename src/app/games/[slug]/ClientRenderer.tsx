"use client"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Button } from "@/components"

export default function ClientRenderer({ slug }: { slug: string }) {
  const Game = dynamic(() => import(`@/games/${slug}/Game`), { ssr: false })
  return (
    <div className="container mx-auto py-8 flex flex-col items-center gap-6">
      <Game />
      <Button asChild>
        <Link href="/games">Voltar aos jogos</Link>
      </Button>
    </div>
  )
}
