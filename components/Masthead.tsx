type MastheadProps = {
  date: string;
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

export default function Masthead({ date }: MastheadProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center border-b border-gray-200">
      <a href="/" className="inline-block group">
        <h1
          className="font-serif text-3xl sm:text-4xl tracking-tight text-gray-900 group-hover:text-gray-600 transition-colors"
          style={{ letterSpacing: "-0.02em" }}
        >
          IURA&apos;S DAILY DIGEST
        </h1>
      </a>
      <p
        className="font-sans text-xs text-gray-500 mt-2"
        style={{ letterSpacing: "0.15em", textTransform: "uppercase" }}
      >
        {formatDate(date)}
      </p>
    </div>
  );
}
