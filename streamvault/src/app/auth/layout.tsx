export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <span className="text-5xl text-white tracking-wider" style={{ fontFamily: "var(--font-display)" }}>
            STREAM<span style={{ color: "#E50914" }}>VAULT</span>
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}