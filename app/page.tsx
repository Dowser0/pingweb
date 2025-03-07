import MainMenu from '@/components/MainMenu';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-black p-4">
      <div className="relative flex flex-col items-center">
        <h1 className="mb-8 text-6xl font-bold text-white">PingWeb</h1>
        <MainMenu />
      </div>
    </main>
  );
} 