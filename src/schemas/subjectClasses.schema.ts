import mongoose, { Document, Model } from "mongoose";

export type SubjectClassAttrs = {
  class: string;
  subject: string;
};

export interface SubjectClassDoc extends Document {
  class: string;
  subject: string;
  inUse: boolean;
}

interface ISubjectClassModel extends Model<SubjectClassDoc> {
  build(attr: SubjectClassAttrs): SubjectClassDoc;
}

const schema = new mongoose.Schema(
  {
    class: { type: mongoose.Types.ObjectId, ref: "Class" },
    subject: { type: mongoose.Types.ObjectId, ref: "Subject" },
    inUse: { type: Boolean, default: false },
  },
  {
    toJSON: {
      transform(_, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

schema.statics.build = (attr: SubjectClassAttrs) => {
  return new SubjectClassModel(attr);
};

const SubjectClassModel = mongoose.model<SubjectClassDoc, ISubjectClassModel>(
  "SubjectClass",
  schema
);

export { SubjectClassModel };
