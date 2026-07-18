export type Identifier = [number, string]; // [position, siteId]

export interface Char {
  id: Identifier[]; // A path of identifiers for fractional indexing
  value: string;
  isDeleted: boolean;
}

export interface CRDTOperation {
  type: 'insert' | 'delete';
  char: Char;
}
