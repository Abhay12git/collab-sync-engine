import { DocumentModel } from '../models/Document';
import { DocumentSnapshot } from '../models/DocumentSnapshot';
import { OperationsLog } from '../models/OperationsLog';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { Types } from 'mongoose';

export const createDocument = async (userId: string, title: string) => {
  const doc = await DocumentModel.create({
    title,
    ownerId: new Types.ObjectId(userId),
    collaborators: [{ userId: new Types.ObjectId(userId), role: 'Owner' }],
  });

  // Create an initial empty snapshot (version 0)
  await DocumentSnapshot.create({
    documentId: doc._id,
    version: 0,
    serializedCrdt: Buffer.from(JSON.stringify([])),
  });

  return { id: doc._id, title: doc.title };
};

export const listDocuments = async (userId: string) => {
  const docs = await DocumentModel.find({
    $or: [
      { ownerId: new Types.ObjectId(userId) },
      { 'collaborators.userId': new Types.ObjectId(userId) },
    ],
  })
    .select('title ownerId collaborators createdAt updatedAt')
    .sort({ updatedAt: -1 })
    .lean();

  return docs.map((doc) => {
    const collab = doc.collaborators.find(
      (c) => c.userId.toString() === userId
    );
    return {
      id: doc._id,
      title: doc.title,
      role: collab?.role || 'Viewer',
      updatedAt: doc.updatedAt,
    };
  });
};

export const getDocument = async (userId: string, documentId: string) => {
  const doc = await DocumentModel.findById(documentId);
  if (!doc) {
    throw new AppError('Document not found', 404);
  }

  // Check access
  const isOwner = doc.ownerId.toString() === userId;
  const isCollaborator = doc.collaborators.some(
    (c) => c.userId.toString() === userId
  );
  if (!isOwner && !isCollaborator) {
    throw new AppError('You do not have access to this document', 403);
  }

  // Get latest snapshot
  const snapshot = await DocumentSnapshot.findOne({ documentId: doc._id })
    .sort({ version: -1 })
    .lean();

  // Get operations after the snapshot
  const snapshotVersion = snapshot?.version ?? 0;
  const ops = await OperationsLog.find({
    documentId: doc._id,
    version: { $gt: snapshotVersion },
  })
    .sort({ version: 1 })
    .lean();

  return {
    document: { id: doc._id, title: doc.title },
    snapshot: snapshot
      ? {
          version: snapshot.version,
          crdt: JSON.parse(snapshot.serializedCrdt.toString()),
        }
      : { version: 0, crdt: [] },
    ops: ops.map((o) => o.operation),
  };
};

export const shareDocument = async (
  ownerId: string,
  documentId: string,
  targetEmail: string,
  role: 'Editor' | 'Viewer'
) => {
  const doc = await DocumentModel.findById(documentId);
  if (!doc) {
    throw new AppError('Document not found', 404);
  }
  if (doc.ownerId.toString() !== ownerId) {
    throw new AppError('Only the owner can share this document', 403);
  }

  const targetUser = await User.findOne({ email: targetEmail });
  if (!targetUser) {
    throw new AppError('User not found with that email', 404);
  }

  // Check if already a collaborator
  const existingCollab = doc.collaborators.find(
    (c) => c.userId.toString() === targetUser._id.toString()
  );
  if (existingCollab) {
    existingCollab.role = role;
  } else {
    doc.collaborators.push({ userId: targetUser._id, role });
  }

  await doc.save();
  return { message: `Shared with ${targetEmail} as ${role}` };
};
