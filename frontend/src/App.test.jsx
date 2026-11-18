import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

const API = "http://localhost:8000/api";

const task = (overrides = {}) => ({
  id: 1,
  title: "Write docs",
  description: "README",
  status: "Todo",
  created_at: "2026-11-18T00:00:00Z",
  updated_at: "2026-11-18T00:00:00Z",
  ...overrides,
});

const jsonResponse = (body, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));

/** Mock fetch: first call returns the initial task list, then the given responses in order. */
function mockFetch(initialTasks, ...responses) {
  const fetchMock = vi.fn().mockReturnValueOnce(jsonResponse(initialTasks));
  responses.forEach((r) => fetchMock.mockReturnValueOnce(r));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.spyOn(window, "confirm").mockReturnValue(true);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("task list", () => {
  it("shows tasks loaded from the API", async () => {
    const fetchMock = mockFetch([task(), task({ id: 2, title: "Ship it", status: "Done" })]);

    render(<App />);

    expect(await screen.findByText("Write docs")).toBeInTheDocument();
    expect(screen.getByText("Ship it")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(`${API}/tasks`, expect.any(Object));
  });

  it("shows an empty state when there are no tasks", async () => {
    mockFetch([]);

    render(<App />);

    expect(await screen.findByText("No tasks yet")).toBeInTheDocument();
  });

  it("shows an error with retry when the backend is unreachable", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockReturnValueOnce(jsonResponse([task()]));
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not reach the server");
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("Write docs")).toBeInTheDocument();
  });
});

describe("creating a task", () => {
  it("rejects an empty title without calling the API", async () => {
    const fetchMock = mockFetch([]);
    render(<App />);
    await screen.findByText("No tasks yet");

    await userEvent.type(screen.getByLabelText(/title/i), "   ");
    await userEvent.click(screen.getByRole("button", { name: "Add task" }));

    expect(screen.getByText("Title must not be empty.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1); // only the initial list load
  });

  it("adds the created task to the list and clears the form", async () => {
    const created = task({ id: 5, title: "New task", description: "Details", status: "In Progress" });
    const fetchMock = mockFetch([], jsonResponse(created, 201));
    render(<App />);
    await screen.findByText("No tasks yet");

    await userEvent.type(screen.getByLabelText(/title/i), "  New task ");
    await userEvent.type(screen.getByLabelText("Description"), "Details");
    await userEvent.selectOptions(screen.getByLabelText("Status"), "In Progress");
    await userEvent.click(screen.getByRole("button", { name: "Add task" }));

    expect(await screen.findByRole("heading", { level: 3, name: "New task" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith(`${API}/tasks`, expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ title: "New task", description: "Details", status: "In Progress" }),
    }));
    expect(screen.getByLabelText(/title/i)).toHaveValue("");
    expect(screen.getByLabelText("Description")).toHaveValue("");
  });

  it("shows validation errors returned by the API", async () => {
    mockFetch([], jsonResponse({ title: ["Ensure this field has no more than 200 characters."] }, 400));
    render(<App />);
    await screen.findByText("No tasks yet");

    await userEvent.type(screen.getByLabelText(/title/i), "Too long");
    await userEvent.click(screen.getByRole("button", { name: "Add task" }));

    expect(
      await screen.findByText("Ensure this field has no more than 200 characters."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toHaveValue("Too long");
  });
});

describe("updating and deleting", () => {
  it("changes a task's status with PUT and updates the list", async () => {
    const fetchMock = mockFetch([task()], jsonResponse(task({ status: "Done" })));
    render(<App />);
    const item = (await screen.findByText("Write docs")).closest("li");

    await userEvent.selectOptions(within(item).getByLabelText("Status for Write docs"), "Done");

    await waitFor(() => expect(within(item).getByText("Done", { selector: "span" })).toBeInTheDocument());
    expect(fetchMock).toHaveBeenLastCalledWith(`${API}/tasks/1`, expect.objectContaining({
      method: "PUT",
      body: JSON.stringify({ status: "Done" }),
    }));
  });

  it("keeps the old status and shows an error if the update fails", async () => {
    mockFetch([task()], jsonResponse({ detail: "Server error" }, 500));
    render(<App />);
    const item = (await screen.findByText("Write docs")).closest("li");

    await userEvent.selectOptions(within(item).getByLabelText("Status for Write docs"), "Done");

    expect(await within(item).findByRole("alert")).toHaveTextContent("Server error");
    expect(within(item).getByLabelText("Status for Write docs")).toHaveValue("Todo");
  });

  it("deletes a task after confirmation", async () => {
    const fetchMock = mockFetch([task()], Promise.resolve(new Response(null, { status: 204 })));
    render(<App />);
    await screen.findByText("Write docs");

    await userEvent.click(screen.getByRole("button", { name: "Delete Write docs" }));

    await waitFor(() => expect(screen.queryByText("Write docs")).not.toBeInTheDocument());
    expect(fetchMock).toHaveBeenLastCalledWith(`${API}/tasks/1`, expect.objectContaining({ method: "DELETE" }));
    expect(screen.getByText("No tasks yet")).toBeInTheDocument();
  });

  it("does nothing when deletion is cancelled", async () => {
    window.confirm.mockReturnValue(false);
    const fetchMock = mockFetch([task()]);
    render(<App />);
    await screen.findByText("Write docs");

    await userEvent.click(screen.getByRole("button", { name: "Delete Write docs" }));

    expect(screen.getByText("Write docs")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
