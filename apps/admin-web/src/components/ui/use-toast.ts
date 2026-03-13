import * as React from 'react';
import type { ToasterToast } from './toast';

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type Toast = Omit<ToasterToast, 'id'>;

const listeners: Array<(toasts: ToasterToast[]) => void> = [];
let memoryToasts: ToasterToast[] = [];

function dispatch(toasts: ToasterToast[]) {
  memoryToasts = toasts;
  listeners.forEach((listener) => listener(toasts));
}

function toast(props: Toast) {
  const id = genId();
  const newToast = { ...props, id };

  dispatch([...memoryToasts, newToast].slice(-TOAST_LIMIT));

  setTimeout(() => {
    dismiss(id);
  }, TOAST_REMOVE_DELAY);

  return { id, dismiss: () => dismiss(id) };
}

function dismiss(id: string) {
  dispatch(memoryToasts.filter((t) => t.id !== id));
}

function useToast() {
  const [toasts, setToasts] = React.useState<ToasterToast[]>(memoryToasts);

  React.useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const index = listeners.indexOf(setToasts);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return { toasts, toast, dismiss };
}

export { useToast, toast };
