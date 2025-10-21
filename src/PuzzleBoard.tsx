import type { CSSProperties, FC } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  BLOCK_GAP,
  DEFAULT_BLOCK_SIZE,
  BOARD_HORIZONTAL_PADDING,
  BOARD_MAX_EDGE,
  MAX_BLOCK_SIZE,
  MIN_BLOCK_SIZE,
  SOLVED_BOARD,
  GRID_SIZE,
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
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [blockSize, setBlockSize] = useState(DEFAULT_BLOCK_SIZE);
  const [boardSize, setBoardSize] = useState(
    GRID_SIZE * DEFAULT_BLOCK_SIZE + (GRID_SIZE - 1) * BLOCK_GAP
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const calculateSizes = () => {
      const { width } = container.getBoundingClientRect();
      const cappedWidth = Math.min(width, BOARD_MAX_EDGE);
      const availableWidth = Math.max(
        cappedWidth - BOARD_HORIZONTAL_PADDING,
        MIN_BLOCK_SIZE * GRID_SIZE + (GRID_SIZE - 1) * BLOCK_GAP
      );
      const rawBlockSize =
        (availableWidth - (GRID_SIZE - 1) * BLOCK_GAP) / GRID_SIZE;

      const nextBlockSize = Math.max(
        MIN_BLOCK_SIZE,
        Math.min(MAX_BLOCK_SIZE, Math.floor(rawBlockSize))
      );
      const nextBoardSize =
        nextBlockSize * GRID_SIZE + (GRID_SIZE - 1) * BLOCK_GAP;

      setBlockSize(nextBlockSize);
      setBoardSize(nextBoardSize);
    };

    // Track container size so the puzzle scales with the viewport.
    if (typeof ResizeObserver === "undefined") {
      calculateSizes();
      window.addEventListener("resize", calculateSizes);
      return () => window.removeEventListener("resize", calculateSizes);
    }

    const resizeObserver = new ResizeObserver(calculateSizes);
    calculateSizes();
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  const labelFontSize = useMemo(
    () => Math.max(18, Math.round(blockSize * 0.33)),
    [blockSize]
  );

  return (
    <div
      ref={containerRef}
      className="flex w-full items-center justify-center rounded-2xl p-4"
      style={{
        maxWidth: "min(92vw, 520px)",
        backgroundColor: "#ffffff",
        border: "1px solid #b199ff",
      }}
    >
      <div
        className="relative"
        style={{ width: boardSize, height: boardSize }}
      >
        {blocks.map((value, index) => {
          if (value === 0) {
            return null;
          }

          const movable = canSlideBlock(emptyIndex, index);
          const { x, y } = getBlockPosition(index, blockSize);
          const isBouncing = lastMovedBlock === value;
          const isCorrectPosition = value === SOLVED_BOARD[index];
          const backgroundStyle = createBlockBackground(value);

          const blockStyle: CSSProperties = {
            width: blockSize,
            height: blockSize,
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
                className="font-semibold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
                style={{ fontSize: labelFontSize }}
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
};

export default PuzzleBoard;
