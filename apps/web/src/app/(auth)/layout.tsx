export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-4"
      style={{
        background: 'linear-gradient(135deg, #0f0a2e 0%, #1a1145 25%, #2d1b69 50%, #1a1145 75%, #0f0a2e 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
      }}
    >
      {/* Floating game emojis */}
      {['🎡', '🎰', '🎁', '⭐', '🎉', '🏆'].map((emoji, i) => (
        <span
          key={i}
          className="pointer-events-none absolute"
          style={{
            fontSize: `${1.5 + (i % 3) * 0.5}rem`,
            opacity: 0.06,
            top: `${10 + i * 15}%`,
            left: `${5 + i * 16}%`,
            animation: `subtleFloat ${4 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.7}s`,
          }}
        >
          {emoji}
        </span>
      ))}

      <div className="relative z-10 w-full max-w-4xl">{children}</div>
    </div>
  )
}
