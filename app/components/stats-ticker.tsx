"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

// Sample stats data
const sampleStats = [
  "Vault #672 blasted for 1 SOL—3k views!",
  "User @cryptokitty peeked 5 messages today",
  "Message #1337 exploded with 42 witnesses",
  "Vault #420 earned 6.9 SOL this week",
  "New record: 12 simultaneous booms!",
  "User @satoshi just created a 10 SOL message",
  "Vault #888 blasted for 2.5 SOL—10k views!",
  "Message #2048 survived for 3 days before boom",
  "User @vitalik peeked 3 messages in 1 minute",
  "Total platform booms: 31,415 and counting",
]

export default function StatsTicker() {
  const [stats, setStats] = useState(sampleStats)

  // Rotate stats every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prevStats) => {
        const newStats = [...prevStats]
        const first = newStats.shift()
        if (first) newStats.push(first)
        return newStats
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full overflow-hidden">
      <motion.div
        animate={{ x: [0, -100, -200, -300, -400, -500, -600, -700, -800, -900, -1000] }}
        transition={{
          duration: 30,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex whitespace-nowrap"
      >
        {stats.concat(stats).map((stat, index) => (
          <div key={index} className="inline-block px-8 text-indigo-300">
            <span className="mr-4">•</span>
            {stat}
            <span className="ml-4">•</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

