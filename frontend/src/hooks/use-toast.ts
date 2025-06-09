// hooks/use-toast.ts
'use client';

import * as React from 'react';
import type { ExternalToast, ToasterProps } from 'sonner';
import { toast as sonnerToast } from 'sonner';

type ToastItem = ExternalToast & {
  id: string;
  open?: boolean;
};

type Action =
  | { type: 'ADD'; toast: ToastItem }
  | { type: 'DISMISS'; toastId?: string }
  | { type: 'REMOVE'; toastId?: string };

interface State {
  toasts: ToastItem[];
}

const TOAST_LIMIT = 1;
const REMOVE_DELAY = 5000;

let memoryState: State = { toasts: [] };
const listeners: Array<(s: State) => void> = [];
const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD':
      return { toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) };
    case 'DISMISS':
      return {
        toasts: state.toasts.map((t) =>
          action.toastId === undefined || t.id === action.toastId
            ? { ...t, open: false }
            : t
        ),
      };
    case 'REMOVE':
      return {
        toasts:
          action.toastId === undefined
            ? []
            : state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
}

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((fn) => fn(memoryState));
}

function scheduleRemove(id: string) {
  if (timeouts.has(id)) return;
  const timer = setTimeout(() => {
    timeouts.delete(id);
    dispatch({ type: 'REMOVE', toastId: id });
  }, REMOVE_DELAY);
  timeouts.set(id, timer);
}

/**
 * Show a toast. The first argument is the main message.
 */
export function toast(
  message: React.ReactNode,
  opts?: Omit<ExternalToast, 'title'> & { duration?: number }
) {
  const id = crypto.randomUUID();
  const toastOpts: ExternalToast = {
    ...opts,
    description: opts?.description,
    action: opts?.action,
    // Not including title here—message is passed separately below
  };

  const item: ToastItem = { ...toastOpts, id, open: true };
  dispatch({ type: 'ADD', toast: item });

  sonnerToast(message, {
    ...toastOpts,
    id,
    duration: opts?.duration,
    onDismiss: () => dispatch({ type: 'REMOVE', toastId: id }),
    onAutoClose: () => {
      dispatch({ type: 'DISMISS', toastId: id });
      scheduleRemove(id);
    },
  });

  return { id };
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const idx = listeners.indexOf(setState);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }, []);

  return {
    toasts: state.toasts,
    toast,
    dismiss: (id?: string) => dispatch({ type: 'DISMISS', toastId: id }),
    remove: (id?: string) => dispatch({ type: 'REMOVE', toastId: id }),
  };
}
