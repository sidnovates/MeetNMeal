export default function GlassCard({ children }) {
  return (
    <div className="w-full max-w-xl rounded-3xl bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl p-6">
      {children}
    </div>
  );
}
