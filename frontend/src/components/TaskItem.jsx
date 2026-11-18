import { useState } from "react";
import { STATUSES, STATUS_STYLES } from "../constants";

export default function TaskItem({ task, onUpdate, onDelete }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function run(action) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const handleStatusChange = (event) => run(() => onUpdate(task.id, { status: event.target.value }));

  const handleDelete = () => {
    if (window.confirm(`Delete "${task.title}"?`)) run(() => onDelete(task.id));
  };

  return (
    <li
      className={`relative overflow-hidden rounded-xl bg-card p-4 pl-5 transition ${busy ? "opacity-60" : ""}`}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${STATUS_STYLES[task.status].bar}`} aria-hidden="true" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`break-words font-medium ${task.status === "Done" ? "text-muted line-through" : "text-white"}`}
            >
              {task.title}
            </h3>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[task.status].badge}`}
            >
              {task.status}
            </span>
          </div>
          {task.description && (
            <p className="mt-1 whitespace-pre-line break-words text-sm text-muted">
              {task.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <select
            value={task.status}
            onChange={handleStatusChange}
            disabled={busy}
            aria-label={`Status for ${task.title}`}
            className="rounded-lg border border-transparent bg-field px-2 py-1.5 text-sm text-white focus:border-todo focus:outline-none focus:ring-2 focus:ring-todo/20"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            aria-label={`Delete ${task.title}`}
            title="Delete task"
            className="rounded-lg p-2 text-muted transition hover:bg-red-500/10 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:cursor-not-allowed"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </li>
  );
}
