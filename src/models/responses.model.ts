import mongoose, { Document, Model } from "mongoose";
import { Option } from "../enums";

export type ResponseAttrs = {
  examId: string;
  studentId: string;
  questionId: string;
  optionPicked?: string;
};

export interface ResponseDoc extends Document {
  examId: string;
  studentId: string;
  questionId: string;
  optionPicked: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IResponseModel extends Model<ResponseDoc> {
  build(attrs: ResponseAttrs): ResponseDoc;
}

const schema = new mongoose.Schema(
  {
    examId: { type: mongoose.Types.ObjectId, ref: "Exam", required: true },
    studentId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    questionId: {
      type: mongoose.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    optionPicked: { type: String },
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

schema.index({ questionId: 1, studentId: 1 }, { unique: true });

schema.statics.build = (attr: ResponseAttrs) => {
  return new ResponseModel(attr);
};

const ResponseModel = mongoose.model<ResponseDoc, IResponseModel>(
  "Response",
  schema
);

export { ResponseModel };
