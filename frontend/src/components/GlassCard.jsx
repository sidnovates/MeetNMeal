export default function GlassCard({ children, className = "" }) {
  const widthClass = className.includes('max-w') ? '' : 'max-w-xl';
  return (
    <div className={`w-full ${widthClass} rounded-3xl bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl p-6 ${className}`}>
      {children}
    </div>
  );
}
