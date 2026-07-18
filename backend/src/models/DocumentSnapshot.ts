import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';

export interface IDocumentSnapshot extends MongooseDocument {
  documentId: Types.ObjectId;
  version: number;
  serializedCrdt: Buffer;
  createdAt: Date;
}

const documentSnapshotSchema = new Schema<IDocumentSnapshot>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
    version: { type: Number, required: true },
    serializedCrdt: { type: Buffer, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Compound index to fetch the latest snapshot efficiently
documentSnapshotSchema.index({ documentId: 1, version: -1 });

export const DocumentSnapshot = model<IDocumentSnapshot>('DocumentSnapshot', documentSnapshotSchema);
