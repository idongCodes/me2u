import mongoose, { Schema, Document } from "mongoose";

export interface IReservation extends Document {
  name: string;
  email: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (24-hour format or AM/PM string, let's stick to HH:mm)
  optIn: "sms" | "email" | "both" | "none";
  items: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  editToken: string;
  editCount: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
}

const ReservationSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    time: { type: String, required: true }, // Format: "10:00", "10:30", etc.
    optIn: { type: String, enum: ["sms", "email", "both", "none"], default: "none" },
    items: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    editToken: { type: String, required: true },
    editCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Reservation ||
  mongoose.model<IReservation>("Reservation", ReservationSchema);
