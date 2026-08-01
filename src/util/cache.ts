export class TtlCache<T> {
  private readonly values = new Map<
    string,
    {
      expiresAt: number;
      value: Promise<T>;
    }
  >();

  public constructor(private readonly ttlMs: number) {}

  public getOrCreate(key: string, loader: () => Promise<T>): Promise<T> {
    const existing = this.values.get(key);

    if (existing && existing.expiresAt > Date.now()) {
      return existing.value;
    }

    const value = loader().catch((error: unknown) => {
      this.values.delete(key);
      throw error;
    });

    this.values.set(key, {
      expiresAt: Date.now() + this.ttlMs,
      value,
    });

    return value;
  }

  public clear(): void {
    this.values.clear();
  }
}
