type MastheadProps = {
  date: string;
  issueNumber: number;
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Masthead({ date, issueNumber }: MastheadProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
      <a href="/" className="inline-block group">
        <h1
          className="font-serif text-2xl sm:text-3xl tracking-tight text-ink group-hover:text-red transition-colors"
          style={{ letterSpacing: "-0.01em" }}
        >
          IURA&apos;S DAILY DIGEST
        </h1>
      </a>
      <p
        className="font-sans text-xs text-muted mt-1"
        style={{ letterSpacing: "0.1em", textTransform: "uppercase" }}
      >
        {formatDate(date)}&ensp;&mdash;&ensp;Issue #{issueNumber}
      </p>
    </div>
  );
}
