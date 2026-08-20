import { useEffect, useState } from 'react'
import logo from '../../assets/logo.png'
import { listenContent } from '../../api/api'

export default function AppDetailsPage() {
  const [content, setContent] = useState({})
  useEffect(() => listenContent(setContent), [])
  const details = [
    { label: 'TM Application', value: content.details?.tmApplication || '369852114785' },
    { label: 'ARN Number', value: content.details?.arnNumber || '369852115623' },
    { label: 'Provisional ID', value: content.details?.provisionalId || '369852119027' },
  ]

  return (
    <div className="app-details">
      <div className="app-details-logo-wrap">
        <img src={logo} alt="RPK 90" className="app-details-logo" />
      </div>
      <div className="app-details-list">
        {details.map((item) => (
          <div key={item.label} className="app-details-card">
            {item.label}:{item.value}
          </div>
        ))}
      </div>
    </div>
  )
}
