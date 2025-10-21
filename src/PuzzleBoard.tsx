import type { CSSProperties, FC } from "react";

import {
  BOARD_SIZE,
  BLOCK_SIZE,
  SOLVED_BOARD,
} from "./puzzleConstants";
import {
  canSlideBlock,
  createBlockBackground,
  getBlockPosition,
} from "./utils/puzzleUtils";

type PuzzleBoardProps = {
  blocks: number[];
  emptyIndex: number;
  lastMovedBlock: number | null;
  onBlockClick: (index: number) => void;
};

const PuzzleBoard: FC<PuzzleBoardProps> = ({
  blocks,
  emptyIndex,
  lastMovedBlock,
  onBlockClick,
}) => (
  <div className="rounded-2xl bg-slate-900/60 border border-[#b199ff] p-4">
    <div className="relative" style={{ width: BOARD_SIZE, height: BOARD_SIZE }}>
      {blocks.map((value, index) => {
        if (value === 0) {
          return null;
        }

        const movable = canSlideBlock(emptyIndex, index);
        const { x, y } = getBlockPosition(index);
        const isBouncing = lastMovedBlock === value;
        const isCorrectPosition = value === SOLVED_BOARD[index];
        const backgroundStyle = createBlockBackground(value);

        const blockStyle: CSSProperties = {
          width: BLOCK_SIZE,
          height: BLOCK_SIZE,
          transform: `translate3d(${x}px, ${y}px, 0) scale(${
            isBouncing ? 1.05 : 1
          })`,
          transformOrigin: "center",
          transition:
            "transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 220ms ease",
          willChange: "transform",
          ...(backgroundStyle ?? {}),
        };

        const className = [
          "block absolute top-0 left-0 flex select-none items-center justify-center overflow-hidden rounded-xl shadow-md ring-1 ring-white/10 transition-[background-color,box-shadow,filter,opacity] duration-200",
          movable
            ? "cursor-pointer hover:shadow-xl hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-400"
            : "cursor-default opacity-70",
          isBouncing ? "shadow-xl" : "",
        ]
          .join(" ")
          .trim();

        return (
          <button
            key={value}
            type="button"
            aria-label={`move block ${value}`}
            onClick={() => onBlockClick(index)}
            disabled={!movable}
            className={className}
            data-correct={isCorrectPosition}
            style={blockStyle}
          >
            <span
              aria-hidden="true"
              className="text-xl font-semibold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
            >
              {value}
            </span>
            <span className="sr-only">Move block {value}</span>
          </button>
        );
      })}
    </div>
  </div>
);

export default PuzzleBoard;
