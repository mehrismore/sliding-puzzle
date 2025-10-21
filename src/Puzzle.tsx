/* Todos:
- clean up this file; separate big functions into separate files
- make the image reusable
- think of efficiency
- think of better aesthetics */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ConfettiOverlay from "./ConfettiOverlay";

const GRID_SIZE = 3;
const BLOCK_COUNT = GRID_SIZE * GRID_SIZE;
const SOLVED_BOARD = Array.from({ length: BLOCK_COUNT }, (_, index) =>
  index === BLOCK_COUNT - 1 ? 0 : index + 1
);
const DOG_IMAGE_URL = "/dog.jpg";
const BLOCK_SIZE = 72;
const BLOCK_GAP = 12;
const BOARD_SIZE = GRID_SIZE * BLOCK_SIZE + (GRID_SIZE - 1) * BLOCK_GAP;

// Find the neighbors directly above, below, left, and right of this index.
const getNeighborIndices = (index: number) => {
  const neighbors: number[] = [];
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;

  if (row > 0) neighbors.push(index - GRID_SIZE);
  if (row < GRID_SIZE - 1) neighbors.push(index + GRID_SIZE);
  if (col > 0) neighbors.push(index - 1);
  if (col < GRID_SIZE - 1) neighbors.push(index + 1);

  return neighbors;
};

// Mix up the grid with random valid moves; if it ends up solved, shuffle again.
const generateShuffledBoard = () => {
  const board = [...SOLVED_BOARD];
  for (let iteration = 0; iteration < 200; iteration += 1) {
    const emptyIndex = board.indexOf(0);
    const neighbors = getNeighborIndices(emptyIndex);
    const swapIndex = neighbors[Math.floor(Math.random() * neighbors.length)];
    [board[emptyIndex], board[swapIndex]] = [
      board[swapIndex],
      board[emptyIndex],
    ];
  }
  const solved = board.every((value, index) => value === SOLVED_BOARD[index]);
  if (solved) {
    return generateShuffledBoard();
  }
  return board;
};

// Give each block the slice of the picture it should display.
const createBlockBackground = (value: number) => {
  if (value === 0) return undefined;

  const solvedIndex = value - 1;
  const row = Math.floor(solvedIndex / GRID_SIZE);
  const col = solvedIndex % GRID_SIZE;
  const denominator = GRID_SIZE - 1;

  const backgroundPositionX =
    denominator === 0 ? "50%" : `${(col / denominator) * 100}%`;
  const backgroundPositionY =
    denominator === 0 ? "50%" : `${(row / denominator) * 100}%`;

  return {
    backgroundImage: `url(${DOG_IMAGE_URL})`,
    backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
    backgroundPosition: `${backgroundPositionX} ${backgroundPositionY}`,
    backgroundRepeat: "no-repeat",
  };
};

const Puzzle: React.FC = () => {
  const [initialBlocks, setInitialBlocks] = useState<number[]>(() =>
    generateShuffledBoard()
  );
  const [blocks, setBlocks] = useState<number[]>(initialBlocks);
  const [moves, setMoves] = useState(0);
  const [lastMovedBlock, setLastMovedBlock] = useState<number | null>(null);
  const emptyIndex = blocks.indexOf(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const bounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSolved = useMemo(
    () => blocks.every((value, index) => value === SOLVED_BOARD[index]),
    [blocks]
  );

  // Play a quick "ding" every time a block locks into its right spot.
  const playPlacementSound = useCallback(() => {
    if (typeof window === "undefined") return;

    const AudioContextClass =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) return;

    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new AudioContextClass();
      } catch {
        return;
      }
    }

    const context = audioContextRef.current;
    if (!context) return;
    const playTone = (ctx: AudioContext) => {
      const duration = 0.18;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration
      );

      oscillator.connect(gainNode).connect(ctx.destination);

      const startTime = ctx.currentTime + 0.02;
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    if (context.state === "suspended") {
      context
        .resume()
        .then(() => playTone(context))
        .catch(() => {});
      return;
    }

    playTone(context);
  }, []);

  const canSlideBlock = (index: number) =>
    getNeighborIndices(emptyIndex).includes(index);

  // When a block is tapped, slide it into the gap and count the move.
  const handleBlockClick = (index: number) => {
    if (!canSlideBlock(index)) return;

    const movingBlockValue = blocks[index];
    const previousBlocks = blocks;
    const nextBoard = [...previousBlocks];
    const currentEmptyIndex = emptyIndex;

    [nextBoard[currentEmptyIndex], nextBoard[index]] = [
      nextBoard[index],
      nextBoard[currentEmptyIndex],
    ];

    const shouldPlayPlacementSound = nextBoard.some((value, position) => {
      if (value === 0) return false;
      const nowCorrect = value === SOLVED_BOARD[position];
      const wasCorrect = previousBlocks[position] === SOLVED_BOARD[position];
      return nowCorrect && !wasCorrect;
    });

    setBlocks(nextBoard);
    setLastMovedBlock(movingBlockValue);

    if (bounceTimeoutRef.current) {
      clearTimeout(bounceTimeoutRef.current);
    }
    bounceTimeoutRef.current = setTimeout(() => {
      setLastMovedBlock(null);
    }, 320);

    if (shouldPlayPlacementSound) {
      playPlacementSound();
    }

    setMoves((previousMoves) => previousMoves + 1);
  };

  // Put everything back to the current shuffle and reset the move count.
  const resetBoard = useCallback(() => {
    if (bounceTimeoutRef.current) {
      clearTimeout(bounceTimeoutRef.current);
      bounceTimeoutRef.current = null;
    }
    setBlocks([...initialBlocks]);
    setMoves(0);
    setLastMovedBlock(null);
  }, [initialBlocks]);

  // Create a fresh scramble and remember it so reset can bring it back.
  const shuffleBoard = useCallback(() => {
    if (bounceTimeoutRef.current) {
      clearTimeout(bounceTimeoutRef.current);
      bounceTimeoutRef.current = null;
    }
    const newBoard = generateShuffledBoard();
    setInitialBlocks(newBoard);
    setBlocks(newBoard);
    setMoves(0);
    setLastMovedBlock(null);
  }, []);

  useEffect(
    () => () => {
      if (bounceTimeoutRef.current) {
        clearTimeout(bounceTimeoutRef.current);
      }
    },
    []
  );

  const getBlockPosition = (index: number) => {
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    return {
      x: col * (BLOCK_SIZE + BLOCK_GAP),
      y: row * (BLOCK_SIZE + BLOCK_GAP),
    };
  };

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6">
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
          FreeDay AI presents!
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Sliding Puzzle
        </h1>
        <p className="mt-3 text-sm text-purple-300 sm:text-base">
          Slide blocks into place to restore the ordered grid. Adjacent blocks
          swap with the empty space. Let's see if you solve it in the fewest
          moves! :D
        </p>
      </header>

      <div className="relative">
        <div className="rounded-2xl bg-slate-900/60 border border-[#b199ff] p-4">
          <div
            className="relative"
            style={{ width: BOARD_SIZE, height: BOARD_SIZE }}
          >
            {blocks.map((value, index) => {
              if (value === 0) {
                return null;
              }

              const movable = canSlideBlock(index);
              const { x, y } = getBlockPosition(index);
              const isBouncing = lastMovedBlock === value;
              const isCorrectPosition = value === SOLVED_BOARD[index];
              const backgroundStyle = createBlockBackground(value);
              const blockStyle = {
                width: BLOCK_SIZE,
                height: BLOCK_SIZE,
                transform: `translate3d(${x}px, ${y}px, 0) scale(${
                  isBouncing ? 1.05 : 1
                })`,
                transformOrigin: "center",
                transition:
                  "transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 220ms ease",
                willChange: "transform",
              };

              if (backgroundStyle) {
                Object.assign(blockStyle, backgroundStyle);
              }

              return (
                <button
                  key={value}
                  type="button"
                  aria-label={`move block ${value}`}
                  onClick={() => handleBlockClick(index)}
                  disabled={!movable}
                  className={[
                    "block absolute top-0 left-0 flex select-none items-center justify-center overflow-hidden rounded-xl shadow-md ring-1 ring-white/10 transition-[background-color,box-shadow,filter,opacity] duration-200",
                    movable
                      ? "cursor-pointer hover:shadow-xl hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-400"
                      : "cursor-default opacity-70",
                    isBouncing ? "shadow-xl" : "",
                  ]
                    .join(" ")
                    .trim()}
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

        <ConfettiOverlay show={isSolved && moves > 0} moves={moves} />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={shuffleBoard}
          className="rounded-full border border-transparent bg-[#97fbb4] px-8 py-3 text-sm font-bold text-[#0e0e0e] transition hover:bg-[#3d00ff] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635aff]"
        >
          Shuffle
        </button>
        <button
          type="button"
          onClick={resetBoard}
          disabled={moves === 0}
          className="rounded-full border border-white bg-[#0e0e0e] px-8 py-3 text-sm font-bold text-white transition hover:bg-[#3d00ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635aff] hover:border-[#635aff] hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-[#1f1d23] disabled:text-slate-500 disabled:hover:bg-[#1f1d23] disabled:hover:text-slate-500"
        >
          Reset
        </button>
        <span className="text-sm text-slate-400">Moves: {moves}</span>
      </div>
    </section>
  );
};

export default Puzzle;
