"use client";

import { useRef, useState, type ReactNode } from "react";

type Ask = { title: string; body?: ReactNode; action: string; danger?: boolean };

/**
 * "Are you sure?" for actions that are hard to undo (decline a guest, kill
 * a live link, change someone's access). Native <dialog>, same look as the
 * Sign out confirm. `const [confirm, dialog] = useConfirm()`, render
 * `dialog`, then `if (await confirm({...})) doIt()`.
 */
export function useConfirm(): [(ask: Ask) => Promise<boolean>, ReactNode] {
  const ref = useRef<HTMLDialogElement>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);
  const [ask, setAsk] = useState<Ask | null>(null);

  function confirm(next: Ask) {
    setAsk(next);
    requestAnimationFrame(() => ref.current?.showModal());
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }
  function close(ok: boolean) {
    ref.current?.close();
    resolver.current?.(ok);
    resolver.current = null;
  }

  const dialog = (
    <dialog ref={ref} className="d-confirm" aria-labelledby="d-ask-title" onCancel={() => close(false)}>
      <h2 id="d-ask-title">{ask?.title}</h2>
      {ask?.body && <p>{ask.body}</p>}
      <div className="d-actions">
        <button type="button" className="d-button secondary" autoFocus onClick={() => close(false)}>
          Cancel
        </button>
        <button type="button" className={`d-button${ask?.danger ? " danger" : ""}`} onClick={() => close(true)}>
          {ask?.action}
        </button>
      </div>
    </dialog>
  );
  return [confirm, dialog];
}
