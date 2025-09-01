"use client"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Button } from "@/components"

export default function ClientRenderer({ slug }: { slug: string }) {
  const Game = dynamic(() => import(`@/games/${slug}/Game`), { ssr: false })
  return (
    <div className="w-full min-h-[100svh] flex flex-col">
      <Game />
      <div className="w-full px-4 py-4 flex justify-center">
        <Button asChild>
          <Link href="/games">Voltar aos jogos</Link>
        </Button>
      </div>
    </div>
  )
}
