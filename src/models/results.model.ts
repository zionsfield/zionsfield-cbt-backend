import mongoose, { Document, Model } from "mongoose";
import { Option } from "../enums";

export type ResultAttrs = {
  examId: string;
  studentId: string;
  marks: number;
  correctQuestions: string[];
};

export interface ResultDoc extends Document {
  examId: string;
  studentId: string;
  marks: number;
  correctQuestions: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface IResultModel extends Model<ResultDoc> {
  build(attrs: ResultAttrs): ResultDoc;
}

const schema = new mongoose.Schema(
  {
    examId: { type: mongoose.Types.ObjectId, ref: "Exam", required: true },
    studentId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    marks: { type: Number, required: true },
    correctQuestions: { type: [String], ref: "Question", required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

schema.statics.build = (attr: ResultAttrs) => {
  return new ResultModel(attr);
};

const ResultModel = mongoose.model<ResultDoc, IResultModel>("Result", schema);

export { ResultModel };
