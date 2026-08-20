import { useEffect, useState } from 'react'
import logo from '../../assets/logo.png'
import { useAuth } from '../../api/AuthContext.jsx'
import { listenGamePostings, sendGamePosting } from '../../api/api'

export default function GamePostingPage({ onBack }) {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [messages, setMessages] = useState([])

  useEffect(() => listenGamePostings(user?.uid, setMessages), [user?.uid])

  async function handleSubmit(event) {
    event.preventDefault()
    const value = text.trim()
    if (!value) return
    setText('')
    try {
      await sendGamePosting(user.uid, value)
    } catch (error) {
      setText(value)
      window.alert(error.message || 'Post failed.')
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#e8eef4]">
      <header className="flex items-center justify-between gap-2 bg-[#e4c25a] px-3 py-3 text-white">
        <button type="button" onClick={onBack} aria-label="Go back" className="shrink-0 p-1">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="min-w-0 truncate text-base font-medium sm:text-lg">Game Posting</h1>
        <img src={logo} alt="RPK 90" className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10" />
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm ${message.from === 'admin' ? 'bg-[#dbeafe] text-neutral-800' : 'ml-auto bg-white text-neutral-800'}`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 bg-[#e4c25a] px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
        <input type="text" value={text} onChange={(event) => setText(event.target.value)} placeholder="Type Message" className="min-w-0 flex-1 rounded-md border-0 bg-white px-4 py-2.5 text-neutral-800 outline-none placeholder:text-neutral-700" />
        <button type="submit" className="shrink-0 rounded-md bg-[#1f8a3b] px-3 text-white sm:px-4">Send</button>
      </form>
    </div>
  )
}
