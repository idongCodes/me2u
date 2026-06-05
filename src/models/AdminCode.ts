import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminCode extends Document {
  phone: string;
  code: string;
  expiresAt: Date;
}

const AdminCodeSchema: Schema = new Schema({
  phone: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

// Automatically delete expired documents (TTL index)
AdminCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.AdminCode || mongoose.model<IAdminCode>('AdminCode', AdminCodeSchema);
