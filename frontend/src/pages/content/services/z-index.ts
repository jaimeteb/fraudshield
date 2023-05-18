class ZIndexManager {
  base: number;

  constructor() {
    this.base = 10000;
  }

  get() {
    return this.base++;
  }
}

export const zIndexManager = new ZIndexManager();
