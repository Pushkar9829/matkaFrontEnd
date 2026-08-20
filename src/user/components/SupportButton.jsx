import support from '../../assets/support.png'

export default function SupportButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open support form"
      className="fixed right-3 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 transition hover:scale-105 sm:right-5 sm:bottom-6"
    >
      <img src={support} alt="Support" className="h-[68px] w-[68px] object-contain drop-shadow-lg sm:h-[78px] sm:w-[78px]" />
    </button>
  )
}
