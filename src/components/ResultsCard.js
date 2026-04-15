export default function ResultsCard({ results, algorithm }) {
  return (
    <section className="relative z-10 mt-6 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-display text-2xl text-[var(--foreground)]">
          Results
        </h2>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          {algorithm.toUpperCase()} Mode
        </p>
      </div>

      {results ? (
        <div className="mt-4 space-y-4">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                  <th className="px-3 py-2 font-semibold">Process</th>
                  <th className="px-3 py-2 font-semibold">Arrival</th>
                  <th className="px-3 py-2 font-semibold">Burst</th>
                  <th className="px-3 py-2 font-semibold">Completion</th>
                  <th className="px-3 py-2 font-semibold">Turnaround</th>
                  <th className="px-3 py-2 font-semibold">Waiting</th>
                </tr>
              </thead>
              <tbody>
                {results.metrics.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[var(--border)]/70"
                  >
                    <td className="px-3 py-2 font-semibold">{item.id}</td>
                    <td className="px-3 py-2">{item.arrivalTime}</td>
                    <td className="px-3 py-2">{item.burstTime}</td>
                    <td className="px-3 py-2">{item.completionTime}</td>
                    <td className="px-3 py-2">{item.turnaroundTime}</td>
                    <td className="px-3 py-2">{item.waitingTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                Average Turnaround Time
              </p>
              <p className="mt-1 font-display text-3xl text-[var(--foreground)]">
                {results.averageTurnaroundTime.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                Average Waiting Time
              </p>
              <p className="mt-1 font-display text-3xl text-[var(--foreground)]">
                {results.averageWaitingTime.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--panel-soft)] p-4 text-sm text-[var(--muted)]">
          Submit process values to see completion time, turnaround time, waiting
          time, and averages.
        </p>
      )}
    </section>
  );
}
