"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Eye, Bomb, Zap } from "lucide-react"

// Message types
type MessageStatus = "scrolling" | "peeking" | "blasting" | "booming" | "destroyed"

interface Message {
  id: number
  encryptedText: string
  decryptedText: string
  timeLeft: number
  peekPrice: number
  blastPrice: number
  status: MessageStatus
}

// Generate random encrypted-looking text
const generateEncryptedText = (length: number) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}|:<>?~`-=[]\\;',./"
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("")
}

// Sample messages
const sampleDecryptedTexts = [
  "I saw him at the club last night...",
  "Don't tell anyone but I'm planning to...",
  "The password for the account is...",
  "I can't believe she said that about...",
  "Meet me at the secret location...",
  "The surprise party is scheduled for...",
  "I've been hiding this for years but...",
  "The real reason I left was because...",
  "No one knows this but I actually...",
  "The truth about the incident is...",
]

// Generate initial messages
const generateInitialMessages = (count: number): Message[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    encryptedText: generateEncryptedText(30),
    decryptedText: sampleDecryptedTexts[Math.floor(Math.random() * sampleDecryptedTexts.length)],
    timeLeft: Math.floor(Math.random() * 60) + 10, // Changed from 180+30 to 60+10 for shorter lifespans
    peekPrice: Math.random() < 0.5 ? 0.1 : 0.2,
    blastPrice: Math.random() < 0.5 ? 1 : 2,
    status: "scrolling",
  }))
}

export default function MessageFeed() {
  const [messages, setMessages] = useState<Message[]>(generateInitialMessages(20))
  const [lastId, setLastId] = useState(20)
  const feedRef = useRef<HTMLDivElement>(null)

  // Update timers and add new messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessages((prevMessages) => {
        // Update existing messages
        const updatedMessages = prevMessages.map((msg) => {
          if (msg.status === "scrolling" || msg.status === "peeking" || msg.status === "blasting") {
            const newTimeLeft = msg.timeLeft - 3 // Decrease by 3 instead of 1 to make booms happen 3x faster

            // Check if time is up
            if (newTimeLeft <= 0 && msg.status === "scrolling") {
              return { ...msg, timeLeft: 0, status: "booming" }
            }

            return { ...msg, timeLeft: Math.max(0, newTimeLeft) }
          }
          return msg
        })

        // Remove messages that have been destroyed or scrolled off
        const filteredMessages = updatedMessages.filter((msg) => !(msg.status === "destroyed" || msg.id < lastId - 30))

        // Add new message
        const newId = lastId + 1
        const newMessage: Message = {
          id: newId,
          encryptedText: generateEncryptedText(30),
          decryptedText: sampleDecryptedTexts[Math.floor(Math.random() * sampleDecryptedTexts.length)],
          timeLeft: Math.floor(Math.random() * 60) + 10, // Changed from 180+30 to 60+10
          peekPrice: Math.random() < 0.5 ? 0.1 : 0.2,
          blastPrice: Math.random() < 0.5 ? 1 : 2,
          status: "scrolling",
        }

        setLastId(newId)

        return [...filteredMessages, newMessage]
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [lastId])

  // Randomly trigger peek and blast animations
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setMessages((prevMessages) => {
        const scrollingMessages = prevMessages.filter((msg) => msg.status === "scrolling")

        if (scrollingMessages.length === 0) return prevMessages

        // Randomly select a message to animate
        const randomIndex = Math.floor(Math.random() * scrollingMessages.length)
        const targetMessage = scrollingMessages[randomIndex]

        // Decide between peek and blast (70% peek, 30% blast)
        const animationType = Math.random() < 0.7 ? "peeking" : "blasting"

        return prevMessages.map((msg) => (msg.id === targetMessage.id ? { ...msg, status: animationType } : msg))
      })
    }, 1667) // Changed from 5000ms to 1667ms (approximately 5000/3)

    return () => clearInterval(animationInterval)
  }, [])

  // Reset message status after animation
  useEffect(() => {
    const resetInterval = setInterval(() => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (msg.status === "peeking") {
            return { ...msg, status: "scrolling" }
          } else if (msg.status === "blasting") {
            return { ...msg, status: "scrolling" }
          } else if (msg.status === "booming") {
            return { ...msg, status: "destroyed" }
          }
          return msg
        }),
      )
    }, 3000) // Reset after 3 seconds

    return () => clearInterval(resetInterval)
  }, [])

  return (
    <div ref={feedRef} className="h-full overflow-hidden relative py-8 px-6 m-4">
      <div className="absolute inset-4 flex flex-col space-y-4 animate-scroll">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{
                opacity: message.status === "destroyed" ? 0 : 1,
                y: 0,
                x: message.status === "booming" ? [-5, 5, -5, 5, 0] : 0,
              }}
              exit={{ opacity: 0, scale: message.status === "booming" ? 1.2 : 0.8 }}
              transition={{
                duration: message.status === "booming" ? 0.5 : 0.3,
                type: message.status === "booming" ? "spring" : "tween",
              }}
              className="w-full"
            >
              <Card
                className={`
                  p-4 border relative overflow-hidden
                  ${
                    message.status === "peeking"
                      ? "border-blue-400 bg-indigo-900/60"
                      : message.status === "blasting"
                        ? "border-pink-400 bg-indigo-900/60"
                        : message.status === "booming"
                          ? "border-red-500 bg-red-900/60"
                          : "border-indigo-800 bg-indigo-950/60"
                  }
                `}
              >
                {/* Background glow effect */}
                <div
                  className={`
                  absolute inset-0 opacity-30
                  ${
                    message.status === "peeking"
                      ? "bg-blue-500"
                      : message.status === "blasting"
                        ? "bg-pink-500"
                        : message.status === "booming"
                          ? "bg-red-500"
                          : "bg-transparent"
                  }
                `}
                />

                {/* Message content */}
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-mono w-4/5 overflow-hidden">
                      {message.status === "peeking" ? (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-blue-300">
                          {message.decryptedText}
                        </motion.span>
                      ) : message.status === "blasting" ? (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-pink-300">
                          {message.decryptedText}
                        </motion.span>
                      ) : message.status === "booming" ? (
                        <motion.span initial={{ scale: 1 }} animate={{ scale: [1, 1.2, 0.8] }} className="text-red-300">
                          Lost Forever!
                        </motion.span>
                      ) : (
                        <span className="text-indigo-300">{message.encryptedText}</span>
                      )}
                    </div>

                    {message.status === "booming" ? (
                      <motion.div
                        animate={{
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{ duration: 0.5, repeat: 2 }}
                      >
                        <Bomb className="text-red-400 h-5 w-5" />
                      </motion.div>
                    ) : (
                      <div className="flex space-x-2">
                        <div className="flex items-center text-xs text-blue-300">
                          <Eye className="h-3 w-3 mr-1" />
                          <span>{message.peekPrice} SOL</span>
                        </div>
                        <div className="flex items-center text-xs text-pink-300">
                          <Zap className="h-3 w-3 mr-1" />
                          <span>{message.blastPrice} SOL</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timer bar */}
                  <div className="w-full bg-indigo-900/50 h-1 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${
                        message.status === "booming"
                          ? "bg-red-500"
                          : message.status === "peeking"
                            ? "bg-blue-500"
                            : message.status === "blasting"
                              ? "bg-pink-500"
                              : "bg-indigo-500"
                      }`}
                      style={{
                        width: `${(message.timeLeft / 210) * 100}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between mt-1 text-xs">
                    <span
                      className={`
                      ${
                        message.status === "booming"
                          ? "text-red-300"
                          : message.status === "peeking"
                            ? "text-blue-300"
                            : message.status === "blasting"
                              ? "text-pink-300"
                              : "text-indigo-300"
                      }
                    `}
                    >
                      {message.status === "booming"
                        ? "BOOM!"
                        : `${Math.floor(message.timeLeft / 60)}:${(message.timeLeft % 60).toString().padStart(2, "0")} left to boom`}
                    </span>
                  </div>
                </div>

                {/* Animation effects */}
                {message.status === "blasting" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="text-lg font-bold text-pink-300">went BOOM!</div>
                  </motion.div>
                )}

                {message.status === "booming" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.5, 0] }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-red-500 opacity-70 blur-md" />
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

