export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-brand-beige">
      <div className="flex-1 bg-gradient-to-br from-brand-navy to-brand-teal flex flex-col items-center justify-center text-white p-10 relative hidden md:flex">
        <div className="absolute top-8 left-8 text-2xl font-bold tracking-wider">
          PATHWAYS
        </div>
        <h1 className="text-4xl font-bold mb-4">Cooperative Training</h1>
        <p className="text-xl text-brand-sky text-center max-w-md">
          Bridging the gap between academic knowledge and field experience.
        </p>
      </div>
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
