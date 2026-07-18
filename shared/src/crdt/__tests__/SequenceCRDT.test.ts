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
});
