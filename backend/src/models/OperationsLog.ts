import { Schema, model, Document as MongooseDocument } from 'mongoose';

// Represents a CRDT Operation
export interface ICrdtOperation {
  type: 'insert' | 'delete';
  id: Array<any>; // Fractional index identifier
  value?: string;
}

export interface IOperationsLog extends MongooseDocument {
  documentId: any;
  version: number;
  operation: ICrdtOperation;
  userId: any;
  timestamp: Date;
}

const operationSchema = new Schema<ICrdtOperation>(
  {
    type: { type: String, enum: ['insert', 'delete'], required: true },
    id: { type: Schema.Types.Mixed, required: true }, // Mixed because it's a nested tuple array
    value: { type: String },
  },
  { _id: false }
);

const operationsLogSchema = new Schema<IOperationsLog>(
  {
    documentId: { type: Schema.Types.Mixed, required: true },
    version: { type: Number, required: true },
    operation: { type: operationSchema, required: true },
    userId: { type: Schema.Types.Mixed, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Compound index for querying missing operations after a given snapshot version
operationsLogSchema.index({ documentId: 1, version: 1 });

export const OperationsLog = model<IOperationsLog>('OperationsLog', operationsLogSchema);
