import { useEffect, useState } from 'react'
import { listenContent } from '../../api/api'

export default function TermsPage() {
  const [content, setContent] = useState({})
  useEffect(() => listenContent(setContent), [])
  const terms = content.terms?.length
    ? content.terms
    : [
        '1. 10000 इंटू की जोड़ी लगेगी मैक्सिमम',
        '2. 20000 इंटू का हरूफ़ लगेगा मैक्सिमम',
        '3. 2000 इंटू की क्रॉसिंग लगेगी मैक्सिमम',
        '4. रिजल्ट एप्लिकेशन में अपडेट होते ही आपका पैसा आपके एप्लिकेशन के वॉलेट में आ जाएगा',
        '5. कभी भी पैसा एड कर सकते हैं एप्लीकेशन में',
        '6. पैसा निकालने का समय सुबह 10 बजे से रात के 10 बजे तक हैं',
        '7. WITHDRAW REQUEST डालते ही 5 से 10 मिनट के अंदर पैसा आपके अकाउंट में आ जाएगा',
        '8. अगर आपको किसी भी प्रकार की समस्या होती है तो आप चैट कर सकते है',
      ]

  return (
    <div className="min-h-[70vh] bg-white">
      <div className="bg-[#f5d000] px-3 py-2 text-center text-sm font-bold text-green-700 sm:py-3 sm:text-xl">
        ✨ RPK90 TERMS AND CONDITION ✨
      </div>
      <div className="space-y-4 px-4 py-5 sm:px-6">
        {terms.map((term) => (
          <p key={term} className="text-[13px] leading-relaxed text-black sm:text-[15px]">🔥 {term}</p>
        ))}
      </div>
    </div>
  )
}
