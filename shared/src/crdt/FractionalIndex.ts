import { Identifier } from './types';

/**
 * Fractional Indexing for CRDT character positioning.
 * 
 * Each character's position is a path of Identifiers: [position, siteId][].
 * Positions form a dense, totally-ordered set that supports concurrent
 * insertions without coordination.
 * 
 * Algorithm: Logoot-style with deterministic allocation.
 * - When there's space between two positions at a given depth, pick a value in between.
 * - When there's no space, recurse to a deeper level.
 * - siteId is used as a tiebreaker to ensure total ordering.
 */
export class FractionalIndex {
  static BASE = 256; // Large base to minimize tree depth

  /**
   * Generate a position identifier strictly between pos1 and pos2.
   * pos1 = null means "beginning of document"
   * pos2 = null means "end of document"
   */
  static generateIdBetween(
    pos1: Identifier[] | null,
    pos2: Identifier[] | null,
    siteId: string,
    depth: number = 0
  ): Identifier[] {
    // Get the identifier at this depth (or boundary defaults)
    const id1 = pos1 && depth < pos1.length ? pos1[depth] : null;
    const id2 = pos2 && depth < pos2.length ? pos2[depth] : null;

    const n1 = id1 ? id1[0] : 0;
    const n2 = id2 ? id2[0] : this.BASE;
    const site1 = id1 ? id1[1] : '';
    const site2 = id2 ? id2[1] : '';

    if (n1 < n2 - 1) {
      // There's room between the positions at this depth
      const newPos = n1 + 1 + Math.floor(Math.random() * (n2 - n1 - 1));
      // Copy the prefix up to this depth, then set the new position
      const prefix = pos1 ? pos1.slice(0, depth) : [];
      return [...prefix, [newPos, siteId]];
    }

    if (n1 === n2) {
      // Same position number — compare siteIds
      if (site1 < site2) {
        // pos1 < pos2 at this level, recurse deeper
        return this.generateIdBetween(pos1, null, siteId, depth + 1);
      }
      // Same site, recurse deeper with both bounds
      return this.generateIdBetween(pos1, pos2, siteId, depth + 1);
    }

    // n2 - n1 === 1 (or n1 === n2 with site1 >= site2)
    // No room at this depth. Go deeper: new ID is after pos1 at the next level.
    return this.generateIdBetween(pos1, null, siteId, depth + 1);
  }

  /**
   * Compare two position identifiers for total ordering.
   * Returns negative if id1 < id2, positive if id1 > id2, 0 if equal.
   */
  static compareIds(id1: Identifier[], id2: Identifier[]): number {
    const maxLen = Math.max(id1.length, id2.length);
    for (let i = 0; i < maxLen; i++) {
      const a: Identifier = i < id1.length ? id1[i] : [0, ''];
      const b: Identifier = i < id2.length ? id2[i] : [0, ''];

      const pos1 = a[0];
      const site1 = a[1];
      const pos2 = b[0];
      const site2 = b[1];

      if (pos1 !== pos2) return pos1 - pos2;
      if (site1 !== site2) return site1 < site2 ? -1 : 1;
    }
    return 0;
  }
}
