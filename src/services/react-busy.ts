// React owns busy/error presentation. Commands only deduplicate their operation.
const operations = new WeakMap<object, Promise<unknown>>();
export async function withBusy<T>(
  button: object,
  _label: string,
  operation: () => Promise<T>,
): Promise<T | undefined> {
  if (operations.has(button)) return undefined;
  const pending = operation();
  operations.set(button, pending);
  try {
    return await pending;
  } finally {
    operations.delete(button);
  }
}
