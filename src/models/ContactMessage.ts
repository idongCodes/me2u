import mongoose, { Schema, Document } from 'mongoose';

export interface IContactMessage extends Document {
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  subject: string;
  body: string;
  status: 'unread' | 'read' | 'archived' | 'spam' | 'trash';
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    senderName: { type: String, required: true },
    senderEmail: { type: String, required: true },
    senderPhone: { type: String },
    subject: { type: String, default: 'No Subject' },
    body: { type: String, required: true },
    status: {
      type: String,
      enum: ['unread', 'read', 'archived', 'spam', 'trash'],
      default: 'unread',
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.ContactMessage ||
  mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);
