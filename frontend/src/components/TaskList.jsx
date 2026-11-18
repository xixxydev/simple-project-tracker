import TaskItem from "./TaskItem";

export default function TaskList({ tasks, loading, error, onRetry, onUpdate, onDelete }) {
  if (loading) {
    return <p className="py-12 text-center text-sm text-slate-500">Loading tasks…</p>;
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
      >
        <span>{error}</span>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-white px-3 py-1.5 font-medium text-red-700 ring-1 ring-red-200 hover:bg-red-100"
        >
          Retry
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center">
        <p className="font-medium text-slate-700">No tasks yet</p>
        <p className="mt-1 text-sm text-slate-500">Add your first task to get started.</p>
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
