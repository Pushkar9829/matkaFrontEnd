import { useEffect, useState } from 'react'
import logo from '../../assets/logo.png'
import { useAuth } from '../../api/AuthContext.jsx'
import {
  listenContent,
  listenWalletTransactions,
  listenWithdrawals,
  listenUserDeposits,
  loadBankAccount,
  requestWithdraw,
  saveBankAccount,
  transferPoints,
} from '../../api/api'

const amounts = [200, 500, 1000, 1500, 2000, 5000]

function formatHistoryDate(value) {
  if (!value) return ''
  const text = String(value).trim()
  const parts = text.split(/,\s*/)
  if (parts.length >= 2) {
    return (
      <>
        {parts[0]},
        <br />
        {parts.slice(1).join(', ')}
      </>
    )
  }
  return text
}

function BankIcon() {
  return <i className="bi bi-bank" aria-hidden="true" />
}

export default function WalletPage({ onAddPoints }) {
  const { user, profile } = useAuth()
  const [mode, setMode] = useState('add')
  const [selected, setSelected] = useState(null)
  const [amountText, setAmountText] = useState('')
  const [visibleCount, setVisibleCount] = useState(10)
  const [transferOpen, setTransferOpen] = useState(false)
  const [mobilnumber, setMobilNumber] = useState('')
  const [amounttr, setAmounttr] = useState('')
  const [transferBusy, setTransferBusy] = useState(false)
  const [withdrawBusy, setWithdrawBusy] = useState(false)
  const [depositBusy, setDepositBusy] = useState(false)
  const [history, setHistory] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [deposits, setDeposits] = useState([])
  const [content, setContent] = useState({})
  const [bank, setBank] = useState({ bankName: '', holder: '', account: '', ifsc: '', upi: '' })
  const [message, setMessage] = useState('')
  const [fieldError, setFieldError] = useState({})

  useEffect(() => listenContent(setContent), [])
  useEffect(() => listenWalletTransactions(user?.uid, setHistory), [user?.uid])
  useEffect(() => listenWithdrawals(user?.uid, setWithdrawals), [user?.uid])
  useEffect(() => listenUserDeposits(user?.uid, setDeposits), [user?.uid])
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

  function pickAmount(amount) {
    setSelected(amount)
    setAmountText(String(amount))
  }

  function amountValue() {
    const typed = Number(String(amountText).trim())
    if (Number.isFinite(typed) && typed > 0) return typed
    if (Number.isFinite(selected) && selected > 0) return selected
    return 0
  }

  function openAddPoints() {
    const amount = amountValue()
    const minDeposit = Number(content.minDeposit) || 200
    if (!amount) {
      setMessage('Please enter a valid Value !')
      return
    }
    if (amount < minDeposit) {
      setMessage(`Minimum Deposit Amount ${minDeposit}`)
      return
    }
    if (!onAddPoints) {
      setMessage('Unable to open payment page')
      return
    }
    setDepositBusy(true)
    onAddPoints(amount)
    setDepositBusy(false)
  }

  function submitTransfer() {
    const mobile = mobilnumber.replace(/\D/g, '').slice(0, 10)
    const points = Number(amounttr)
    const errors = {}
    if (mobile.length !== 10) errors.mobile = true
    if (!points || points <= 0) errors.amount = true
    setFieldError(errors)
    if (Object.keys(errors).length) return

    setTransferBusy(true)
    transferPoints({ toUserId: mobile, points })
      .then(() => {
        setTransferOpen(false)
        setMobilNumber('')
        setAmounttr('')
        setMessage('Transfer successful.')
      })
      .catch((error) => setMessage(error.message || 'Transfer failed.'))
      .finally(() => setTransferBusy(false))
  }

  function submitWithdraw() {
    const amount = amountValue()
    const errors = {}
    if (!amount) errors.amount = true
    if (!bank.bankName) errors.bankName = true
    if (!bank.holder) errors.holder = true
    if (!bank.account) errors.account = true
    if (!bank.ifsc) errors.ifsc = true
    if (!bank.upi || !bank.upi.includes('@')) errors.upi = true
    setFieldError(errors)
    if (Object.keys(errors).length) {
      setMessage('Please fill valid bank details and amount.')
      return
    }

    setWithdrawBusy(true)
    requestWithdraw({ amount, bank })
      .then(() => {
        setMessage(`Withdrawal requested: ₹${amount}`)
        setAmountText('')
        setSelected(null)
      })
      .catch((error) => setMessage(error.message || 'Withdrawal failed.'))
      .finally(() => setWithdrawBusy(false))
  }

  function saveBank() {
    saveBankAccount(user.uid, bank)
      .then(() => setMessage('Bank account saved.'))
      .catch((error) => setMessage(error.message))
  }

  const depMessage =
    content.depositNotice ||
    'Your Amount will be deposit in 5 to 10 minutes'

  return (
    <>
      <section id="wallet" className="wallet-page margin-bottom-88">
        <div className="container-fluid p-0 margin-bottom-70">
          <div className="homecontainer">
            <div className="tabs_wallet">
              <div className="tabslinks nav nav-pills">
                <button
                  type="button"
                  className={`nav-link text-center AddPoint${mode === 'add' ? ' active' : ''}`}
                  onClick={() => {
                    setMode('add')
                    setMessage('')
                    setFieldError({})
                  }}
                >
                  Add Point
                </button>
                <button
                  type="button"
                  className={`nav-link text-center Withdraw${mode === 'withdraw' ? ' active' : ''}`}
                  onClick={() => {
                    setMode('withdraw')
                    setMessage('')
                    setFieldError({})
                  }}
                >
                  Withdraw
                </button>
              </div>
            </div>

            {mode === 'add' ? (
              <div>
                <div className="tab_content_one position-relative">
                  <div className="addfundwallet">
                    <div className="bankicon">
                      <BankIcon />
                    </div>
                    <input
                      type="number"
                      value={amountText}
                      onChange={(event) => {
                        const value = event.target.value
                        setAmountText(value)
                        const next = Number(value)
                        setSelected(amounts.includes(next) ? next : null)
                      }}
                      className="form-control addamountinput"
                      placeholder="Add Amount"
                    />
                  </div>

                  <div className="button-amount d-flex flex-wrap">
                    {amounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        className={`btn-amount${selected === amount ? ' is-selected' : ''}`}
                        onClick={() => pickAmount(amount)}
                      >
                        ₹ {amount}
                      </button>
                    ))}
                  </div>

                  <p className="description mt-2 text-danger">{depMessage}</p>

                  <div className="d-flex justify-content-between mt-2 wallet-action-row">
                    <button
                      type="button"
                      className="btnaddpoints"
                      disabled={depositBusy}
                      onClick={openAddPoints}
                    >
                      Add Points
                    </button>
                    <button
                      type="button"
                      className="transferpoints"
                      onClick={() => {
                        setFieldError({})
                        setTransferOpen(true)
                      }}
                    >
                      Transfer Points
                    </button>
                  </div>
                  {message && mode === 'add' && <p className="wallet-message">{message}</p>}
                  {deposits.some((item) => item.status === 'pending') && (
                    <p className="description mt-2 text-danger">
                      Pending deposits:{' '}
                      {deposits
                        .filter((item) => item.status === 'pending')
                        .map((item) => `₹${item.amount}`)
                        .join(', ')}
                    </p>
                  )}
                </div>

                <div className="table-responsive">
                  <p className="text-center mt-2 requesthistory">Wallet History</p>
                  <table className="tablehistory">
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
                          <td>
                            {row.payMode}
                            {row.market ? ` ${row.market}` : ''}
                          </td>
                          <td className="wallet-date-cell">{formatHistoryDate(row.dateLabel)}</td>
                          <td>{row.points}</td>
                          <td>{row.closing}</td>
                          <td>
                            <span
                              className={
                                /success/i.test(row.status || '')
                                  ? 'wallet-status-ok'
                                  : 'wallet-status-bad'
                              }
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {history.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center nodataavl">
                            No data available or something went wrong.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {visibleCount < history.length && (
                    <div className="loadmore-inline">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setVisibleCount((count) => count + 10)}
                      >
                        Load More
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ color: 'red', padding: '10px' }}>
                  सर, आप कम से कम ₹200 निकाल सकते हैं और आप 24*7 पैसे निकाल सकते हैं।
                </div>
                <div className="tab_content_one position-relative">
                  <div className="addfundwallet">
                    <div className="bankicon">
                      <BankIcon />
                    </div>
                    <input
                      type="number"
                      value={amountText}
                      onChange={(event) => {
                        const value = event.target.value
                        setAmountText(value)
                        const next = Number(value)
                        setSelected(amounts.includes(next) ? next : null)
                      }}
                      className={`form-control addamountinput${fieldError.amount ? ' is-invalid' : ''}`}
                      placeholder="Withdraw"
                    />
                    {fieldError.amount && (
                      <div className="invalid-feedback d-block">
                        Please enter a valid amount (e.g., 500 or 500.00)
                      </div>
                    )}
                  </div>

                  <div className="button-amount d-flex flex-wrap">
                    {amounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        className={`btn-amount${selected === amount ? ' is-selected' : ''}`}
                        onClick={() => pickAmount(amount)}
                      >
                        ₹ {amount}
                      </button>
                    ))}
                  </div>

                  <p className="description mt-2 text-danger text-center">
                    आप सिर्फ जीता हुआ पैसा ही अपने अकाउंट में निकाल सकते हो
                  </p>
                  <p className="text-center winamount">Win Amount :- {profile?.winAmount || 0}</p>
                  <p className="text-dark text-center wallet-bank-heading">Bank Account Details</p>

                  <div className="text-center">
                    <button type="button" className="btn btn-primary mb-2 wallet-add-bank-btn" onClick={saveBank}>
                      Add Bank Account
                    </button>
                  </div>

                  <form
                    className="wallet-bank-form position-relative"
                    onSubmit={(event) => {
                      event.preventDefault()
                      submitWithdraw()
                    }}
                  >
                    {[
                      ['bankName', 'Bank Name', 'Bank Name', false],
                      ['holder', 'Account Holder Name', 'Account Holder Name', false],
                      ['account', 'Account Number', 'Account Number', false],
                      ['ifsc', 'IFSC Code', 'IFSC Code', false],
                      ['upi', 'UPI ID', 'UPI ID', false],
                    ].map(([name, label, placeholder]) => (
                      <div key={name} className="wallet-form-item mb-2">
                        <label>{label}</label>
                        <input
                          type="text"
                          name={name}
                          placeholder={placeholder}
                          value={bank[name]}
                          onChange={handleBank}
                          className={`form-control${fieldError[name] ? ' is-invalid' : ''}`}
                        />
                      </div>
                    ))}

                    <div className="wallet-form-item mb-2">
                      <label />
                      <button type="submit" className="btn_color_all text-white" disabled={withdrawBusy}>
                        Withdrawal
                      </button>
                    </div>
                  </form>
                  {message && mode === 'withdraw' && <p className="wallet-message">{message}</p>}
                </div>

                <div className="table-responsive">
                  <p className="text-center mt-2 requesthistory">Withdraw History</p>
                  <table className="tablehistory">
                    <thead>
                      <tr>
                        <th>S No</th>
                        <th>Pay Mode</th>
                        <th>Date</th>
                        <th>Points</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody className="tbodyhistroy">
                      {withdrawals.map((row, index) => (
                        <tr key={row.id}>
                          <td>{index + 1}</td>
                          <td>{row.payMode || 'Bank Account'}</td>
                          <td className="wallet-date-cell">{formatHistoryDate(row.dateLabel)}</td>
                          <td>{row.amount}</td>
                          <td>
                            <span
                              className={
                                /success/i.test(row.status || '')
                                  ? 'wallet-status-ok'
                                  : 'wallet-status-bad'
                              }
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {withdrawals.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center nodataavl">
                            No data available or something went wrong.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {transferOpen && (
        <div className="wallet-transfer-overlay" onClick={() => setTransferOpen(false)}>
          <div
            className="model-transferpoint"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="wallet-transfer-title">
              Transfer
              <button type="button" className="wallet-transfer-close" onClick={() => setTransferOpen(false)} aria-label="Close">
                ×
              </button>
            </div>
            <div className="wallet-transfer-body">
              <div className="logo d-flex justify-content-center w-100 logomodel">
                <img src={logo} alt="Logo" />
              </div>
              <p className="pointsid text-white p-2 text-center">
                यहां से आप अपने POINT अपने दोस्तो की ID मैं डाल सकते हो
              </p>
              <input
                placeholder="Enter Mobile Number"
                value={mobilnumber}
                onChange={(event) => setMobilNumber(event.target.value.replace(/\D/g, '').slice(0, 10))}
                type="tel"
                inputMode="numeric"
                className={`form-control mb-2${fieldError.mobile ? ' is-invalid' : ''}`}
              />
              {fieldError.mobile && (
                <div className="invalid-feedback d-block">Please enter a valid Number</div>
              )}
              <input
                placeholder="Amount"
                type="number"
                value={amounttr}
                maxLength={6}
                onChange={(event) => setAmounttr(event.target.value.replace(/\D/g, '').slice(0, 6))}
                className={`form-control${fieldError.amount ? ' is-invalid' : ''}`}
              />
              {fieldError.amount && (
                <div className="invalid-feedback d-block">Please enter a valid Amount</div>
              )}
            </div>
            <div className="wallet-transfer-footer">
              <button
                type="button"
                className="btn_color_all text-white"
                disabled={transferBusy}
                onClick={submitTransfer}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
