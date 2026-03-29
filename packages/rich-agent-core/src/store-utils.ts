export const flattenActions = <T extends object>(actions: object[]): T => {
  const result = {} as T;

  for (const action of actions) {
    let current: object | null = action;

    while (current && current !== Object.prototype) {
      const keys = Object.getOwnPropertyNames(current);

      for (const key of keys) {
        if (key === 'constructor') continue;
        if (key in result) continue;

        const descriptor = Object.getOwnPropertyDescriptor(current, key);
        if (!descriptor) continue;

        if (typeof descriptor.value === 'function') {
          (result as Record<string, unknown>)[key] = descriptor.value.bind(action);
        } else {
          Object.defineProperty(result, key, {
            ...descriptor,
            configurable: true,
            enumerable: true,
          });
        }
      }

      current = Object.getPrototypeOf(current);
    }
  }

  return result;
};
