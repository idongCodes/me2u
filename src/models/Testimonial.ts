import mongoose, { Schema, Document } from "mongoose";

export interface ITestimonial extends Document {
  name: string;
  location: string;
  content: string;
  status: "pending" | "approved";
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String, default: "Worcester County" },
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Testimonial ||
  mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);
