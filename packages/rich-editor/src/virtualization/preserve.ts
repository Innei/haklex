/** Owns parked mounts. Eviction hands their latest state back to the recycler. */
export class PreserveNodeManager {
  private parked = new Map<number, string>();
  private hosts = new Map<number, HTMLElement>();
  private parking?: DocumentFragment;
  hits = 0;
  evictions = 0;

  constructor(
    readonly capacity: number,
    private readonly evict: (slot: number, owner: string) => void,
  ) {
    if (!Number.isInteger(capacity) || capacity < 0)
      throw new Error('preserveCapacity must be a nonnegative integer');
  }
  get size() {
    return this.parked.size;
  }
  has(slot: number) {
    return this.parked.has(slot);
  }
  ids() {
    return new Set(this.parked.keys());
  }
  park(slot: number, owner: string) {
    this.parked.delete(slot);
    this.parked.set(slot, owner);
    while (this.parked.size > this.capacity) {
      const [oldest, key] = this.parked.entries().next().value!;
      this.parked.delete(oldest);
      this.evict(oldest, key);
      this.evictions++;
    }
  }
  activate(slot: number) {
    if (!this.parked.delete(slot)) return false;
    this.hits++;
    return true;
  }
  host(slot: number) {
    return this.hosts.get(slot);
  }
  mount(slot: number, host: HTMLElement, parent: HTMLElement | null, before: Node | null = null) {
    this.hosts.set(slot, host);
    if (parent) {
      // Moving a host drops the DOM selection and focus inside it, so only reorder when it is out of order.
      if (
        host.parentNode !== parent ||
        (before && !(host.compareDocumentPosition(before) & Node.DOCUMENT_POSITION_FOLLOWING))
      )
        parent.insertBefore(host, before);
    } else {
      this.parking ??= host.ownerDocument.createDocumentFragment();
      if (host.parentNode !== this.parking) this.parking.append(host);
    }
  }
  forget(slot: number) {
    this.parked.delete(slot);
    this.hosts.get(slot)?.remove();
    this.hosts.delete(slot);
  }
  clear() {
    for (const host of this.hosts.values()) host.remove();
    this.hosts.clear();
    this.parked.clear();
  }
}
