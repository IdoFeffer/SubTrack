export default function ErrorBanner({ onRetry }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5 bg-[#fff1f2] border border-[#fecdd3]">
      <p className="m-0 text-sm font-medium text-[#9f1239]">לא הצלחנו לטעון את המנויים</p>
      <button
        onClick={onRetry}
        className="text-sm font-semibold rounded-lg px-3 py-1.5 text-white bg-[#e11d48] shrink-0"
      >
        נסה שוב
      </button>
    </div>
  );
}
