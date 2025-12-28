export default function Background({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-300 via-orange-400 to-pink-400 px-4">
      {children}
    </div>
  );
}
