import type { FC } from "react";

type ConfettiOverlayProps = {
  show: boolean;
  moves: number;
};

const ConfettiOverlay: FC<ConfettiOverlayProps> = ({ show, moves }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-3xl px-6">
      <div className="flex flex-col items-center gap-1 rounded-2xl bg-[#b199ff] px-6 py-4 text-center shadow-2xl ring-1 ring-white/15 backdrop-blur">
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
          Puzzle complete
        </span>
        <p className="text-xl font-semibold text-white">
          You solved it in {moves} moves!
        </p>
      </div>
    </div>
  );
};

export default ConfettiOverlay;
