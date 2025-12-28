export default function PrimaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl bg-primary py-4 text-white font-semibold text-lg shadow-lg hover:scale-[1.02] transition"
    >
      {children}
    </button>
  );
}
