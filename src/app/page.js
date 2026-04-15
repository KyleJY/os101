"use client";

import { useEffect, useMemo, useState } from "react";
import ExecutionTimelineCard from "@/components/ExecutionTimelineCard";
import ProcessInputsCard from "@/components/ProcessInputsCard";
import ResultsCard from "@/components/ResultsCard";
import {
  INITIAL_PROCESSES,
  calculateSchedule,
  normalizeProcesses,
  validateProcesses,
} from "@/lib/scheduling";

function getInitialTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem("coffee-scheduler-theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function Home() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [algorithm, setAlgorithm] = useState("fcfs");
  const [processes, setProcesses] = useState(INITIAL_PROCESSES);
  const [nextProcessNumber, setNextProcessNumber] = useState(
    INITIAL_PROCESSES.length + 1,
  );
  const [submittedProcesses, setSubmittedProcesses] = useState(null);
  const [error, setError] = useState("");
  const [brewRun, setBrewRun] = useState(0);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("coffee-scheduler-theme", theme);
  }, [theme]);

  const results = useMemo(() => {
    if (!submittedProcesses) {
      return null;
    }

    return calculateSchedule(submittedProcesses, algorithm);
  }, [submittedProcesses, algorithm]);

  const maxTimelineDuration = useMemo(() => {
    if (!results || results.timeline.length === 0) {
      return 1;
    }

    return results.timeline.reduce((sum, block) => sum + block.duration, 0);
  }, [results]);

  function toggleTheme() {
    setTheme((previousTheme) => (previousTheme === "light" ? "dark" : "light"));
  }

  function handleAlgorithmChange(nextAlgorithm) {
    setAlgorithm((previousAlgorithm) => {
      if (previousAlgorithm === nextAlgorithm) {
        return previousAlgorithm;
      }

      if (submittedProcesses) {
        setBrewRun((previous) => previous + 1);
      }

      return nextAlgorithm;
    });
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
    setSubmittedProcesses(null);
    setError("");
    setBrewRun(0);
  }

  function handleRemoveProcess(processId) {
    setProcesses((previous) => {
      if (previous.length <= INITIAL_PROCESSES.length) {
        return previous;
      }

      return previous.filter((process) => process.id !== processId);
    });
    setSubmittedProcesses(null);
    setError("");
    setBrewRun(0);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const normalized = normalizeProcesses(processes);
    const validationError = validateProcesses(normalized);

    if (validationError) {
      setError(validationError);
      setSubmittedProcesses(null);
      setBrewRun(0);
      return;
    }

    setError("");
    setSubmittedProcesses(normalized);
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
            Our Kuwewe(Queue) Planner
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)] sm:text-base">
            Our OS101 C project with Ma'am Eliang and the Tv Patrol Group
          </p>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:shadow-md"
        >
          Toggle Roast
        </button>
      </header>

      <main className="relative z-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <ProcessInputsCard
          processes={processes}
          error={error}
          onInputChange={handleInputChange}
          onAddProcess={handleAddProcess}
          onRemoveProcess={handleRemoveProcess}
          onSubmit={handleSubmit}
        />

        <ExecutionTimelineCard
          results={results}
          brewRun={brewRun}
          maxTimelineDuration={maxTimelineDuration}
          algorithm={algorithm}
          onAlgorithmChange={handleAlgorithmChange}
        />
      </main>

      <ResultsCard results={results} algorithm={algorithm} />
    </div>
  );
}
