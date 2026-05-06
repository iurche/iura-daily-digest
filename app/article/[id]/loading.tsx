export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg)] pt-24 px-5 md:px-10">
      <div className="max-w-[800px] mx-auto">
        <div className="animate-pulse flex flex-col gap-8">
          <div className="h-4 w-32 bg-[var(--surface-2)] rounded"></div>
          <div className="h-12 w-full bg-[var(--surface-2)] rounded"></div>
          <div className="h-6 w-3/4 bg-[var(--surface-2)] rounded"></div>
          <div className="space-y-4 pt-12">
            <div className="h-4 w-full bg-[var(--surface-2)] rounded"></div>
            <div className="h-4 w-full bg-[var(--surface-2)] rounded"></div>
            <div className="h-4 w-5/6 bg-[var(--surface-2)] rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
