// Debounce simples e tipado, sem dependencias externas.
// `cancel()` descarta uma chamada pendente; `flush()` executa imediatamente a
// chamada pendente (util para garantir o salvamento ao sair de um campo).

export interface DebouncedFn<A extends unknown[]> {
  (...args: A): void;
  cancel: () => void;
  flush: () => void;
}

export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  wait: number
): DebouncedFn<A> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: A | null = null;

  const debounced = ((...args: A) => {
    lastArgs = args;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      const a = lastArgs as A;
      lastArgs = null;
      fn(...a);
    }, wait);
  }) as DebouncedFn<A>;

  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    lastArgs = null;
  };

  debounced.flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (lastArgs) {
      const a = lastArgs;
      lastArgs = null;
      fn(...a);
    }
  };

  return debounced;
}
