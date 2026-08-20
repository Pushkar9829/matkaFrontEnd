import { apiRequest } from './config'

const POLL_MS = 4000

function poll(loader, callback, fallback) {
  let active = true
  async function tick() {
    try {
      const data = await loader()
      if (active) callback(data)
    } catch {
      if (active) callback(fallback)
    }
  }
  tick()
  const timer = setInterval(tick, POLL_MS)
  return () => {
    active = false
    clearInterval(timer)
  }
}

function listenList(path, callback) {
  return poll(() => apiRequest(path), (data) => callback(Array.isArray(data) ? data : []), [])
}

export function parseLastTime(lastTime) {
  if (!lastTime) return null
  const [clock, meridian] = String(lastTime).split(' ')
  if (!clock) return null
  const parts = clock.split(':').map(Number)
  let hours = parts[0] || 0
  const minutes = parts[1] || 0
  const seconds = parts[2] || 0
  if (meridian === 'PM' && hours !== 12) hours += 12
  if (meridian === 'AM' && hours === 12) hours = 0
  const date = new Date()
  date.setHours(hours, minutes, seconds, 0)
  if (date.getTime() < Date.now() && meridian === 'AM' && hours < 6) {
    date.setDate(date.getDate() + 1)
  }
  return date
}

export function isMarketTimedOut(market) {
  if (!market) return true
  if (market.playOpen === false) return true
  const closeAt = parseLastTime(market.lastTime)
  if (!closeAt) return false
  return Date.now() >= closeAt.getTime()
}

export function withResults(markets, resultsByMarket) {
  return markets.map((market) => {
    const today = resultsByMarket.today[market.id] || 'XX'
    const previous = resultsByMarket.previous[market.id] || 'XX'
    return { ...market, today, previous, status: isMarketTimedOut(market) ? 'timeout' : 'open' }
  })
}

export function listenMarkets(callback) {
  return listenList('/api/markets', callback)
}

export async function loadResultsForDates(todayKey, yesterdayKey) {
  return apiRequest(`/api/results?today=${encodeURIComponent(todayKey)}&yesterday=${encodeURIComponent(yesterdayKey)}`)
}

export async function loadMonthResults(month, markets = []) {
  const rows = await apiRequest(`/api/results/month?month=${encodeURIComponent(month)}`)
  return rows.map((row) => ({
    date: row.date,
    values: markets.map((market) => (row.results || {})[market.id] || ''),
  }))
}

export async function updateProfile(_uid, fields) {
  return apiRequest('/api/profile', { method: 'PATCH', body: JSON.stringify(fields) })
}

export async function saveBankAccount(_uid, bank) {
  return apiRequest('/api/bank', { method: 'PUT', body: JSON.stringify(bank) })
}

export async function loadBankAccount() {
  return apiRequest('/api/bank')
}

export function listenWalletTransactions(_uid, callback) {
  return listenList('/api/wallet/transactions', callback)
}

export function listenWithdrawals(_uid, callback) {
  return listenList('/api/wallet/withdrawals', callback)
}

export function listenUserDeposits(_uid, callback) {
  return listenList('/api/wallet/deposits', callback)
}

export function listenBets(_uid, status, callback) {
  return listenList(`/api/bets?status=${encodeURIComponent(status)}`, callback)
}

export function listenContent(callback) {
  return poll(() => apiRequest('/api/content'), (data) => callback(data || {}), {})
}

export async function saveContent(fields) {
  return apiRequest('/api/admin/content', { method: 'PUT', body: JSON.stringify(fields) })
}

export function threadId(uid, type) {
  return `${uid}_${type}`
}

export async function ensureChatThread(_uid, type) {
  return apiRequest('/api/chat/threads', { method: 'POST', body: JSON.stringify({ type }) })
}

export function listenChatMessages(id, callback) {
  if (!id) return () => {}
  return listenList(`/api/chat/messages?threadId=${encodeURIComponent(id)}`, callback)
}

export async function sendChatMessage({ uid, type, text, from = 'user', file, playerId }) {
  const body = new FormData()
  body.append('type', type || 'chat')
  body.append('text', text || '')
  body.append('from', from)
  if (playerId || uid) body.append('playerId', playerId || uid)
  if (file) body.append('file', file)
  return apiRequest('/api/chat/messages', { method: 'POST', body })
}

export function listenChatThreads(callback) {
  return listenList('/api/admin/chat/threads', callback)
}

export function listenGamePostings(_uid, callback) {
  return listenList('/api/postings', callback)
}

export async function sendGamePosting(uid, text, from = 'user') {
  return apiRequest('/api/postings', {
    method: 'POST',
    body: JSON.stringify({ userId: uid, text, from }),
  })
}

export function listenNotifications(_uid, callback) {
  return listenList('/api/notifications', callback)
}

export async function markNotificationRead(id) {
  return apiRequest(`/api/notifications/${id}/read`, { method: 'PATCH' })
}

export async function submitSupportTicket({ mobile, issue, userId = '' }) {
  return apiRequest('/api/support', {
    method: 'POST',
    body: JSON.stringify({ mobile, issue, userId }),
  })
}

export async function updateTicket(id, status) {
  return apiRequest(`/api/admin/support/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export const listenUsers = (callback) => listenList('/api/admin/users', callback)
export const listenDeposits = (callback) => listenList('/api/admin/deposits', callback)
export const listenAllWithdrawals = (callback) => listenList('/api/admin/withdrawals', callback)
export const listenTickets = (callback) => listenList('/api/admin/support', callback)
export const listenAllPostings = (callback) => listenList('/api/admin/postings', callback)
export const listenAllBets = (callback) => listenList('/api/admin/bets', callback)
export const listenTransfers = (callback) => listenList('/api/admin/transfers', callback)

export const placeBet = (payload) => apiRequest('/api/bets', { method: 'POST', body: JSON.stringify(payload) })
export const requestDeposit = (payload) => apiRequest('/api/wallet/deposit', { method: 'POST', body: JSON.stringify(payload) })
export const requestWithdraw = (payload) => apiRequest('/api/wallet/withdraw', { method: 'POST', body: JSON.stringify(payload) })
export const transferPoints = (payload) => apiRequest('/api/wallet/transfer', { method: 'POST', body: JSON.stringify(payload) })
export const approveDeposit = ({ id }) => apiRequest(`/api/admin/deposits/${id}/approve`, { method: 'POST' })
export const rejectDeposit = ({ id }) => apiRequest(`/api/admin/deposits/${id}/reject`, { method: 'POST' })
export const approveWithdraw = ({ id }) => apiRequest(`/api/admin/withdrawals/${id}/approve`, { method: 'POST' })
export const rejectWithdraw = ({ id }) => apiRequest(`/api/admin/withdrawals/${id}/reject`, { method: 'POST' })
export const declareResult = (payload) => apiRequest('/api/admin/results', { method: 'POST', body: JSON.stringify(payload) })
export const rewindResult = (payload) => apiRequest('/api/admin/results/rewind', { method: 'POST', body: JSON.stringify(payload) })
export const listenDayResults = (date, callback) =>
  listenList(`/api/admin/results?date=${encodeURIComponent(date || '')}`, callback)
export const listenStats = (callback) => poll(() => apiRequest('/api/admin/stats'), (data) => callback(data || {}), {})
export const loadUserDetail = (id) => apiRequest(`/api/admin/users/${id}/detail`)
export const changeAdminPassword = (payload) =>
  apiRequest('/api/admin/password', { method: 'POST', body: JSON.stringify(payload) })
export async function uploadDepositQr(file) {
  const body = new FormData()
  body.append('file', file)
  return apiRequest('/api/admin/content/qr', { method: 'POST', body })
}
export const adjustBalance = ({ userId, amount, reason }) =>
  apiRequest(`/api/admin/users/${userId}/balance`, { method: 'POST', body: JSON.stringify({ amount, reason }) })
export const setUserBlocked = ({ userId, blocked }) =>
  apiRequest(`/api/admin/users/${userId}/block`, { method: 'POST', body: JSON.stringify({ blocked }) })
export const setUserPin = ({ userId, mpin }) =>
  apiRequest(`/api/admin/users/${userId}/pin`, { method: 'POST', body: JSON.stringify({ mpin }) })
export const changeUserPin = (payload) =>
  apiRequest('/api/profile/pin', { method: 'POST', body: JSON.stringify(payload) })
export const upsertMarket = (payload) => apiRequest('/api/admin/markets', { method: 'PUT', body: JSON.stringify(payload) })
export const deleteMarket = ({ id }) => apiRequest(`/api/admin/markets/${id}`, { method: 'DELETE' })
export const broadcastNotification = (payload) =>
  apiRequest('/api/admin/notifications', { method: 'POST', body: JSON.stringify(payload) })
