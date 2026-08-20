import { useEffect, useState } from 'react'
import { changeAdminPassword, listenContent, saveContent, uploadDepositQr } from '../../api/api'
import { Card, Field, greenBtn, inputClass, primaryBtn } from '../ui'

const siteFields = [
  { key: 'marquee', label: 'Banner line (marquee)' },
  { key: 'bannerLink', label: 'Banner link (optional, WhatsApp / Instagram / site)' },
  { key: 'resultLink', label: 'Result click link (WhatsApp / Instagram)' },
  { key: 'flashMessage', label: 'Flash message (one line each)' },
  { key: 'liveNote', label: 'Live note' },
  { key: 'helpPromo', label: 'Help promo' },
  { key: 'depositUpi', label: 'Deposit UPI ID' },
  { key: 'chatNotice', label: 'Chat notice' },
  { key: 'apkUrl', label: 'APK URL' },
  { key: 'apkUrl2', label: 'APK URL 2' },
  { key: 'siteUrl', label: 'Site URL' },
  { key: 'otherGameUrl', label: 'Other game URL' },
  { key: 'facebookUrl', label: 'Facebook' },
  { key: 'instagramUrl', label: 'Instagram' },
]

export default function SettingsPanel({ onOk, onError }) {
  const [content, setContent] = useState({})
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '' })

  useEffect(() => listenContent(setContent), [])

  return (
    <div className="grid max-w-3xl gap-4">
      <Card className="space-y-3 p-5">
        <h3 className="font-semibold">Admin password</h3>
        <Field label="Current password">
          <input type="password" value={password.currentPassword} onChange={(event) => setPassword((current) => ({ ...current, currentPassword: event.target.value }))} className={inputClass} />
        </Field>
        <Field label="New password">
          <input type="password" value={password.newPassword} onChange={(event) => setPassword((current) => ({ ...current, newPassword: event.target.value }))} className={inputClass} />
        </Field>
        <button
          type="button"
          className={primaryBtn}
          onClick={() => changeAdminPassword(password)
            .then(() => { onOk('Password changed'); setPassword({ currentPassword: '', newPassword: '' }) })
            .catch(onError)}
        >
          Change password
        </button>
      </Card>

      <Card className="space-y-3 p-5">
        <h3 className="font-semibold">Deposit QR & UPI</h3>
        <p className="text-xs text-neutral-500">Players see this QR and UPI on wallet add-point and in chat.</p>
        {content.depositQrUrl && (
          <img src={content.depositQrUrl} alt="Deposit QR" className="h-40 w-40 rounded-lg bg-white object-contain ring-1 ring-neutral-200" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) return
            uploadDepositQr(file).then((saved) => { setContent(saved); onOk('QR updated') }).catch(onError)
            event.target.value = ''
          }}
        />
        <Field label="Deposit UPI ID">
          <input value={content.depositUpi || ''} onChange={(event) => setContent((current) => ({ ...current, depositUpi: event.target.value }))} className={inputClass} placeholder="rpk90@upi" />
        </Field>
      </Card>

      <Card className="space-y-3 p-5">
        <h3 className="font-semibold">Banner, flash & site copy</h3>
        {siteFields.map((field) => (
          <Field key={field.key} label={field.label}>
            {field.key === 'flashMessage' || field.key === 'liveNote' || field.key === 'chatNotice' ? (
              <textarea rows={field.key === 'flashMessage' ? 3 : 2} value={content[field.key] || ''} onChange={(event) => setContent((current) => ({ ...current, [field.key]: event.target.value }))} className={inputClass} />
            ) : (
              <input value={content[field.key] || ''} onChange={(event) => setContent((current) => ({ ...current, [field.key]: event.target.value }))} className={inputClass} />
            )}
          </Field>
        ))}
        {['depositNotice', 'withdrawNotice'].map((key) => (
          <Field key={key} label={key === 'depositNotice' ? 'Deposit notice (legacy)' : 'Withdraw notice (legacy)'}>
            <textarea rows={3} value={content[key] || ''} onChange={(event) => setContent((current) => ({ ...current, [key]: event.target.value }))} className={inputClass} />
          </Field>
        ))}
        <Field label="Help (one line each)">
          <textarea rows={4} value={(content.help || []).join('\n')} onChange={(event) => setContent((current) => ({ ...current, help: event.target.value.split('\n').filter(Boolean) }))} className={inputClass} />
        </Field>
        <Field label="Terms (one line each)">
          <textarea rows={6} value={(content.terms || []).join('\n')} onChange={(event) => setContent((current) => ({ ...current, terms: event.target.value.split('\n').filter(Boolean) }))} className={inputClass} />
        </Field>
        {['tmApplication', 'arnNumber', 'provisionalId'].map((key) => (
          <Field key={key} label={key}>
            <input
              value={content.details?.[key] || ''}
              onChange={(event) => setContent((current) => ({
                ...current,
                details: { ...(current.details || {}), [key]: event.target.value },
              }))}
              className={inputClass}
            />
          </Field>
        ))}
        <button type="button" className={greenBtn} onClick={() => saveContent(content).then(() => onOk('Settings saved')).catch(onError)}>
          Save settings
        </button>
      </Card>
    </div>
  )
}
