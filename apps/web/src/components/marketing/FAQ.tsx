"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "@ai-voice-leads/shared";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="faq-list">
      {FAQ_ITEMS.map((item, i) => {
        const panelId = `faq-panel-${i}`;
        const buttonId = `faq-button-${i}`;
        const isOpen = open === i;
        return (
          <div key={item.q} className="faq-item">
            <button
              type="button"
              id={buttonId}
              className="faq-question"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={panelId}
            >
              {item.q}
              <span aria-hidden>{isOpen ? "−" : "+"}</span>
            </button>
            <p
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="faq-answer muted"
            >
              {item.a}
            </p>
          </div>
        );
      })}
    </div>
  );
}
