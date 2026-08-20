import { useEffect, useRef, useState } from 'react'
import logo from '../../assets/logo.png'
import { useAuth } from '../../api/AuthContext.jsx'
import { listenChatMessages, listenContent, sendChatMessage, ensureChatThread } from '../../api/api'

function formatTime(value) {
  const date = value?.toDate ? value.toDate() : value ? new Date(value) : new Date()
  if (Number.isNaN(date.getTime())) return ''
  let hours = date.getHours()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`
}

export default function ChatPage({ kind = 'deposit', onBack }) {
  const isDeposit = kind !== 'withdraw'
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState({})
  const endRef = useRef(null)
  const fileRef = useRef(null)
  const type = 'chat'

  useEffect(() => listenContent(setContent), [])
  useEffect(() => {
    if (!user?.uid) return undefined
    ensureChatThread(user.uid, type).catch(() => {})
    return listenChatMessages(`${user.uid}_${type}`, setMessages)
  }, [user?.uid])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(event) {
    event.preventDefault()
    const value = text.trim()
    if (!value) return
    setText('')
    try {
      await sendChatMessage({ uid: user.uid, type, text: value })
    } catch (error) {
      setText(value)
      window.alert(error.message || 'Message failed.')
    }
  }

  const notice = isDeposit
    ? (content.chatNotice || content.depositNotice || 'कृपया केवल दिए गए अकाउंट में ही पेमेंट करें।')
    : (content.withdrawNotice || content.chatNotice || 'कृपया विड्रॉ के लिए सही बैंक डिटेल भेजें।')

  return (
    <div className="flex min-h-screen flex-col bg-[#e8eef4]">
      <header className="flex items-center justify-between bg-[#e4c25a] px-3 py-3 text-white">
        <button type="button" onClick={onBack} aria-label="Go back" className="p-1">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-lg font-medium">{isDeposit ? 'Deposit Chat' : 'Withdraw Chat'}</h1>
        <img src={logo} alt="RPK 90" className="h-10 w-10 object-contain" />
      </header>

      <div className="bg-red-600 px-3 py-2 text-center text-[11px] leading-snug text-white sm:text-xs">
        {notice}
      </div>

      {isDeposit && (content.depositQrUrl || content.depositUpi) && (
        <div className="flex items-center gap-3 bg-white px-4 py-3">
          {content.depositQrUrl && (
            <img src={content.depositQrUrl} alt="Pay QR" className="h-20 w-20 object-contain" />
          )}
          <div>
            <p className="text-xs text-neutral-500">Pay UPI</p>
            <p className="font-medium">{content.depositUpi}</p>
          </div>
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {messages.map((message) => {
          const mine = message.from === 'user'
          return (
            <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${mine ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block rounded-2xl px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap ${mine ? 'rounded-br-sm bg-[#3da9f5] text-white' : 'rounded-bl-sm bg-white text-neutral-800'}`}>
                  {message.text}
                </div>
                <p className="mt-1 text-[11px] text-neutral-500">{formatTime(message.createdAt)}</p>
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-[#e4c25a] px-3 py-3">
        <input type="text" value={text} onChange={(event) => setText(event.target.value)} placeholder="Type Message" className="flex-1 rounded-md border-0 bg-white px-4 py-2.5 text-neutral-800 outline-none placeholder:text-neutral-500" />
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) sendChatMessage({ uid: user.uid, type, text: '📎 File attached', file })
            event.target.value = ''
          }}
        />
        <button type="button" onClick={() => fileRef.current?.click()} aria-label="Attach file" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7ec8f5] text-white">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 12l8-8a4 4 0 115.7 5.7l-9.2 9.1a3 3 0 01-4.2-4.2l8.5-8.5" strokeLinecap="round" />
          </svg>
        </button>
        <button type="submit" aria-label="Send" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1f8a3b] text-white">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M3 11l18-8-8 18-2-7-8-3z" />
          </svg>
        </button>
      </form>
    </div>
  )
}
