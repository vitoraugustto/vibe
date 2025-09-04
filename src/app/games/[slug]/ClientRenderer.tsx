"use client"
import dynamic from "next/dynamic"

export default function ClientRenderer({ slug }: { slug: string }) {
  const Game = dynamic(() => import(`@/games/${slug}/Game`), { ssr: false })
  return (
    <div className="w-full min-h-[100svh] flex flex-col">
      <Game />
    
    </div>
  )
}
