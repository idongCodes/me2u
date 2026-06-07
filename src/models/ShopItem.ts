import mongoose, { Schema, Document } from "mongoose";

export interface IShopItem extends Document {
  name: string;
  price: number;
  description: string;
  images: string[];
  status: "available" | "reserved" | "sold";
  category?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ShopItemSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    images: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["available", "reserved", "sold"],
      default: "available",
    },
    category: { type: String },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.ShopItem ||
  mongoose.model<IShopItem>("ShopItem", ShopItemSchema);
