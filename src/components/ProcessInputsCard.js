import { MIN_PROCESS_COUNT } from "@/lib/scheduling";

export default function ProcessInputsCard({
  processes,
  error,
  onInputChange,
  onAddProcess,
  onRemoveProcess,
  onSubmit,
}) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm sm:p-6">
      <h2 className="font-display text-2xl text-[var(--foreground)]">
        Process Inputs
      </h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Enter at least {MIN_PROCESS_COUNT} processes. Add more rows as needed.
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div className="grid gap-3">
          {processes.map((process, index) => (
            <div
              key={process.id}
              className="grid grid-cols-1 gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-3 sm:grid-cols-[120px_1fr_1fr_auto]"
            >
              <label className="flex items-center text-sm font-semibold text-[var(--foreground)]">
                {process.id}
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={process.arrivalTime}
                onChange={(event) =>
                  onInputChange(index, "arrivalTime", event.target.value)
                }
                placeholder="Arrival Time"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
              />
              <input
                type="number"
                min="1"
                step="1"
                value={process.burstTime}
                onChange={(event) =>
                  onInputChange(index, "burstTime", event.target.value)
                }
                placeholder="Burst Time"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
              />
              <button
                type="button"
                onClick={() => onRemoveProcess(process.id)}
                disabled={processes.length <= MIN_PROCESS_COUNT}
                className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--panel-soft)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAddProcess}
            className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--panel-soft)]"
          >
            Add Process
          </button>
          <button
            type="submit"
            className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] transition hover:brightness-95"
          >
            Brew Schedule
          </button>
        </div>
      </form>
    </section>
  );
}
