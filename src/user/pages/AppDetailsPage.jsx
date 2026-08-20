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
    <div className="min-h-[70vh] bg-[#e8eef4] px-3 py-8">
      <div className="mb-8 flex justify-center">
        <img src={logo} alt="RPK 90" className="h-28 w-28 object-contain drop-shadow-xl sm:h-32 sm:w-32" />
      </div>
      <div className="space-y-3">
        {details.map((item) => (
          <div key={item.label} className="rounded-md bg-white py-3 text-center text-sm text-neutral-800 shadow-sm">
            {item.label}:{item.value}
          </div>
        ))}
      </div>
    </div>
  )
}
