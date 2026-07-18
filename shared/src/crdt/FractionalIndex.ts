import { Identifier } from './types';

export class FractionalIndex {
  static BASE = 32;

  static generateIdBetween(
    pos1: Identifier[] | null,
    pos2: Identifier[] | null,
    siteId: string
  ): Identifier[] {
    const head1 = pos1 ? pos1[0] : null;
    const head2 = pos2 ? pos2[0] : null;

    if (head1 && head2 && head1[0] === head2[0]) {
      if (head1[1] !== head2[1]) {
        return [head1, [this.generatePos(0, this.BASE), siteId]];
      }
      const rest = this.generateIdBetween(
        pos1 ? pos1.slice(1) : null,
        pos2 ? pos2.slice(1) : null,
        siteId
      );
      return [head1, ...rest];
    }

    const n1 = head1 ? head1[0] : 0;
    const n2 = head2 ? head2[0] : this.BASE;

    if (n2 - n1 > 1) {
      return [[this.generatePos(n1, n2), siteId]];
    }

    const newPos = [head1 || [0, siteId], [this.generatePos(0, this.BASE), siteId]] as Identifier[];
    return newPos;
  }

  private static generatePos(min: number, max: number): number {
    const span = max - min;
    const step = Math.floor(Math.random() * (span - 1)) + 1;
    return min + step;
  }

  static compareIds(id1: Identifier[], id2: Identifier[]): number {
    for (let i = 0; i < Math.min(id1.length, id2.length); i++) {
      const [pos1, site1] = id1[i];
      const [pos2, site2] = id2[i];

      if (pos1 !== pos2) return pos1 - pos2;
      if (site1 !== site2) return site1 < site2 ? -1 : 1;
    }
    return id1.length - id2.length;
  }
}
