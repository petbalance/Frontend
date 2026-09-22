/** Preserve current and legacy device preferences without overwriting newer data. */
export function migrateBrandStorage(storage: Storage): void {
  for (const suffix of ['api-base', 'token', 'goals', 'onboarded', 'theme', 'cart', 'diet']) {
    const newKey = `petbalance-${suffix}`;
    for (const prefix of ['wooaeyoung', 'pb']) {
      const oldKey = `${prefix}-${suffix}`;
      try {
        const value = storage.getItem(oldKey);
        if (value === null) continue;
        if (storage.getItem(newKey) === null) storage.setItem(newKey, value);
        storage.removeItem(oldKey);
      } catch {
        // Retain the original if storage is unavailable or full.
      }
    }
  }
}
