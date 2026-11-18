import { useCallback, useEffect, useState } from "react";
import { api } from "../api";

/**
 * Task list state. After each successful POST/PUT/DELETE, local state is
 * updated from the server's response, so the screen stays in sync without
 * reloading the page or refetching the list.
 */
export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTasks(await api.listTasks());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const createTask = useCallback(async (task) => {
    const created = await api.createTask(task);
    setTasks((prev) => [created, ...prev]);
  }, []);

  const updateTask = useCallback(async (id, changes) => {
    const updated = await api.updateTask(id, changes);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  const deleteTask = useCallback(async (id) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { tasks, loading, error, reload: loadTasks, createTask, updateTask, deleteTask };
}
