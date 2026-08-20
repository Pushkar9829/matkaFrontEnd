export default function PlaceholderPage({ title }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-[#eef3f8] p-6 text-center">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-800">{title}</h2>
        <p className="mt-2 text-neutral-500">This screen will be added next.</p>
      </div>
    </div>
  )
}
