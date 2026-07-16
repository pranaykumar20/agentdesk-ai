"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "@ai-voice-leads/shared";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="faq-list">
      {FAQ_ITEMS.map((item, i) => (
        <div key={item.q} className="faq-item">
          <button
            type="button"
            className="faq-question"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            {item.q}
            <span>{open === i ? "−" : "+"}</span>
          </button>
          {open === i && <p className="faq-answer muted">{item.a}</p>}
        </div>
      ))}
    </div>
  );
}
