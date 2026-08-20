"use client";

import { useState } from "react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-lg border border-border bg-surface-2 p-8 text-center">
        <p className="text-lg font-medium text-ink">
          Thanks — we&apos;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-4 rounded-lg border border-border bg-surface-4 p-8"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          type="text"
          className="w-full rounded-lg border border-border bg-surface-4 px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-primary-400"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          required
          type="email"
          className="w-full rounded-lg border border-border bg-surface-4 px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-primary-400"
        />
      </div>
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          className="w-full rounded-lg border border-border bg-surface-4 px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-primary-400"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-full bg-primary-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
      >
        Send
      </button>
    </form>
  );
}
