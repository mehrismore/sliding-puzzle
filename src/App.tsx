import Puzzle from "./Puzzle";

const App: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-hidden red">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),transparent_60%)]" />
      <main className="relative z-10 mx-auto flex min-h-screen max-w-5xl items-center justify-center p-4 sm:p-10">
        <Puzzle />
      </main>
    </div>
  );
};

export default App;
