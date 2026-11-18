import TaskItem from "./TaskItem";

export default function TaskList({ tasks, loading, error, onRetry, onUpdate, onDelete }) {
  if (loading) {
    return <p className="py-12 text-center text-sm text-muted">Loading tasks…</p>;
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 rounded-xl bg-red-500/10 p-4 text-sm text-red-300 ring-1 ring-red-500/30 sm:flex-row sm:items-center sm:justify-between"
      >
        <span>{error}</span>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-red-500/20 px-3 py-1.5 font-medium text-red-200 hover:bg-red-500/30"
        >
          Retry
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line py-12 text-center">
        <p className="font-medium text-white">No tasks yet</p>
        <p className="mt-1 text-sm text-muted">Add your first task to get started.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </ul>
  );
}
