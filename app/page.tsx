"use client"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import MessageFeed from "@/app/components/message-feed"
import StatsTicker from "@/app/components/stats-ticker"

export default function BoomScrollLanding() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950 overflow-hidden">
      <main className="flex flex-col md:flex-row flex-1">
        {/* Left Side: Message Feed */}
        <div className="w-full md:w-1/2 border-r border-indigo-900/0">
          <MessageFeed />
        </div>

        {/* Right Side: The Pitch */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h1 className="text-6xl md:text-8xl font-bold">
              <span className="text-4xl md:text-6xl bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 text-transparent bg-clip-text">
                Blah Blah
              </span>
              <br />
              <motion.span
                className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 text-transparent bg-clip-text"
                animate={{
                  scale: [1, 1.05, 1],
                  textShadow: [
                    "0 0 5px rgba(255,100,50,0.3)",
                    "0 0 15px rgba(255,100,50,0.7)",
                    "0 0 5px rgba(255,100,50,0.3)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              >
                BOOM!
              </motion.span>
            </h1>

            <p className="text-lg text-indigo-200 max-w-md mx-auto">
              Send self-destructing messages that vanish forever or pay to reveal secrets before they explode.
            </p>

            <Button
              size="lg"
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white border-none text-xl px-10 py-6 h-auto"
            >
              Bla Bla
            </Button>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-indigo-950/50 backdrop-blur-sm py-3 border-t border-indigo-800/50">
        <StatsTicker />
      </footer>
    </div>
  )
}

