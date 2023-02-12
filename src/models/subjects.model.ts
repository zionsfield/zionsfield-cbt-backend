import mongoose, { Document, Model } from "mongoose";

export type SubjectAttrs = {
  name: string;
  classes: string[];
};

export interface SubjectDoc extends Document {
  name: string;
  classes: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ISubjectModel extends Model<SubjectDoc> {
  build(attrs: SubjectAttrs): SubjectDoc;
}

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    classes: { type: [mongoose.Types.ObjectId], ref: "Class" },
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

schema.statics.build = (attr: SubjectAttrs) => {
  return new SubjectModel(attr);
};

const SubjectModel = mongoose.model<SubjectDoc, ISubjectModel>(
  "Subject",
  schema
);

export { SubjectModel };
