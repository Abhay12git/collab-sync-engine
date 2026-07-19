import { SequenceCRDT } from '../SequenceCRDT';

describe('SequenceCRDT Mathematical Convergence', () => {
  it('should insert and delete text correctly locally', () => {
    const crdt = new SequenceCRDT('clientA');
    crdt.insert(0, 'H');
    crdt.insert(1, 'i');
    expect(crdt.getText()).toBe('Hi');

    crdt.delete(1);
    expect(crdt.getText()).toBe('H');
  });

  it('should guarantee Strong Eventual Consistency (SEC) between concurrent editors', () => {
    const crdtA = new SequenceCRDT('clientA');
    const crdtB = new SequenceCRDT('clientB');

    const op1 = crdtA.insert(0, 'H');
    const op2 = crdtA.insert(1, 'e');
    const op3 = crdtA.insert(2, 'l');
    const op4 = crdtA.insert(3, 'l');
    const op5 = crdtA.insert(4, 'o');

    [op1, op2, op3, op4, op5].forEach(op => crdtB.applyOperation(op));
    expect(crdtB.getText()).toBe('Hello');

    // Network partition occurs. Both edit concurrently.
    const aOp = crdtA.insert(5, '!'); // A types "Hello!"
    const bOp = crdtB.insert(0, 'O'); // B types "OHello"

    // Network reconnects, operations are exchanged in arbitrary order
    crdtA.applyOperation(bOp);
    crdtB.applyOperation(aOp);

    // Assert absolute mathematical convergence
    expect(crdtA.getText()).toBe('OHello!');
    expect(crdtB.getText()).toBe('OHello!');
  });

  it('should handle concurrent deletions at the same position', () => {
    const crdtA = new SequenceCRDT('clientA');
    const crdtB = new SequenceCRDT('clientB');

    // Build initial state
    const ops = [
      crdtA.insert(0, 'A'),
      crdtA.insert(1, 'B'),
      crdtA.insert(2, 'C'),
    ];
    ops.forEach(op => crdtB.applyOperation(op));
    expect(crdtA.getText()).toBe('ABC');
    expect(crdtB.getText()).toBe('ABC');

    // Both delete 'B' concurrently
    const delA = crdtA.delete(1);
    const delB = crdtB.delete(1);

    // Exchange operations
    if (delA) crdtB.applyOperation(delA);
    if (delB) crdtA.applyOperation(delB);

    // Should converge (delete is idempotent via tombstone)
    expect(crdtA.getText()).toBe('AC');
    expect(crdtB.getText()).toBe('AC');
  });

  it('should handle interleaved insertions from 3 clients', () => {
    const crdtA = new SequenceCRDT('clientA');
    const crdtB = new SequenceCRDT('clientB');
    const crdtC = new SequenceCRDT('clientC');

    // Client A types "Hello"
    const opsA = 'Hello'.split('').map((ch, i) => crdtA.insert(i, ch));
    opsA.forEach(op => {
      crdtB.applyOperation(op);
      crdtC.applyOperation(op);
    });

    // All three insert concurrently at different positions
    const opA = crdtA.insert(5, '!');
    const opB = crdtB.insert(0, '>');
    const opC = crdtC.insert(3, '-');

    // Apply all ops to all CRDTs in different orders
    crdtA.applyOperation(opB);
    crdtA.applyOperation(opC);

    crdtB.applyOperation(opA);
    crdtB.applyOperation(opC);

    crdtC.applyOperation(opA);
    crdtC.applyOperation(opB);

    // All must converge to the same text
    const resultA = crdtA.getText();
    const resultB = crdtB.getText();
    const resultC = crdtC.getText();

    expect(resultA).toBe(resultB);
    expect(resultB).toBe(resultC);
  });

  it('fuzz: N random concurrent operations from 4 clients all converge', () => {
    const NUM_CLIENTS = 4;
    const OPS_PER_CLIENT = 20;

    const crdts = Array.from({ length: NUM_CLIENTS }, (_, i) =>
      new SequenceCRDT(`client-${i}`)
    );

    // Each client generates random operations
    const allOps: { source: number; op: ReturnType<SequenceCRDT['insert']> }[] = [];

    for (let round = 0; round < OPS_PER_CLIENT; round++) {
      for (let c = 0; c < NUM_CLIENTS; c++) {
        const crdt = crdts[c];
        const textLen = crdt.getText().length;

        if (textLen > 3 && Math.random() < 0.3) {
          // Delete
          const idx = Math.floor(Math.random() * textLen);
          const op = crdt.delete(idx);
          if (op) allOps.push({ source: c, op });
        } else {
          // Insert
          const idx = Math.floor(Math.random() * (textLen + 1));
          const char = String.fromCharCode(65 + Math.floor(Math.random() * 26));
          const op = crdt.insert(idx, char);
          allOps.push({ source: c, op });
        }
      }

      // After each round, broadcast all ops from this round to all other clients
      const roundOps = allOps.slice(-NUM_CLIENTS);
      for (const { source, op } of roundOps) {
        for (let c = 0; c < NUM_CLIENTS; c++) {
          if (c !== source) {
            crdts[c].applyOperation(op);
          }
        }
      }
    }

    // All CRDTs must converge
    const texts = crdts.map(c => c.getText());
    for (let i = 1; i < texts.length; i++) {
      expect(texts[i]).toBe(texts[0]);
    }
  });
});
