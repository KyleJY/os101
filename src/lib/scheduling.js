export const MIN_PROCESS_COUNT = 5;

export const INITIAL_PROCESSES = Array.from(
  { length: MIN_PROCESS_COUNT },
  (_, index) => ({
    id: `P${index + 1}`,
    arrivalTime: "",
    burstTime: "",
  }),
);

export function normalizeProcesses(processes) {
  return processes.map((process) => ({
    ...process,
    arrivalTime: process.arrivalTime.trim(),
    burstTime: process.burstTime.trim(),
  }));
}

export function validateProcesses(processes) {
  const hasInvalid = processes.some((process) => {
    if (process.arrivalTime === "" || process.burstTime === "") {
      return true;
    }

    const arrival = Number(process.arrivalTime);
    const burst = Number(process.burstTime);

    return (
      Number.isNaN(arrival) || Number.isNaN(burst) || arrival < 0 || burst <= 0
    );
  });

  if (hasInvalid) {
    return "Use non-negative arrival times and burst times greater than 0 for all processes.";
  }

  return "";
}

function toProcessNumber(processId) {
  return Number(processId.slice(1));
}

function calculateMetrics(processes, order) {
  let currentTime = 0;
  const timeline = [];
  const metricsById = new Map();

  for (const process of order) {
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

export function calculateFcfs(processes) {
  const order = [...processes].sort((a, b) => {
    const arrivalA = Number(a.arrivalTime);
    const arrivalB = Number(b.arrivalTime);

    if (arrivalA !== arrivalB) {
      return arrivalA - arrivalB;
    }

    return toProcessNumber(a.id) - toProcessNumber(b.id);
  });

  return calculateMetrics(processes, order);
}

export function calculateSjf(processes) {
  const remaining = [...processes].sort((a, b) => {
    const arrivalA = Number(a.arrivalTime);
    const arrivalB = Number(b.arrivalTime);

    if (arrivalA !== arrivalB) {
      return arrivalA - arrivalB;
    }

    return toProcessNumber(a.id) - toProcessNumber(b.id);
  });

  const order = [];
  let currentTime = 0;

  while (remaining.length > 0) {
    const availableIndexes = remaining
      .map((process, index) => ({ process, index }))
      .filter(({ process }) => Number(process.arrivalTime) <= currentTime);

    if (availableIndexes.length === 0) {
      currentTime = Number(remaining[0].arrivalTime);
      continue;
    }

    availableIndexes.sort((a, b) => {
      const burstA = Number(a.process.burstTime);
      const burstB = Number(b.process.burstTime);

      if (burstA !== burstB) {
        return burstA - burstB;
      }

      const arrivalA = Number(a.process.arrivalTime);
      const arrivalB = Number(b.process.arrivalTime);

      if (arrivalA !== arrivalB) {
        return arrivalA - arrivalB;
      }

      return toProcessNumber(a.process.id) - toProcessNumber(b.process.id);
    });

    const [{ index }] = availableIndexes;
    const [nextProcess] = remaining.splice(index, 1);
    order.push(nextProcess);
    currentTime += Number(nextProcess.burstTime);
  }

  return calculateMetrics(processes, order);
}

export function calculateSchedule(processes, algorithm) {
  if (algorithm === "sjf") {
    return calculateSjf(processes);
  }

  return calculateFcfs(processes);
}
