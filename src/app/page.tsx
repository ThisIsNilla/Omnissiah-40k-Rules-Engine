
"use client"

import { useChat } from "@ai-sdk/react"
import { useRef, useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"

export default function Home() {
  const { messages, status, sendMessage } = useChat()
  const [input, setInput] = useState("")
  const [factions, setFactions] = useState<string[]>([])
  
  const isLoading = status === 'submitted' || status === 'streaming'
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/rulebooks')
      .then(res => res.json())
      .then(data => setFactions(data.factions || []))
      .catch(console.error)
  }, [])

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
    <>
      {/* MasterHeader */}
      <header className="h-14 border-b border-grim-border bg-grim-obsidian/95 backdrop-blur flex items-center justify-between px-4 z-30 shrink-0 relative" data-purpose="app-masthead">
        {/* Brand / Insignia */}
        <div className="flex items-center space-x-3.5">
          {/* Mechanicus Cog Icon */}
          <div className="relative w-8 h-8 rounded-full border border-grim-gold/60 flex items-center justify-center bg-grim-plate/80 shadow-gold-subtle group cursor-pointer">
            <svg className="w-5 h-5 text-grim-gold group-hover:rotate-45 transition-transform duration-700 ease-out" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-grim-crimson animate-ping"></span>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-grim-crimson"></span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="font-gothic font-bold text-grim-gold text-lg tracking-wider">OMNISSIAH</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-grim-border/50 text-grim-goldLow font-mono tracking-tighter uppercase border border-grim-border">M41.026.REL</span>
            </div>
            <span className="text-[10px] text-gray-500 tracking-widest font-mono uppercase">TACTICAL RULES ENGINE // LINGUA-TECHNIS VERIFIED</span>
          </div>
        </div>

        {/* Center System Status Badges */}
        <div className="hidden md:flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-2 px-3 py-1 bg-grim-plate/60 border border-grim-border rounded-sm">
            <span className="text-grim-gold font-gothicDeco text-sm">&gt;_</span>
            <span className="text-gray-300 font-medium">10th / 11th Concordance</span>
            <span className="text-[10px] bg-grim-gold/10 text-grim-gold border border-grim-gold/30 px-1 py-0.5 rounded">ERRATA ACTIVE</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <span className="h-2 w-2 rounded-full bg-grim-emerald animate-pulse"></span>
            <span className="text-[11px]"><strong className="text-gray-200">SPIRITUS:</strong> {isLoading ? "COGITATING..." : "AWAKE & VIGILANT"}</span>
          </div>
        </div>

        {/* Right Telemetry & Stats */}
        <div className="flex items-center space-x-3 text-xs ml-4">
          <div className="hidden lg:flex items-center space-x-4 text-[11px] text-gray-400 font-mono shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-gothic font-bold text-grim-gold text-lg leading-none">{factions.length + 3}</span>
              <div className="flex flex-col text-[9px] uppercase tracking-widest text-gray-400 leading-tight select-none">
                <span className="">Sacred</span>
                <span className="">Codices</span>
              </div>
            </div>
            <span className="text-grim-border">|</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-grim-emerald animate-pulse"></span>
              <span className="text-grim-emerald tracking-wide text-[10px] font-bold">STATUS: OPTIMAL</span>
            </div>
          </div>
          <button className="px-2.5 py-1 text-[11px] border border-grim-crimson/50 text-grim-crimsonBright bg-grim-crimson/10 hover:bg-grim-crimson/20 rounded transition font-mono tracking-wide flex items-center space-x-1.5" title="Purge local cache and reset Machine Spirit" onClick={() => window.location.reload()}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            <span className="hidden sm:inline">PURGE CACHE</span>
          </button>
        </div>
      </header>

      {/* MasterLayoutBody */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LeftSidebar */}
        <aside className="w-80 md:w-84 border-r border-grim-border bg-[#090b0e] flex flex-col shrink-0 z-20">
          <div className="p-3.5 border-b border-grim-border bg-grim-obsidian">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-gothic tracking-widest text-grim-gold uppercase flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-grim-gold" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path></svg>
                Sacred Codices
              </span>
              <span className="text-[10px] text-gray-500 font-mono">INDEXED: 100%</span>
            </div>
            <div className="relative">
              <input className="w-full bg-grim-plate/90 border border-grim-border rounded px-2.5 py-1.5 text-xs text-grim-parchment placeholder-gray-600 focus:outline-none focus:border-grim-gold/70 focus:ring-1 focus:ring-grim-gold/30 font-mono transition" placeholder="Search Munitorum indexes..." type="text" />
              <span className="absolute right-2.5 top-2 text-[10px] text-gray-500 font-mono">⌘K</span>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto p-2 space-y-4 text-xs font-mono">
            <div>
              <div className="px-2 py-1 text-[10px] uppercase text-grim-goldLow font-semibold tracking-wider flex items-center justify-between">
                <span>Core Imperatives & Rules</span>
                <span className="text-[9px] text-gray-600">3 VOLUMES</span>
              </div>
              <div className="mt-1 space-y-0.5">
                <a className="flex items-center justify-between px-2 py-1.5 rounded bg-grim-gold/10 border-l-2 border-grim-gold text-grim-goldBright transition" href="#">
                  <div className="flex items-center space-x-2 truncate">
                    <svg className="w-3.5 h-3.5 text-grim-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                    <span className="truncate">Core Rules Concordance v1.4</span>
                  </div>
                  <span className="text-[9px] px-1 rounded bg-grim-obsidian text-grim-gold border border-grim-gold/30 shrink-0">MASTER</span>
                </a>
              </div>
            </div>
            <div>
              <div className="px-2 py-1 text-[10px] uppercase text-grim-goldLow font-semibold tracking-wider flex items-center justify-between">
                <span>Ingested Faction Indexes</span>
                <span className="text-[9px] text-gray-600">{factions.length} REGISTERED</span>
              </div>
              <div className="mt-1 space-y-0.5">
                {factions.map(faction => (
                  <a key={faction} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-grim-plate/60 text-gray-300 hover:text-gray-100 transition group" href="#">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="text-amber-500/80 group-hover:text-grim-gold">◈</span>
                      <span className="truncate">{faction}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </nav>
          <div className="p-3 border-t border-grim-border bg-grim-obsidian/90 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded border border-grim-gold/40 bg-grim-plate flex items-center justify-center text-grim-gold font-gothicDeco text-xs font-bold">M</div>
              <div className="flex flex-col">
                <span className="text-[11px] text-gray-200 font-mono tracking-tight">MAGOS LOGIS // DELTA-9</span>
                <span className="text-[9px] text-grim-goldLow font-mono">AUTH: LEVEL-V CRIMSON SEAL</span>
              </div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 ring-2 ring-emerald-500/20" title="Neural-Link Synchronized"></div>
          </div>
        </aside>

        {/* MainContentCanvas */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-grim-obsidian telemetry-grid">
          <div className="absolute inset-0 scanlines pointer-events-none opacity-40 z-10"></div>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-grim-gold/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Chat Feed / Welcome Area */}
          <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center justify-between relative z-10" ref={scrollRef}>
            <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-start pb-8">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center my-auto">
                  <div className="mb-4 text-grim-gold/40 flex justify-center">
                    <svg className="w-16 h-16 opacity-75" fill="currentColor" viewBox="0 0 100 100">
                      <path d="M50 5 L58 17 L72 12 L75 26 L89 27 L86 41 L98 47 L90 59 L99 69 L88 76 L92 90 L78 91 L76 104 L62 99 L50 110 L38 99 L24 104 L22 91 L8 90 L12 76 L1 69 L10 59 L2 47 L14 41 L11 27 L25 26 L28 12 L42 17 Z" fill="none" stroke="currentColor" strokeWidth="2"></path>
                      <circle cx="50" cy="50" fill="none" r="28" stroke="currentColor" strokeWidth="2"></circle>
                      <path d="M50 30 v40 M30 50 h40" stroke="currentColor" strokeWidth="1.5"></path>
                      <circle cx="50" cy="50" fill="#050608" r="10" stroke="currentColor" strokeWidth="2"></circle>
                    </svg>
                  </div>
                  <div className="text-center space-y-3 mb-8 max-w-2xl">
                    <h1 className="font-gothic text-3xl md:text-4xl text-grim-gold tracking-widest uppercase drop-shadow">Awaiting Tactical Query</h1>
                    <p className="text-xs md:text-sm text-gray-400 font-mono leading-relaxed">
                      Enter rules conflicts, sequencing disputes, or datasheet interactions. The Omnispex consults 42 canon texts, balance dataslates, and holy designer commentary.
                    </p>
                  </div>
                  <div className="w-full max-w-2xl space-y-2.5 mb-8">
                    <div className="text-[10px] uppercase font-mono tracking-widest text-grim-goldLow text-center mb-1">
                      — Frequent Tactical Inquiries —
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <button onClick={() => sendMessage({ role: 'user', parts: [{ type: 'text', text: "Fights First vs Counter-Offensive" }] })} className="p-2.5 rounded border border-grim-border bg-grim-plate/80 hover:bg-grim-border/40 hover:border-grim-gold/60 text-left transition flex items-center space-x-3 group z-20">
                        <span className="px-1.5 py-0.5 rounded bg-grim-obsidian border border-grim-borderGold text-[10px] text-grim-gold group-hover:bg-grim-gold group-hover:text-grim-obsidian transition font-mono font-bold">Q</span>
                        <span className="text-xs text-gray-300 group-hover:text-grim-parchment font-mono truncate">Fights First vs Counter-Offensive</span>
                      </button>
                      <button onClick={() => sendMessage({ role: 'user', parts: [{ type: 'text', text: "Can Pistols shoot after Falling Back?" }] })} className="p-2.5 rounded border border-grim-border bg-grim-plate/80 hover:bg-grim-border/40 hover:border-grim-gold/60 text-left transition flex items-center space-x-3 group z-20">
                        <span className="px-1.5 py-0.5 rounded bg-grim-obsidian border border-grim-borderGold text-[10px] text-grim-gold group-hover:bg-grim-gold group-hover:text-grim-obsidian transition font-mono font-bold">W</span>
                        <span className="text-xs text-gray-300 group-hover:text-grim-parchment font-mono truncate">Can Pistols shoot after Falling Back?</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 w-full max-w-3xl mx-auto pt-8">
                  {messages.map((m) => {
                    let textContent = "";
                    if (typeof (m as any).content === "string") {
                      textContent = (m as any).content;
                    } else if (Array.isArray(m.parts)) {
                      textContent = m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join("\n");
                    } else {
                      textContent = JSON.stringify(m);
                    }

                    return (
                      <div key={m.id} className={`w-full border border-grim-border bg-grim-plate/50 backdrop-blur rounded p-4 relative ${m.role === 'user' ? 'border-l-4 border-l-grim-borderGold' : 'border-l-4 border-l-grim-gold'}`}>
                        <div className="absolute -top-2.5 left-4 px-2 bg-grim-obsidian border border-grim-border text-[9px] text-grim-gold uppercase tracking-wider font-mono flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-grim-gold"></span>
                          {m.role === 'user' ? 'TACTICAL QUERY' : 'OMNISPEX VERDICT'}
                        </div>
                        <div className="mt-1 space-y-2 text-xs font-mono text-gray-300 leading-relaxed prose prose-invert prose-p:leading-relaxed max-w-none prose-strong:text-grim-gold">
                          <ReactMarkdown>{textContent}</ReactMarkdown>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="w-full max-w-3xl mt-4 shrink-0 z-20">
              <form onSubmit={handleSubmit} className="relative bg-grim-plate/95 border-2 border-grim-border hover:border-grim-gold/80 focus-within:border-grim-gold focus-within:shadow-gold-glow rounded-md transition-all duration-300 p-1.5 flex items-center">
                <div className="pl-2 text-grim-goldLow flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-grim-gold/80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 3.7 2.01 6.94 5 8.65V22h10v-1.35c2.99-1.71 5-4.95 5-8.65 0-5.52-4.48-10-10-10zm-3 12a2 2 0 110-4 2 2 0 010 4zm6 0a2 2 0 110-4 2 2 0 010 4z"></path>
                  </svg>
                </div>
                <input 
                  value={input}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent border-0 text-grim-parchment placeholder-gray-600 focus:ring-0 text-xs md:text-sm font-mono focus:outline-none pl-3" 
                  placeholder="Query the machine spirit..." 
                  type="text" 
                />
                <button type="submit" disabled={isLoading || !input.trim()} className="px-4 py-2 bg-gradient-to-r from-grim-gold to-grim-goldBright text-grim-obsidian font-mono text-xs font-bold rounded flex items-center space-x-1.5 hover:brightness-110 active:scale-95 transition shadow-gold-subtle shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span>CONSULT</span>
                  <span className="text-[10px] opacity-75">[↵]</span>
                </button>
              </form>
              <div className="mt-2 text-center text-[10px] font-mono text-gray-600 flex items-center justify-center space-x-3">
                <span>OMNISSIAH COGNITION ENGINE v2.4</span>
                <span>•</span>
                <span>ALL VERDICTS ACCORDING TO OFFICIAL GW ERRATA</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
