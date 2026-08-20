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
    <div className="flex min-h-screen flex-col bg-[#e8eef4]">
      <header className="flex items-center justify-between bg-[#e4c25a] px-3 py-3 text-white">
        <button type="button" onClick={onBack} aria-label="Go back" className="p-1">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-lg font-medium">Game Posting</h1>
        <img src={logo} alt="RPK 90" className="h-10 w-10 object-contain" />
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

      <form onSubmit={handleSubmit} className="flex gap-2 bg-[#e4c25a] px-3 py-3">
        <input type="text" value={text} onChange={(event) => setText(event.target.value)} placeholder="Type Message" className="flex-1 rounded-md border-0 bg-white px-4 py-2.5 text-neutral-800 outline-none placeholder:text-neutral-700" />
        <button type="submit" className="rounded-md bg-[#1f8a3b] px-4 text-white">Send</button>
      </form>
    </div>
  )
}
