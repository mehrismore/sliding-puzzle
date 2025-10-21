import { useMemo } from "react";

const CONFETTI_COLORS = ["#f87171", "#facc15", "#34d399", "#60a5fa", "#c084fc"];
const CONFETTI_COUNT = 20;

type ConfettiPiece = {
  left: number;
  delay: number;
  duration: number;
  color: string;
  width: number;
  height: number;
};

type ConfettiOverlayProps = {
  show: boolean;
  moves: number;
};

const ConfettiOverlay: React.FC<ConfettiOverlayProps> = ({ show, moves }) => {
  const pieces = useMemo<ConfettiPiece[]>(() => {
    if (!show) return [];
    return Array.from({ length: CONFETTI_COUNT }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 2.4 + Math.random(),
      color:
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      width: 8 + Math.random() * 8,
      height: 12 + Math.random() * 10,
    }));
  }, [show]);

  if (!show) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 rounded-3xl">
      <div className="confetti-layer absolute inset-0 overflow-hidden">
        {pieces.map((piece, index) => (
          <span
            key={`confetti-${index}`}
            className="confetti-piece"
            style={{
              left: `${piece.left}%`,
              width: piece.width,
              height: piece.height,
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-1 rounded-2xl bg-[#141317]/95 px-6 py-4 text-center shadow-2xl ring-1 ring-white/15 backdrop-blur">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
            Puzzle complete
          </span>
          <p className="text-xl font-semibold text-white">
            You solved it in {moves} moves!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfettiOverlay;
