const tabs = [
  { id: 'home', label: 'Home', icon: 'bi-house-door-fill' },
  { id: 'play', label: 'Play', icon: 'bi-controller' },
  { id: 'wallet', label: 'Wallet', icon: 'bi-wallet2' },
  { id: 'help', label: 'Help', icon: 'help' },
]

export default function BottomNav({ tab, onChange }) {
  return (
    <nav className="bottom-nav">
      {tabs.map((item) => {
        const active = tab === item.id
        const isHelp = item.id === 'help'
        const chip = active && (item.id === 'play' || item.id === 'wallet')

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`bottom-nav-item${isHelp ? ' is-help' : ''}${active ? ' is-active' : ''}${chip ? ' is-chip' : ''}`}
          >
            {chip ? (
              <span className="bottom-nav-chip">
                <i className={`bi ${item.icon}`} />
              </span>
            ) : isHelp ? (
              <span className="bottom-nav-help">?</span>
            ) : (
              <i className={`bi ${item.icon}`} />
            )}
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
