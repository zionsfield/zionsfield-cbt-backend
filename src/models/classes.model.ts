import mongoose, { Document, Model } from "mongoose";

export type ClassAttrs = {
  className: string;
  level: number;
};

export interface ClassDoc extends Document {
  className: string;
  level: number;
  createdAt: Date;
  updatedAt: Date;
}

interface IClassModel extends Model<ClassDoc> {
  build(attrs: ClassAttrs): ClassDoc;
}

const schema = new mongoose.Schema(
  {
    className: { type: String, required: true },
    level: { type: Number, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

schema.statics.build = (attr: ClassAttrs) => {
  return new ClassModel(attr);
};

const ClassModel = mongoose.model<ClassDoc, IClassModel>("Class", schema);

export { ClassModel };
