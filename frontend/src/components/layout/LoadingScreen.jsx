export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-base overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="glow-orb w-72 h-72 bg-accent/30 top-1/4 -left-10" />
      <div className="glow-orb w-72 h-72 bg-accent/20 bottom-1/4 -right-10" style={{ animationDelay: '1s' }} />

      <div className="relative flex flex-col items-center gap-6">
        {/* Pulsing logo mark with orbiting ring */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <span className="absolute inset-0 rounded-2xl border-2 border-accent/30 animate-ping" style={{ animationDuration: '1.6s' }} />
          <span className="absolute -inset-2 rounded-3xl border border-accent/20 animate-spin" style={{ animationDuration: '3s' }} />
          <div className="relative w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-white shadow-[0_8px_30px_rgba(232,160,48,0.35)] animate-fade-in-up">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
        </div>

        {/* Wordmark */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-text-primary">
            Hustl
          </span>
          {/* Animated progress bar */}
          <div className="w-32 h-1 rounded-full bg-surface-raised overflow-hidden">
            <div className="h-full w-1/2 rounded-full bg-accent animate-loading-sweep" />
          </div>
        </div>
      </div>
    </div>
  );
}
