import { useState } from "react";
import { STATUSES } from "../constants";

const EMPTY_FORM = { title: "", description: "", status: "Todo" };

const inputClass =
  "w-full rounded-lg border bg-field px-3 py-2 text-sm text-white placeholder:text-muted/70 focus:border-todo focus:outline-none focus:ring-2 focus:ring-todo/20 disabled:opacity-60";

export default function TaskForm({ onCreate }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const setField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);

    if (!form.title.trim()) {
      setErrors({ title: "Title must not be empty." });
      return;
    }

    setSubmitting(true);
    try {
      await onCreate({ ...form, title: form.title.trim() });
      setForm(EMPTY_FORM);
      setErrors({});
    } catch (err) {
      const fieldErrors = Object.fromEntries(
        Object.entries(err.fieldErrors || {}).map(([field, messages]) => [
          field,
          [].concat(messages).join(" "),
        ]),
      );
      setErrors(fieldErrors);
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-xl bg-card p-5"
    >
      <h2 className="text-base font-semibold text-white">New task</h2>

      <div className="space-y-1">
        <label htmlFor="title" className="text-sm font-medium text-muted">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={form.title}
          onChange={setField("title")}
          placeholder="e.g. Design the landing page"
          maxLength={200}
          disabled={submitting}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "title-error" : undefined}
          className={`${inputClass} ${errors.title ? "border-red-400" : "border-transparent"}`}
        />
        {errors.title && (
          <p id="title-error" className="text-sm text-red-400">
            {errors.title}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium text-muted">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          value={form.description}
          onChange={setField("description")}
          placeholder="Optional details"
          disabled={submitting}
          className={`${inputClass} border-transparent`}
        />
        {errors.description && <p className="text-sm text-red-400">{errors.description}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="status" className="text-sm font-medium text-muted">
          Status
        </label>
        <select
          id="status"
          value={form.status}
          onChange={setField("status")}
          disabled={submitting}
          className={`${inputClass} border-transparent`}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {errors.status && <p className="text-sm text-red-400">{errors.status}</p>}
      </div>

      {formError && !Object.values(errors).some(Boolean) && (
        <p role="alert" className="text-sm text-red-400">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-todo px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-todo/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Adding…" : "Add task"}
      </button>
    </form>
  );
}
