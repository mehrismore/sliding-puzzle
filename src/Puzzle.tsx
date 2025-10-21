import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ConfettiOverlay from "./ConfettiOverlay";
import PuzzleBoard from "./PuzzleBoard";
import usePlacementSound from "./hooks/usePlacementSound";
import { SOLVED_BOARD } from "./puzzleConstants";
import {
  canSlideBlock,
  generateShuffledBoard,
  isSolvedBoard,
} from "./utils/puzzleUtils";

const Puzzle: React.FC = () => {
  const [initialBlocks, setInitialBlocks] = useState<number[]>(() =>
    generateShuffledBoard()
  );
  const [blocks, setBlocks] = useState<number[]>(initialBlocks);
  const [moves, setMoves] = useState(0);
  const [lastMovedBlock, setLastMovedBlock] = useState<number | null>(null);
  const emptyIndex = blocks.indexOf(0);
  const bounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playPlacementSound = usePlacementSound();

  const isSolved = useMemo(() => isSolvedBoard(blocks), [blocks]);

  // When a block is tapped, slide it into the gap and count the move.
  const handleBlockClick = (index: number) => {
    if (!canSlideBlock(emptyIndex, index)) return;

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

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6">
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-white">
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
        <PuzzleBoard
          blocks={blocks}
          emptyIndex={emptyIndex}
          lastMovedBlock={lastMovedBlock}
          onBlockClick={handleBlockClick}
        />
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
