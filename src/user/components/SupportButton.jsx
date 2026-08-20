import support from '../../assets/support.png'

export default function SupportButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open support form"
      className="fixed right-3 bottom-6 z-40 transition hover:scale-105 sm:right-5"
    >
      <img src={support} alt="Support" className="h-[78px] w-[78px] object-contain drop-shadow-lg" />
    </button>
  )
}
