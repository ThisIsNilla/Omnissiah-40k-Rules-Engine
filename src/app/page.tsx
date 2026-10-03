"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Terminal, User, Cpu } from "lucide-react"
import { useChat } from "@ai-sdk/react"
import { useRef, useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"

export default function Home() {
  const { messages, status, sendMessage } = useChat()
  const [input, setInput] = useState("")
  
  const isLoading = status === 'submitted' || status === 'streaming'

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage({ role: 'user', parts: [{ type: 'text', text: input }] })
    setInput("")
  }

  return (
    <div className="flex flex-col absolute inset-0 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-primary" />
          <h1 className="font-semibold text-lg tracking-tight">11th Edition Rules</h1>
        </div>
        <div className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
          {isLoading ? "Consulting Databanks..." : "Status: Online"}
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0" ref={scrollRef}>
        <div className="max-w-3xl mx-auto flex flex-col gap-8">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 mt-24">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter text-primary">Awaiting Query</h2>
                <p className="text-muted-foreground max-w-[400px]">
                  Enter your rules conflict or inquiry below. The Omnispex will consult the sacred texts.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="border-border hover:border-primary hover:text-primary transition-colors"
                  onClick={() => sendMessage({ role: 'user', parts: [{ type: 'text', text: "Fights First vs Counter-Offensive" }] })}
                >
                  Fights First vs Counter-Offensive
                </Button>
                <Button 
                  variant="outline" 
                  className="border-border hover:border-primary hover:text-primary transition-colors"
                  onClick={() => sendMessage({ role: 'user', parts: [{ type: 'text', text: "Can I shoot after falling back?" }] })}
                >
                  Can I shoot after falling back?
                </Button>
              </div>
            </div>
          ) : (
            /* Message Feed */
            <div className="space-y-8 pb-10">
              {messages.map((m) => {
                // Safely extract text content regardless of Vercel AI SDK version
                let textContent = "";
                if (typeof (m as any).content === "string") {
                  textContent = (m as any).content;
                } else if (Array.isArray(m.parts)) {
                  textContent = m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join("\n");
                } else {
                  textContent = JSON.stringify(m);
                }

                return (
                  <div key={m.id} className="flex gap-4">
                    <div className="mt-1 flex-shrink-0">
                      {m.role === 'user' ? (
                        <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-secondary-foreground border border-border">
                          <User className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                          <Cpu className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="font-semibold text-sm text-muted-foreground tracking-wider uppercase">
                        {m.role === 'user' ? 'Command' : 'Omnispex'}
                      </div>
                      <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-secondary prose-pre:border prose-pre:border-border max-w-none text-foreground text-sm sm:text-base">
                        <ReactMarkdown>{textContent}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t border-border shrink-0">
        <div className="max-w-3xl mx-auto relative">
          <form onSubmit={handleSubmit}>
            <Input 
              value={input}
              onChange={handleInputChange}
              placeholder="Query the machine spirit..." 
              className="pl-4 pr-12 py-6 bg-card border-border focus-visible:ring-primary rounded-xl"
            />
            <Button 
              type="submit"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
