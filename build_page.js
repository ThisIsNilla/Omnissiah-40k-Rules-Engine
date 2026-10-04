const fs = require('fs');

const reactCode = `
"use client"

import { useChat } from "@ai-sdk/react"
import { useRef, useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"

export default function Home() {
  const { messages, status, sendMessage } = useChat()
  const [input, setInput] = useState("")
  const [factions, setFactions] = useState<string[]>([])
  
  const isLoading = status === 'submitted' || status === 'streaming'
  const desktopScrollRef = useRef<HTMLDivElement>(null)
  const mobileScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/rulebooks')
      .then(res => res.json())
      .then(data => setFactions(data.factions || []))
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (desktopScrollRef.current) {
      desktopScrollRef.current.scrollTop = desktopScrollRef.current.scrollHeight
    }
    if (mobileScrollRef.current) {
      window.scrollTo(0, document.body.scrollHeight)
    }
  }, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage({ role: 'user', parts: [{ type: 'text', text: input }] })
    setInput("")
  }

  const handleQuickQuery = (text: string) => {
    sendMessage({ role: 'user', parts: [{ type: 'text', text }] })
  }

  // Common message renderer
  const renderMessageContent = (m: any) => {
    let textContent = "";
    if (typeof m.content === "string") {
      textContent = m.content;
    } else if (Array.isArray(m.parts)) {
      textContent = m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join("\\n");
    } else {
      textContent = JSON.stringify(m);
    }

    let displayContent = textContent;
    if (m.role !== 'user') {
      // Convert XML thinking tags into a thematic Markdown blockquote so the user can 
      // safely read the AI's internal logic without the risk of the regex deleting the answer.
      displayContent = displayContent
        .replace(/<thinking>/g, '> *Cogitating protocol sequence...*\\n> \\n> ')
        .replace(/<\\/thinking>/g, '\\n\\n')
        .replace(/\\*\\*Final Verdict:\\*\\*\\s*/g, '\\n\\n**Final Verdict:**\\n');
    }
    return displayContent;
  }

  return (
    <>
      {/* ========================================= */}
      {/* DESKTOP LAYOUT (Hidden on mobile) */}
      {/* ========================================= */}
      <div className="hidden md:flex flex-col h-full w-full absolute inset-0 overflow-hidden bg-grim-void">
        {/* MasterHeader */}
        <header className="h-14 border-b border-grim-border bg-grim-obsidian/95 backdrop-blur flex items-center justify-between px-4 z-30 shrink-0 relative">
          <div className="flex items-center space-x-3.5">
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

          <div className="flex items-center space-x-4 text-xs font-mono">
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

          <div className="flex items-center space-x-3 text-xs ml-4">
            <div className="flex items-center space-x-4 text-[11px] text-gray-400 font-mono shrink-0">
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
              <span>PURGE CACHE</span>
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative">
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
          </aside>

          <main className="flex-1 flex flex-col relative overflow-hidden bg-grim-obsidian telemetry-grid">
            <div className="absolute inset-0 scanlines pointer-events-none opacity-40 z-10"></div>
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-grim-gold/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center justify-between relative z-10" ref={desktopScrollRef}>
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
                        Enter rules conflicts, sequencing disputes, or datasheet interactions. The Omnispex consults {factions.length + 3} canon texts.
                      </p>
                    </div>
                    <div className="w-full max-w-2xl space-y-2.5 mb-8">
                      <div className="text-[10px] uppercase font-mono tracking-widest text-grim-goldLow text-center mb-1">
                        — Frequent Tactical Inquiries —
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <button onClick={() => handleQuickQuery("Fights First vs Counter-Offensive")} className="p-2.5 rounded border border-grim-border bg-grim-plate/80 hover:bg-grim-border/40 hover:border-grim-gold/60 text-left transition flex items-center space-x-3 group z-20">
                          <span className="px-1.5 py-0.5 rounded bg-grim-obsidian border border-grim-borderGold text-[10px] text-grim-gold group-hover:bg-grim-gold group-hover:text-grim-obsidian transition font-mono font-bold">Q</span>
                          <span className="text-xs text-gray-300 group-hover:text-grim-parchment font-mono truncate">Fights First vs Counter-Offensive</span>
                        </button>
                        <button onClick={() => handleQuickQuery("Can Pistols shoot after Falling Back?")} className="p-2.5 rounded border border-grim-border bg-grim-plate/80 hover:bg-grim-border/40 hover:border-grim-gold/60 text-left transition flex items-center space-x-3 group z-20">
                          <span className="px-1.5 py-0.5 rounded bg-grim-obsidian border border-grim-borderGold text-[10px] text-grim-gold group-hover:bg-grim-gold group-hover:text-grim-obsidian transition font-mono font-bold">W</span>
                          <span className="text-xs text-gray-300 group-hover:text-grim-parchment font-mono truncate">Can Pistols shoot after Falling Back?</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 w-full max-w-3xl mx-auto pt-8">
                    {messages.map((m) => (
                      <div key={m.id} className={\`w-full border border-grim-border bg-grim-plate/50 backdrop-blur rounded p-4 relative \${m.role === 'user' ? 'border-l-4 border-l-grim-borderGold' : 'border-l-4 border-l-grim-gold'}\`}>
                        <div className="absolute -top-2.5 left-4 px-2 bg-grim-obsidian border border-grim-border text-[9px] text-grim-gold uppercase tracking-wider font-mono flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-grim-gold"></span>
                          {m.role === 'user' ? 'TACTICAL QUERY' : 'OMNISPEX VERDICT'}
                        </div>
                        <div className="mt-1 space-y-2 text-xs font-mono text-gray-100 leading-relaxed prose prose-invert prose-p:leading-relaxed prose-p:text-gray-100 max-w-none prose-strong:text-grim-gold">
                          <ReactMarkdown>{renderMessageContent(m)}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ========================================= */}
      {/* MOBILE LAYOUT (Hidden on desktop) */}
      {/* ========================================= */}
      <div className="md:hidden flex flex-col min-h-screen bg-[#121317] text-[#e3e2e8] font-['JetBrains_Mono'] relative">
        <header className="fixed top-0 w-full z-50 pt-[env(safe-area-inset-top,0px)] bg-[#0d0e12]/90 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="h-16 px-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button aria-label="Toggle Sacred Codices Archive" className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-[#292a2e]/60 text-[#eec14b] hover:bg-[#343439] transition-colors">
                <span className="material-symbols-outlined text-[20px]">menu_open</span>
              </button>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1">
                  <span className="font-['EB_Garamond'] text-[20px] font-semibold tracking-wider text-[#eec14b] leading-none">OMNISSIAH</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#343439] text-[#d1c5af]">v1.4 M41</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4ae176] shadow-[0_0_6px_#4ae176]"></span>
                  <span className="text-[9px] font-bold text-[#4ae176] uppercase">{isLoading ? "COGITATING" : "ONLINE"}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="min-w-[44px] min-h-[44px] flex items-center justify-center gap-1 px-2.5 rounded-lg bg-[#1f1f24] text-[#d1c5af]">
                <span className="material-symbols-outlined text-[18px] text-[#eec14b]">auto_stories</span>
                <span className="text-[9px] font-bold text-[#eec14b]">{factions.length + 3}</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex flex-col relative w-full pt-16 pb-[100px]" ref={mobileScrollRef}>
          <div className="pointer-events-none fixed inset-0 opacity-[0.035] bg-[radial-gradient(circle_at_50%_0%,_#eec14b_0%,_transparent_75%)] z-0"></div>
          
          <section className="relative z-10 px-3 pt-1 pb-2 flex items-center justify-between gap-1 bg-[#0d0e12]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ae176] shadow-[0_0_6px_#4ae176]"></span>
              <span className="text-[9px] font-bold text-[#4ae176] uppercase tracking-wider">10TH ED. CORE</span>
              <span className="text-[#9a907c] text-[9px]">•</span>
              <span className="text-[9px] font-bold text-[#9a907c]">ERRATA V1.4 ACTIVE</span>
            </div>
            <div className="flex items-center gap-1 text-[#d1c5af] text-[9px] font-bold">
              <span className="material-symbols-outlined text-[14px] text-[#4ae176]">check_circle</span>
              <span>READY</span>
            </div>
          </section>

          <section className="relative z-10 px-3 py-2 bg-[#1a1b20] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eec14b] text-[#3e2e00] text-[9px] font-bold uppercase tracking-wider shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3e2e00]"></span>
              <span>All Factions</span>
            </button>
            {factions.slice(0,5).map(f => (
              <button key={f} className="shrink-0 px-3 py-1 rounded-full bg-[#292a2e]/60 text-[#d1c5af] text-[9px] font-bold uppercase tracking-wider">{f}</button>
            ))}
          </section>

          {messages.length === 0 ? (
            <div className="flex flex-col">
              <section className="relative z-10 px-3 pt-4 pb-2 flex flex-col items-center text-center">
                <div className="relative w-20 h-20 my-2 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[#eec14b]/5 blur-sm"></div>
                  <svg className="absolute inset-0 w-full h-full text-[#eec14b]/30 animate-[spin_32s_linear_infinite]" fill="none" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1.5"></circle>
                    <rect fill="#eec14b" height="4" width="3" x="48.5" y="1"></rect>
                    <rect fill="#eec14b" height="4" width="3" x="48.5" y="95"></rect>
                    <rect fill="#eec14b" height="3" width="4" x="1" y="48.5"></rect>
                    <rect fill="#eec14b" height="3" width="4" x="95" y="48.5"></rect>
                  </svg>
                  <div className="relative w-14 h-14 rounded-full bg-[#0d0e12] flex items-center justify-center shadow-lg shadow-[#eec14b]/10 border border-[#343439]">
                    <svg className="w-9 h-9 text-[#eec14b]" fill="none" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" stroke="currentColor" strokeDasharray="6 3" strokeWidth="2"></circle>
                      <circle cx="40" cy="40" fill="#121317" r="28"></circle>
                      <path d="M40 26C34 26 31 31 31 36C31 42 33 45 34 48L34 52C34 53 35 54 36 54L44 54C45 54 46 53 46 52L46 48C47 45 49 42 49 36C49 31 46 26 40 26Z" fill="currentColor"></path>
                      <circle cx="37" cy="35" fill="#121317" r="2.5"></circle>
                      <circle cx="43" cy="35" fill="#121317" r="2.5"></circle>
                      <polygon fill="#121317" points="40,38 38.5,41 41.5,41"></polygon>
                      <rect fill="#121317" height="4" width="1.5" x="36.5" y="48"></rect>
                      <rect fill="#121317" height="4" width="1.5" x="39.25" y="48"></rect>
                      <rect fill="#121317" height="4" width="1.5" x="42" y="48"></rect>
                    </svg>
                  </div>
                </div>
                <h2 className="font-['EB_Garamond'] text-[20px] font-semibold text-[#eec14b] tracking-wide mt-1">Awaiting Tactical Query</h2>
                <p className="text-[12px] text-[#9a907c] max-w-[300px] mt-1">Consult canonical 10th Edition rules, codices & errata through the Machine Spirit.</p>
              </section>

              <section className="relative z-10 px-3 mt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#9a907c]">Common Adjudications</span>
                  <span className="text-[9px] font-bold text-[#eec14b]/80">4 Topics</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleQuickQuery("Fights First vs Counter-Offensive sequencing")} className="text-left p-3 rounded-lg bg-[#1f1f24] hover:bg-[#292a2e] flex flex-col group">
                    <span className="text-[9px] text-[#eec14b] uppercase font-bold mb-1">Fight Phase</span>
                    <p className="text-[12px] text-[#e3e2e8] font-semibold">Fights First vs Counter-Offensive</p>
                  </button>
                  <button onClick={() => handleQuickQuery("Can pistols shoot after Falling Back?")} className="text-left p-3 rounded-lg bg-[#1f1f24] hover:bg-[#292a2e] flex flex-col group">
                    <span className="text-[9px] text-[#4ae176] uppercase font-bold mb-1">Shooting</span>
                    <p className="text-[12px] text-[#e3e2e8] font-semibold">Pistols after Falling Back</p>
                  </button>
                </div>
              </section>
            </div>
          ) : (
            <div className="flex flex-col gap-4 px-3 mt-4">
              {messages.map(m => (
                <div key={m.id} className={\`p-3.5 rounded-xl bg-[#1f1f24] shadow-md border \${m.role === 'user' ? 'border-[#eec14b]/30' : 'border-[#4ae176]/30'}\`}>
                  <div className="flex items-center justify-between pb-2 border-b border-[#343439]">
                    <span className={\`text-[9px] font-bold uppercase tracking-wider \${m.role === 'user' ? 'text-[#eec14b]' : 'text-[#4ae176]'}\`}>
                      {m.role === 'user' ? 'TACTICAL QUERY' : 'OMNISPEX VERDICT'}
                    </span>
                  </div>
                  <div className="mt-2 text-[12px] leading-relaxed prose prose-invert prose-p:leading-relaxed prose-p:text-[#ffffff] max-w-none prose-strong:text-[#eec14b]">
                    <ReactMarkdown>{renderMessageContent(m)}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <section className="fixed inset-x-0 z-40 px-3 pb-[env(safe-area-inset-bottom,12px)] pointer-events-none bottom-0">
          <div className="pointer-events-auto p-1.5 rounded-xl bg-[#0d0e12]/95 backdrop-blur-xl shadow-2xl flex items-center gap-2">
            <form onSubmit={handleSubmit} className="relative flex-1 flex items-center min-w-0 bg-[#292a2e]/60 rounded-lg px-3 h-10 border border-[#4e4635] focus-within:border-[#eec14b]">
              <span className="material-symbols-outlined text-[18px] text-[#9a907c] mr-2 shrink-0 select-none">terminal</span>
              <input 
                value={input}
                onChange={handleInputChange}
                className="w-full bg-transparent text-[#e3e2e8] placeholder:text-[#9a907c] text-[12px] outline-none truncate" 
                placeholder="Ask rules, stratagems or keywords..." 
                type="text" 
              />
            </form>
            <button onClick={handleSubmit} disabled={isLoading || !input.trim()} className="h-10 px-3.5 rounded-lg bg-[#eec14b] text-[#3e2e00] hover:bg-[#c59b27] text-[9px] font-bold uppercase tracking-wider flex items-center justify-center shrink-0 transition-transform disabled:opacity-50">
              Query
            </button>
          </div>
        </section>
      </div>
    </>
  )
}
`;

fs.writeFileSync('src/app/page.tsx', reactCode);
console.log('page.tsx overwritten for responsive dual-layout');
