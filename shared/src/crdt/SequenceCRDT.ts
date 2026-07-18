import { Char, CRDTOperation } from './types';
import { FractionalIndex } from './FractionalIndex';

export class SequenceCRDT {
  public siteId: string;
  public struct: Char[];

  constructor(siteId: string, initialStruct: Char[] = []) {
    this.siteId = siteId;
    this.struct = initialStruct;
  }

  insert(index: number, value: string): CRDTOperation {
    const prev = index > 0 ? this.struct[index - 1] : null;
    const next = index < this.struct.length ? this.struct[index] : null;

    const newId = FractionalIndex.generateIdBetween(
      prev ? prev.id : null,
      next ? next.id : null,
      this.siteId
    );

    const char: Char = { id: newId, value, isDeleted: false };
    this.struct.splice(index, 0, char);

    return { type: 'insert', char };
  }

  delete(index: number): CRDTOperation | null {
    if (index < 0 || index >= this.struct.length) return null;
    
    const char = this.struct[index];
    char.isDeleted = true;

    return { type: 'delete', char };
  }

  applyOperation(op: CRDTOperation): void {
    if (op.type === 'insert') {
      this.insertChar(op.char);
    } else if (op.type === 'delete') {
      this.deleteChar(op.char);
    }
  }

  private insertChar(char: Char): void {
    let left = 0;
    let right = this.struct.length - 1;
    let mid = 0;

    while (left <= right) {
      mid = Math.floor((left + right) / 2);
      const comp = FractionalIndex.compareIds(this.struct[mid].id, char.id);
      
      if (comp === 0) return;
      if (comp < 0) left = mid + 1;
      else right = mid - 1;
    }

    this.struct.splice(left, 0, char);
  }

  private deleteChar(char: Char): void {
    const existingChar = this.struct.find(c => FractionalIndex.compareIds(c.id, char.id) === 0);
    if (existingChar) {
      existingChar.isDeleted = true;
    } else {
      this.insertChar({ ...char, isDeleted: true });
    }
  }

  getText(): string {
    return this.struct.filter(c => !c.isDeleted).map(c => c.value).join('');
  }
}
