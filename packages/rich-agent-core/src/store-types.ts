export interface StoreSetter<TStore> {
  (
    partial: TStore | Partial<TStore> | ((state: TStore) => TStore | Partial<TStore>),
    replace?: false | undefined,
    action?: unknown,
  ): void;
  (state: TStore | ((state: TStore) => TStore), replace: true, action?: unknown): void;
}
