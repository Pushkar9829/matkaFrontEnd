export default function LoginSuccessModal({ open, onOk }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center px-6 text-center">
        <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full border-[6px] border-[#c8ecc8]">
          <svg viewBox="0 0 24 24" className="h-14 w-14 text-[#7ed37e]" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M6 12.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="mb-8 text-3xl font-medium text-[#555]">Login Successfully</h2>
        <button
          type="button"
          onClick={onOk}
          className="min-w-[88px] rounded-lg bg-[#6c5ce7] px-6 py-3 text-lg font-medium text-white shadow-sm hover:bg-[#5b4cdb]"
        >
          OK
        </button>
      </div>
    </div>
  )
}
