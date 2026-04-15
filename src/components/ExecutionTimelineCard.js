export default function ExecutionTimelineCard({
  results,
  brewRun,
  maxTimelineDuration,
  algorithm,
  onAlgorithmChange,
}) {
  const nextAlgorithm = algorithm === "fcfs" ? "sjf" : "fcfs";
  const buttonLabel = algorithm === "fcfs" ? "FCFS" : "SJF";

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-[var(--foreground)]">
            Execution Timeline
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Switch between FCFS and SJF scheduling views.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onAlgorithmChange(nextAlgorithm)}
          className="algorithm-toggle-button rounded-full border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-1.5 text-sm font-semibold text-[var(--foreground)]"
        >
          {buttonLabel}
        </button>
      </div>

      {results ? (
        <div
          key={`${algorithm}-${brewRun}`}
          className="timeline-reveal mt-5 space-y-3 overflow-x-auto pb-1"
        >
          <div className="flex min-w-[460px] items-stretch gap-1 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-1">
            {results.timeline.map((block, index) => (
              <div
                key={`${block.label}-${index}`}
                style={{
                  width: `${(block.duration / maxTimelineDuration) * 100}%`,
                  animationDelay: `${index * 90}ms`,
                }}
                className={`timeline-block-reveal relative flex min-h-20 items-center justify-center rounded-lg px-2 text-sm font-semibold ${
                  block.idle
                    ? "bg-[var(--idle)] text-[var(--foreground)]"
                    : "bg-[var(--timeline-block)] text-[var(--accent-foreground)]"
                }`}
              >
                <span>{block.label}</span>
              </div>
            ))}
          </div>

          <div className="flex min-w-[460px] justify-between text-xs text-[var(--muted)]">
            {results.timeline.map((block, index) => (
              <div key={`tick-${index}`} className="text-left">
                {block.start}
              </div>
            ))}
            <div className="text-right">
              {results.timeline.at(-1)?.end ?? 0}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-5 rounded-xl border border-dashed border-[var(--border)] bg-[var(--panel-soft)] p-4 text-sm text-[var(--muted)]">
          Timeline appears after calculating the schedule.
        </p>
      )}
    </section>
  );
}
