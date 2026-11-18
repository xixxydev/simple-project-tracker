import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import { useTasks } from "./hooks/useTasks";
import { STATUSES } from "./constants";

export default function App() {
  const { tasks, loading, error, reload, createTask, updateTask, deleteTask } = useTasks();

  const counts = STATUSES.map((status) => ({
    status,
    count: tasks.filter((t) => t.status === status).length,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold text-slate-900">Simple Project Tracker</h1>
          {!loading && !error && (
            <p className="text-sm text-slate-500">
              {counts.map(({ status, count }) => `${count} ${status}`).join(" · ")}
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-3">
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <TaskForm onCreate={createTask} />
          </div>
        </aside>
        <section className="lg:col-span-2" aria-label="Tasks">
          <TaskList
            tasks={tasks}
            loading={loading}
            error={error}
            onRetry={reload}
            onUpdate={updateTask}
            onDelete={deleteTask}
          />
        </section>
      </main>
    </div>
  );
}
