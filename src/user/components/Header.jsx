export default function Header({ title, points, unreadCount = 0, menuBadge = 0, onMenu, onBell }) {
  return (
    <div className="header-top">
      <div className="header-top-inner">
        <button type="button" className="header-menu-btn" onClick={onMenu} aria-label="Open menu">
          <i className="bi bi-list" />
          {menuBadge > 0 && <span className="badge text-center header-menu-badge">{menuBadge}</span>}
        </button>

        <div className="word_wrap_header">{title}</div>

        <div className="header-points">
          <span className="points">Points :</span>
          <span className="expenseAmtt">{points}</span>
        </div>

        <button type="button" onClick={onBell} className="buttonpage" aria-label="Notifications">
          <i className="bi bi-bell-fill text-white" />
          {unreadCount > 0 && (
            <span className="badge notibadge text-center">
              <span>{unreadCount}</span>
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
