export default function Header({ title, points, unreadCount = 0, onMenu, onBell }) {
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between bg-[#d7b54a] px-5 text-white">
      <button type="button" onClick={onMenu} aria-label="Open menu" className="p-1">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </svg>
      </button>

      <h1 className="text-[17px] font-normal">{title}</h1>

      <span className="text-[15px]">Points :{points}</span>

      <button type="button" onClick={onBell} aria-label="Notifications" className="relative p-1">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 9a6 6 0 1112 0c0 3.5 1.5 5.5 1.5 5.5H4.5S6 12.5 6 9z" strokeLinejoin="round" />
          <path d="M10 18.5a2 2 0 004 0" strokeLinecap="round" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount}
          </span>
        )}
      </button>
    </header>
  )
}
