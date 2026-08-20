import { useEffect, useState } from 'react'
import { useAuth } from '../../api/AuthContext.jsx'
import {
  listenWalletTransactions,
  listenWithdrawals,
  listenUserDeposits,
  listenContent,
  loadBankAccount,
  requestDeposit,
  requestWithdraw,
  saveBankAccount,
  transferPoints,
} from '../../api/api'

const amounts = [200, 500, 1000, 1500, 2000, 5000]

function BankIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="1em" height="1em" fill="currentColor">
      <path d="m8 0 6.61 3h.89a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H15v7a.5.5 0 0 1 .485.38l.5 2a.498.498 0 0 1-.485.62H.5a.498.498 0 0 1-.485-.62l.5-2A.501.501 0 0 1 1 13V6H.5a.5.5 0 0 1-.5-.5v-2A.5.5 0 0 1 .5 3h.89L8 0ZM3.777 3h8.447L8 1 3.777 3ZM2 6v7h1V6H2Zm2 0v7h2.5V6H4Zm3.5 0v7h1V6h-1Zm2 0v7H12V6H9.5ZM13 6v7h1V6h-1Zm2-1V4H1v1h14Zm-.39 9H1.39l-.25 1h13.72l-.25-1Z" />
    </svg>
  )
}

function AmountGrid({ selected, onSelect }) {
  return (
    <div className="wallet-amounts">
      {amounts.map((amount) => (
        <button
          key={amount}
          type="button"
          onClick={() => onSelect(amount)}
          className={`wallet-amount${selected === amount ? ' is-selected' : ''}`}
        >
          ₹ {amount}
        </button>
      ))}
    </div>
  )
}

export default function WalletPage() {
  const { user, profile } = useAuth()
  const [mode, setMode] = useState('add')
  const [selected, setSelected] = useState(null)
  const [visibleCount, setVisibleCount] = useState(2)
  const [transferOpen, setTransferOpen] = useState(false)
  const [toUserId, setToUserId] = useState('')
  const [transferPointsValue, setTransferPointsValue] = useState('')
  const [history, setHistory] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [deposits, setDeposits] = useState([])
  const [bank, setBank] = useState({ bankName: '', holder: '', account: '', ifsc: '', upi: '' })
  const [content, setContent] = useState({})
  const [message, setMessage] = useState('')

  useEffect(() => listenWalletTransactions(user?.uid, setHistory), [user?.uid])
  useEffect(() => listenWithdrawals(user?.uid, setWithdrawals), [user?.uid])
  useEffect(() => listenUserDeposits(user?.uid, setDeposits), [user?.uid])
  useEffect(() => listenContent(setContent), [])
  useEffect(() => {
    if (!user?.uid) return undefined
    loadBankAccount(user.uid).then((saved) => {
      if (saved) {
        setBank({
          bankName: saved.bankName || '',
          holder: saved.holder || '',
          account: saved.account || '',
          ifsc: saved.ifsc || '',
          upi: saved.upi || '',
        })
      }
    })
    return undefined
  }, [user?.uid])

  function handleBank(event) {
    const { name, value } = event.target
    setBank((current) => ({ ...current, [name]: value }))
  }

  return (
    <div className="wallet-page">
      <div className="wallet-tabs">
        <button type="button" onClick={() => { setMode('add'); setMessage('') }} className={`wallet-tab ${mode === 'add' ? 'is-green' : 'is-orange'}`}>
          Add Point
        </button>
        <button type="button" onClick={() => { setMode('withdraw'); setMessage('') }} className={`wallet-tab ${mode === 'withdraw' ? 'is-green' : 'is-orange'}`}>
          Withdraw
        </button>
      </div>

      <div className="wallet-body">
        {mode === 'add' ? (
          <>
            <div className="wallet-amount-bar">
              <span className="wallet-amount-icon"><BankIcon /></span>
              Add Amount
            </div>
            <AmountGrid selected={selected} onSelect={setSelected} />
            {(content.depositQrUrl || content.depositUpi) && (
              <div className="mb-3 flex items-center gap-3 rounded-xl bg-white p-3">
                {content.depositQrUrl && (
                  <img src={content.depositQrUrl} alt="Pay QR" className="h-28 w-28 object-contain" />
                )}
                <div>
                  <p className="text-xs text-neutral-500">Pay on this UPI</p>
                  <p className="font-semibold">{content.depositUpi}</p>
                  <p className="mt-1 text-xs text-neutral-500">Then send the screenshot in Chat.</p>
                </div>
              </div>
            )}
            <p className="wallet-note">Your Amount will be deposit in 5 to 10 minutes</p>
            <div className="wallet-actions">
              <button
                type="button"
                onClick={() => {
                  if (!selected) return setMessage('Select an amount')
                  requestDeposit({ amount: selected })
                    .then(() => setMessage(`Deposit request sent: ₹${selected}. Send proof in Chat.`))
                    .catch((error) => setMessage(error.message))
                }}
                className="wallet-action"
              >
                Add Points
              </button>
              <button type="button" onClick={() => setTransferOpen(true)} className="wallet-action">
                Transfer Points
              </button>
            </div>
            {message && <p className="wallet-message">{message}</p>}

            {deposits.some((item) => item.status === 'pending') && (
              <p className="wallet-note">
                Pending deposits: {deposits.filter((item) => item.status === 'pending').map((item) => `₹${item.amount}`).join(', ')}
              </p>
            )}

            <h3 className="wallet-history-title">Wallet History</h3>
            <div className="wallet-table-wrap">
              <table className="wallet-table">
                <thead>
                  <tr>
                    <th>Sr No</th>
                    <th>Pay Mode</th>
                    <th>Date</th>
                    <th>Points</th>
                    <th>Closing Balance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, visibleCount).map((row, index) => (
                    <tr key={row.id}>
                      <td>{index + 1}</td>
                      <td>{row.payMode}</td>
                      <td>{row.dateLabel || ''}</td>
                      <td>{row.points}</td>
                      <td>{row.closing}</td>
                      <td className="wallet-status">{row.status}</td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={6}>No data available or something went wrong.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {visibleCount < history.length && (
              <button type="button" onClick={() => setVisibleCount(history.length)} className="wallet-load-more">
                Load More
              </button>
            )}
          </>
        ) : (
          <>
            <p className="wallet-note">यार, आप कम से कम ₹200 निकाल सकते हैं और आप 24*7 पैसे निकाल सकते हैं।</p>
            <div className="wallet-amount-bar">
              <span className="wallet-amount-icon"><BankIcon /></span>
              Withdraw
            </div>
            <AmountGrid selected={selected} onSelect={setSelected} />
            <p className="wallet-note">आप सिर्फ जीता हुआ पैसा ही अपने अकाउंट में निकाल सकते हो</p>
            <p className="wallet-win">Win Amount :- {profile?.winAmount || 0}</p>

            <p className="wallet-bank-title">Bank Account Details</p>
            <button
              type="button"
              className="wallet-add-bank"
              onClick={() => {
                saveBankAccount(user.uid, bank)
                  .then(() => setMessage('Bank account saved.'))
                  .catch((error) => setMessage(error.message))
              }}
            >
              Add Bank Account
            </button>

            <div className="wallet-fields">
              {[
                ['bankName', 'Bank Name', 'Bank Name'],
                ['holder', 'Account Holder Name', 'Account Holder Name'],
                ['account', 'Account Number', 'Account Number'],
                ['ifsc', 'IFSC Code', 'IFSC Code'],
                ['upi', 'UPI ID', 'UPI ID'],
              ].map(([name, label, placeholder]) => (
                <label key={name} className="wallet-field">
                  <span>{label} :</span>
                  <input name={name} value={bank[name]} onChange={handleBank} placeholder={placeholder} />
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                if (!selected) return setMessage('Select an amount')
                requestWithdraw({ amount: selected, bank })
                  .then(() => setMessage(`Withdrawal requested: ₹${selected}`))
                  .catch((error) => setMessage(error.message))
              }}
              className="wallet-withdrawal"
            >
              Withdrawal
            </button>
            {message && <p className="wallet-message">{message}</p>}

            <h3 className="wallet-history-title">Withdraw History</h3>
            <div className="wallet-table-wrap">
              <table className="wallet-table">
                <thead>
                  <tr>
                    <th>S No</th>
                    <th>Pay Mode</th>
                    <th>Date</th>
                    <th>Points</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((row, index) => (
                    <tr key={row.id}>
                      <td>{index + 1}</td>
                      <td>{row.payMode || 'Bank Account'}</td>
                      <td>{row.dateLabel || ''}</td>
                      <td>{row.amount}</td>
                      <td className="wallet-status is-red">{row.status}</td>
                    </tr>
                  ))}
                  {withdrawals.length === 0 && (
                    <tr>
                      <td colSpan={5}>No data available or something went wrong.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {transferOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-2xl font-semibold">Transfer Points</h2>
            <input value={toUserId} onChange={(event) => setToUserId(event.target.value)} placeholder="User ID" className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2" />
            <input type="number" value={transferPointsValue} onChange={(event) => setTransferPointsValue(event.target.value)} placeholder="Points" className="mb-4 w-full rounded-md border border-neutral-300 px-3 py-2" />
            <div className="flex gap-3">
              <button type="button" onClick={() => setTransferOpen(false)} className="flex-1 rounded-xl bg-neutral-300 py-3">Cancel</button>
              <button
                type="button"
                onClick={() => {
                  transferPoints({ toUserId, points: Number(transferPointsValue) })
                    .then(() => {
                      setTransferOpen(false)
                      setMessage('Transfer successful.')
                    })
                    .catch((error) => setMessage(error.message))
                }}
                className="flex-1 rounded-xl bg-orange-600 py-3 text-white"
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
