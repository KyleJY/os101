"use client";

import { useEffect, useMemo, useState } from "react";

const INITIAL_PROCESSES = Array.from({ length: 5 }, (_, index) => ({
  id: `P${index + 1}`,
  arrivalTime: "",
  burstTime: "",
}));

function calculateFcfs(processes) {
  const sorted = [...processes].sort((a, b) => {
    const arrivalA = Number(a.arrivalTime);
    const arrivalB = Number(b.arrivalTime);
    if (arrivalA !== arrivalB) {
      return arrivalA - arrivalB;
    }
    return Number(a.id.slice(1)) - Number(b.id.slice(1));
  });

  let currentTime = 0;
  const timeline = [];
  const metricsById = new Map();

  for (const process of sorted) {
    const arrival = Number(process.arrivalTime);
    const burst = Number(process.burstTime);

    if (currentTime < arrival) {
      timeline.push({
        label: "Idle",
        start: currentTime,
        end: arrival,
        duration: arrival - currentTime,
        idle: true,
      });
      currentTime = arrival;
    }

    const completionTime = currentTime + burst;
    const turnaroundTime = completionTime - arrival;
    const waitingTime = turnaroundTime - burst;

    timeline.push({
      label: process.id,
      start: currentTime,
      end: completionTime,
      duration: burst,
      idle: false,
    });

    metricsById.set(process.id, {
      ...process,
      completionTime,
      turnaroundTime,
      waitingTime,
    });

    currentTime = completionTime;
  }

  const metrics = processes.map((process) => metricsById.get(process.id));
  const averageTurnaroundTime =
    metrics.reduce((sum, item) => sum + item.turnaroundTime, 0) /
    metrics.length;
  const averageWaitingTime =
    metrics.reduce((sum, item) => sum + item.waitingTime, 0) / metrics.length;

  return { metrics, timeline, averageTurnaroundTime, averageWaitingTime };
}

export default function Home() {
  const [theme, setTheme] = useState("light");
  const [themeReady, setThemeReady] = useState(false);
  const [processes, setProcesses] = useState(INITIAL_PROCESSES);
  const [nextProcessNumber, setNextProcessNumber] = useState(
    INITIAL_PROCESSES.length + 1,
  );
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [brewRun, setBrewRun] = useState(0);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("coffee-scheduler-theme");
    const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    const nextTheme =
      storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : preferredTheme;

    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    setThemeReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady) {
      return;
    }
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("coffee-scheduler-theme", theme);
  }, [theme, themeReady]);

  const maxTimelineDuration = useMemo(() => {
    if (!results || results.timeline.length === 0) {
      return 1;
    }
    return results.timeline.reduce((sum, block) => sum + block.duration, 0);
  }, [results]);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
  }

  function handleInputChange(index, key, value) {
    setProcesses((previous) =>
      previous.map((process, processIndex) =>
        processIndex === index ? { ...process, [key]: value } : process,
      ),
    );
  }

  function handleAddProcess() {
    setProcesses((previous) => [
      ...previous,
      { id: `P${nextProcessNumber}`, arrivalTime: "", burstTime: "" },
    ]);
    setNextProcessNumber((previous) => previous + 1);
    setResults(null);
    setError("");
    setBrewRun(0);
  }

  function handleRemoveProcess(processId) {
    setProcesses((previous) => {
      if (previous.length <= 5) {
        return previous;
      }
      return previous.filter((process) => process.id !== processId);
    });
    setResults(null);
    setError("");
    setBrewRun(0);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const normalized = processes.map((process) => ({
      ...process,
      arrivalTime: process.arrivalTime.trim(),
      burstTime: process.burstTime.trim(),
    }));

    const hasInvalid = normalized.some((process) => {
      if (process.arrivalTime === "" || process.burstTime === "") {
        return true;
      }
      const arrival = Number(process.arrivalTime);
      const burst = Number(process.burstTime);
      return (
        Number.isNaN(arrival) ||
        Number.isNaN(burst) ||
        arrival < 0 ||
        burst <= 0
      );
    });

    if (hasInvalid) {
      setError(
        "Use non-negative arrival times and burst times greater than 0 for all processes.",
      );
      setResults(null);
      setBrewRun(0);
      return;
    }

    setError("");
    setResults(calculateFcfs(normalized));
    setBrewRun((previous) => previous + 1);
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-10">
      <div className="coffee-glow coffee-glow-top" />
      <div className="coffee-glow coffee-glow-bottom" />

      <header className="relative z-10 mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
            CPU Scheduling
          </p>
          <h1 className="font-display text-3xl text-[var(--foreground)] sm:text-4xl">
            Coffee Queue Planner
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)] sm:text-base">
            FCFS (First Come, First Served) simulation with completion,
            turnaround, and waiting times.
          </p>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:shadow-md"
        >
          {theme === "light" ? "Dark Roast" : "Light Roast"}
        </button>
      </header>

      <main className="relative z-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm sm:p-6">
          <h2 className="font-display text-2xl text-[var(--foreground)]">
            Process Inputs
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Enter at least 5 processes. Add more rows as needed.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
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
                      handleInputChange(
                        index,
                        "arrivalTime",
                        event.target.value,
                      )
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
                      handleInputChange(index, "burstTime", event.target.value)
                    }
                    placeholder="Burst Time"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveProcess(process.id)}
                    disabled={processes.length <= 5}
                    className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--panel-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {error ? (
              <p className="text-sm text-[var(--danger)]">{error}</p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleAddProcess}
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

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm sm:p-6">
          <h2 className="font-display text-2xl text-[var(--foreground)]">
            Execution Timeline
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Simple FCFS Gantt-style block view.
          </p>

          {results ? (
            <div
              key={brewRun}
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
      </main>

      <section className="relative z-10 mt-6 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm sm:p-6">
        <h2 className="font-display text-2xl text-[var(--foreground)]">
          Results
        </h2>

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
            Submit process values to see completion time, turnaround time,
            waiting time, and averages.
          </p>
        )}
      </section>
    </div>
  );
}
