import { useEffect, useRef, useState } from 'react'
import logo from '../../assets/logo.png'
import micIcon from '../../assets/mic.svg'
import { useAuth } from '../../api/AuthContext.jsx'
import { listenChatMessages, sendChatMessage, ensureChatThread } from '../../api/api'

const DEPOSIT_NOTICE =
  'कृपया केवल दिए गए अकाउंट में ही पेमेंट करें। यदि कोई व्यक्ति अपनी तरफ से किसी पुराने अकाउंट में पेमेंट करता है, तो उसका पेमेंट Add नहीं होगा और इसके लिए वह स्वयं जिम्मेदार होगा। कृपया 200 रुपये से कम जमा न करें।'

const WITHDRAW_NOTICE =
  'अगर आपको पैसे निकालने में कोई भी समस्या आ रही है तो आप अपनी समस्या को टाइप करके या वौइस् रिकॉर्ड करके भेज सकते है.'

function formatTime(value) {
  const date = value?.toDate ? value.toDate() : value ? new Date(value) : new Date()
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function isImageUrl(url) {
  return /\.(png|jpe?g|gif|webp|bmp)(\?|$)/i.test(url || '')
}

function isAudioUrl(url) {
  return /\.(mp3|wav|ogg|m4a|webm)(\?|$)/i.test(url || '')
}

function isVideoUrl(url) {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url || '')
}

function MessageBody({ text }) {
  const value = String(text || '')
  const urls = value.match(/https?:\/\/\S+/g) || []
  const fileUrl = urls.find((url) => isImageUrl(url) || isAudioUrl(url) || isVideoUrl(url) || url.includes('/uploads/'))
  const plain = value
    .replace(/📎 File attached\s*/g, '')
    .replace(fileUrl || '', '')
    .trim()

  if (fileUrl && isImageUrl(fileUrl)) {
    return (
      <>
        {plain ? <p style={{ wordBreak: 'break-word' }}>{plain}</p> : null}
        <img src={fileUrl} alt="Attachment" className="chatimagenew" style={{ maxWidth: '220px', width: '100%' }} />
      </>
    )
  }
  if (fileUrl && isVideoUrl(fileUrl)) {
    return (
      <video controls width="100%" height="150">
        <source src={fileUrl} />
      </video>
    )
  }
  if (fileUrl && isAudioUrl(fileUrl)) {
    return (
      <audio controls className="audioclass">
        <source src={fileUrl} />
      </audio>
    )
  }
  if (fileUrl) {
    return (
      <a href={fileUrl} target="_blank" rel="noreferrer" className="chat-file-link">
        {plain || 'Open file'}
      </a>
    )
  }
  if (value.startsWith('http')) {
    return (
      <a href={value} target="_blank" rel="noreferrer">
        {value}
      </a>
    )
  }
  return <p style={{ wordBreak: 'break-word' }}>{value}</p>
}

export default function ChatPage({ kind = 'deposit', onBack }) {
  const isDeposit = kind !== 'withdraw'
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [messages, setMessages] = useState([])
  const [sending, setSending] = useState(false)
  const endRef = useRef(null)
  const fileRef = useRef(null)
  const type = 'chat'
  const canSend = Boolean(text.trim() || selectedFile)

  useEffect(() => {
    if (!user?.uid) return undefined
    ensureChatThread(user.uid, type).catch(() => {})
    return listenChatMessages(`${user.uid}_${type}`, setMessages)
  }, [user?.uid])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const value = text.trim()
    if (!value && !selectedFile) return
    if (sending) return
    setSending(true)
    const payloadText = value || (selectedFile ? `📎 ${selectedFile.name}` : '')
    const file = selectedFile
    setText('')
    setSelectedFile(null)
    try {
      await sendChatMessage({ uid: user.uid, type, text: payloadText, file })
    } catch (error) {
      setText(value)
      setSelectedFile(file)
      window.alert(error.message || 'Message failed.')
    } finally {
      setSending(false)
    }
  }

  const notice = isDeposit ? DEPOSIT_NOTICE : WITHDRAW_NOTICE

  const inputValue = selectedFile ? `${text}${text ? ' - ' : ''}${selectedFile.name}` : text

  return (
    <section className="chat chat-page" id="chat">
      <div className="chat-fixed-header">
        <div className="headerchat">
          <div className="d-flex justify-content-between align-items-center">
            <div className="headericonarrow">
              <button type="button" className="arrowlink" onClick={onBack} aria-label="Go back">
                <i className="bi bi-arrow-left-short" />
              </button>
            </div>
            <div className="chatname">
              <h2>{isDeposit ? 'Deposit Chat' : 'Withdrawal Chat'}</h2>
            </div>
            <div className="logoheader">
              <img src={logo} className="img-fluid" alt="Logo" />
            </div>
          </div>
        </div>
        <p className="lineadd">{notice}</p>
      </div>

      <div className="container-fluid chat-body-wrap">
        <div className="chatdesignuser1">
          <div className="chat-message-group writer-user">
            <div className="chat-messages">
              {messages.map((message) => {
                const mine = message.from === 'user'
                return (
                  <div
                    key={message.id}
                    className={`message_container${mine ? '' : ' messageadmin'}`}
                  >
                    <div>
                      <div className={`message${mine ? '' : ' messageleft'}`}>
                        <MessageBody text={message.text} />
                      </div>
                      <p className={`datechat${mine ? '' : ' datechat-left'}`}>
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={endRef} />
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex chatdesign">
        <div className="inputchat">
          <textarea
            className="form-control"
            placeholder="Type Message"
            rows={1}
            value={inputValue}
            onChange={(event) => {
              const next = event.target.value
              if (selectedFile && next.endsWith(selectedFile.name)) {
                const cut = next.slice(0, Math.max(0, next.length - selectedFile.name.length)).replace(/\s*-\s*$/, '')
                setText(cut)
                return
              }
              if (selectedFile) setSelectedFile(null)
              setText(next)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                handleSend()
              }
            }}
          />
        </div>

        <div className="buttonsend bg-info">
          <label className="chat-attach-label" htmlFor="chatFileInput">
            <i className="bi bi-paperclip" />
            <input
              id="chatFileInput"
              ref={fileRef}
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0] || null
                setSelectedFile(file)
                event.target.value = ''
              }}
            />
          </label>
        </div>

        <div className="buttonsend">
          {canSend ? (
            <button
              type="button"
              className="sendmessage chat-icon-btn"
              disabled={sending}
              onClick={handleSend}
              aria-label="Send"
            >
              <i className="bi bi-send message_send" />
            </button>
          ) : (
            <button type="button" className="sendmessageMic chat-icon-btn" aria-label="Microphone">
              <img src={micIcon} alt="" className="chat-mic-icon" />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
