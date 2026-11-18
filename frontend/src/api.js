const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, { status = 0, fieldErrors = {} } = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors; // e.g. { title: ["Title must not be empty."] }
  }
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    throw new ApiError("Could not reach the server. Is the backend running?");
  }

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 400 && data && typeof data === "object") {
      throw new ApiError("Please fix the errors below.", { status: 400, fieldErrors: data });
    }
    throw new ApiError(data?.detail || `Request failed (${response.status}).`, {
      status: response.status,
    });
  }
  return data;
}

export const api = {
  listTasks: () => request("/tasks"),
  createTask: (task) => request("/tasks", { method: "POST", body: JSON.stringify(task) }),
  updateTask: (id, changes) =>
    request(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(changes) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: "DELETE" }),
};
