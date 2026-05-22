export default function AdminPlaceholder({ title, description, icon = "🚧" }) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="card text-center py-16 px-6">
        <div className="text-4xl mb-4">{icon}</div>
        <h2 className="text-xl sm:text-2xl font-semibold text-[var(--dark)]">{title}</h2>
        <p className="text-sm text-AppGray mt-3 max-w-md mx-auto">{description}</p>
      </div>
    </div>
  );
}
