import { Char, CRDTOperation } from './types';
import { FractionalIndex } from './FractionalIndex';

export class SequenceCRDT {
  public siteId: string;
  public struct: Char[];

  constructor(siteId: string, initialStruct: Char[] = []) {
    this.siteId = siteId;
    this.struct = initialStruct;
  }

  insert(visibleIndex: number, value: string): CRDTOperation {
    const activeChars = this.struct.filter(c => !c.isDeleted);
    const prev = visibleIndex > 0 ? activeChars[visibleIndex - 1] : null;
    const next = visibleIndex < activeChars.length ? activeChars[visibleIndex] : null;

    const newId = FractionalIndex.generateIdBetween(
      prev ? prev.id : null,
      next ? next.id : null,
      this.siteId
    );

    const char: Char = { id: newId, value, isDeleted: false };
    this.insertChar(char);

    // Return a cloned operation so callers cannot accidentally mutate internal state via shared references
    return {
      type: 'insert',
      char: {
        id: newId.map(([pos, site]) => [pos, site]),
        value: char.value,
        isDeleted: false,
      },
    };
  }

  delete(visibleIndex: number): CRDTOperation | null {
    const activeChars = this.struct.filter(c => !c.isDeleted);
    if (visibleIndex < 0 || visibleIndex >= activeChars.length) return null;
    
    const targetChar = activeChars[visibleIndex];
    targetChar.isDeleted = true;

    return {
      type: 'delete',
      char: {
        id: targetChar.id.map(([pos, site]) => [pos, site]),
        value: targetChar.value,
        isDeleted: true,
      },
    };
  }

  applyOperation(op: CRDTOperation): void {
    const char: Char = {
      id: op.char.id.map(([pos, site]) => [pos, site]),
      value: op.char.value,
      isDeleted: op.char.isDeleted,
    };

    if (op.type === 'insert') {
      this.insertChar(char);
    } else if (op.type === 'delete') {
      this.deleteChar(char);
    }
  }

  private insertChar(char: Char): void {
    let left = 0;
    let right = this.struct.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const comp = FractionalIndex.compareIds(this.struct[mid].id, char.id);
      
      if (comp === 0) {
        // Character already exists, update tombstone status
        if (char.isDeleted) {
          this.struct[mid].isDeleted = true;
        }
        return;
      }
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
