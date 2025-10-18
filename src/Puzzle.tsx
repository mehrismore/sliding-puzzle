import { useCallback, useMemo, useState } from "react";

const GRID_SIZE = 3;
const TILE_COUNT = GRID_SIZE * GRID_SIZE;
const SOLVED_BOARD = Array.from({ length: TILE_COUNT }, (_, index) =>
  index === TILE_COUNT - 1 ? 0 : index + 1
);

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
  return board;
};

const Puzzle: React.FC = () => {
  const [tiles, setTiles] = useState<number[]>(() => generateShuffledBoard());
  const [moves, setMoves] = useState(0);

  // const emptyIndex = tiles.indexOf(0);
  const isSolved = useMemo(
    () => tiles.every((value, index) => value === SOLVED_BOARD[index]),
    [tiles]
  );

  // const canSlide = (index: number) =>
  //   getNeighborIndices(emptyIndex).includes(index);

  // const handleTileClick = (index: number) => {
  //   if (!canSlide(index)) return;

  //   setTiles((previousTiles) => {
  //     const nextBoard = [...previousTiles];
  //     const currentEmptyIndex = previousTiles.indexOf(0);
  //     [nextBoard[currentEmptyIndex], nextBoard[index]] = [
  //       nextBoard[index],
  //       nextBoard[currentEmptyIndex],
  //     ];
  //     return nextBoard;
  //   });

  //   setMoves((previousMoves) => previousMoves + 1);
  // };

  const resetBoard = useCallback(() => {
    setTiles([...SOLVED_BOARD]);
    setMoves(0);
  }, []);

  const shuffleBoard = useCallback(() => {
    setTiles(generateShuffledBoard());
    setMoves(0);
  }, []);

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6">
      {/* <header className="text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Brain teaser</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Sliding Puzzle
        </h1>
        <p className="mt-3 text-sm text-slate-300 sm:text-base">
          Slide tiles into place to restore the ordered grid. Adjacent tiles swap with the empty
          space. Can you solve it in the fewest moves?
        </p>
      </header> */}

      <div className="relative">
        {/* <div className="grid grid-cols-4 gap-3 rounded-3xl bg-slate-900/70 p-6 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.65)] backdrop-blur">
          {tiles.map((value, index) => {
            const isEmpty = value === 0;
            const movable = !isEmpty && canSlide(index);
            const tileClasses = [
              "relative flex aspect-square items-center justify-center rounded-2xl text-2xl font-semibold transition-all duration-150 sm:text-3xl",
              isEmpty
                ? "bg-slate-800/20"
                : "bg-gradient-to-br from-slate-200 to-slate-100 text-slate-900 shadow-lg shadow-slate-900/30",
              movable
                ? "cursor-pointer hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-400"
                : "cursor-default",
              isEmpty ? "opacity-0 pointer-events-none" : "",
            ]
              .join(" ")
              .trim();

            return (
              <button
                key={isEmpty ? "empty" : value}
                type="button"
                aria-label={isEmpty ? "empty tile" : `move tile ${value}`}
                onClick={() => handleTileClick(index)}
                disabled={!movable}
                className={tileClasses}
              >
                {!isEmpty && <span>{value}</span>}
              </button>
            );
          })}
        </div> */}
        <div className="grid grid-cols-3 gap-3 w-64 rounded-2xl bg-slate-900/60 p-4">
          {tiles.map((tile, index) => (
            <div
              key={index}
              className={`flex aspect-square items-center justify-center rounded-xl text-2xl font-semibold ${
                tile === null
                  ? "bg-slate-900/0"
                  : "bg-gradient-to-br from-slate-200 to-white text-slate-900 shadow-md"
              }`}
            >
              {tile}
            </div>
          ))}
        </div>

        {isSolved && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-3xl bg-sky-500/10 ring-2 ring-sky-400/80 ring-offset-4 ring-offset-slate-900/70">
            <p className="text-lg font-medium text-sky-200">
              Solved in {moves} moves!
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={shuffleBoard}
          className="rounded-full bg-sky-400 px-6 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
        >
          Shuffle
        </button>
        <button
          type="button"
          onClick={resetBoard}
          disabled={isSolved}
          className="rounded-full border border-slate-700 px-6 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
        >
          Reset
        </button>
        <span className="text-sm text-slate-400">Moves: {moves}</span>
      </div>
    </section>
  );
};

export default Puzzle;
