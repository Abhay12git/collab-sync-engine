import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';

export interface ICollaborator {
  userId: Types.ObjectId;
  role: 'Owner' | 'Editor' | 'Viewer';
}

export interface IDocument extends MongooseDocument {
  title: string;
  ownerId: Types.ObjectId;
  collaborators: ICollaborator[];
  createdAt: Date;
  updatedAt: Date;
}

const collaboratorSchema = new Schema<ICollaborator>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['Owner', 'Editor', 'Viewer'], required: true },
  },
  { _id: false }
);

const documentSchema = new Schema<IDocument>(
  {
    title: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    collaborators: [collaboratorSchema],
  },
  { timestamps: true }
);

export const DocumentModel = model<IDocument>('Document', documentSchema);
