import { FractionalIndex } from '../FractionalIndex';

describe('FractionalIndex', () => {
  const siteId = 'test-site';

  it('should generate an id between null boundaries (first character)', () => {
    const id = FractionalIndex.generateIdBetween(null, null, siteId);
    expect(id).toBeDefined();
    expect(id.length).toBeGreaterThan(0);
    expect(id[0][1]).toBe(siteId);
  });

  it('should generate an id between two existing ids', () => {
    const id1 = FractionalIndex.generateIdBetween(null, null, 'siteA');
    const id2 = FractionalIndex.generateIdBetween(id1, null, 'siteA');
    const between = FractionalIndex.generateIdBetween(id1, id2, 'siteB');
    
    expect(FractionalIndex.compareIds(id1, between)).toBeLessThan(0);
    expect(FractionalIndex.compareIds(between, id2)).toBeLessThan(0);
  });

  it('should compare ids correctly', () => {
    const id1: [number, string][] = [[5, 'a']];
    const id2: [number, string][] = [[10, 'b']];
    
    expect(FractionalIndex.compareIds(id1, id2)).toBeLessThan(0);
    expect(FractionalIndex.compareIds(id2, id1)).toBeGreaterThan(0);
    expect(FractionalIndex.compareIds(id1, id1)).toBe(0);
  });

  it('should break ties using siteId', () => {
    const id1: [number, string][] = [[5, 'alpha']];
    const id2: [number, string][] = [[5, 'beta']];
    
    expect(FractionalIndex.compareIds(id1, id2)).toBeLessThan(0);
    expect(FractionalIndex.compareIds(id2, id1)).toBeGreaterThan(0);
  });

  it('should handle deeper path comparisons', () => {
    const id1: [number, string][] = [[5, 'a'], [3, 'a']];
    const id2: [number, string][] = [[5, 'a'], [7, 'b']];
    
    expect(FractionalIndex.compareIds(id1, id2)).toBeLessThan(0);
  });

  it('should generate 1000 sequential ids without collision', () => {
    let prev: [number, string][] | null = null;
    const ids: [number, string][][] = [];

    for (let i = 0; i < 1000; i++) {
      const newId = FractionalIndex.generateIdBetween(prev, null, siteId);
      ids.push(newId);
      prev = newId;
    }

    // Verify all ids are in strictly increasing order
    for (let i = 1; i < ids.length; i++) {
      expect(FractionalIndex.compareIds(ids[i - 1], ids[i])).toBeLessThan(0);
    }
  });
});
