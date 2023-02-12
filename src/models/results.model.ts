import mongoose, { Document, Model } from "mongoose";
import { Option } from "../enums";
import { CorrectQuestion } from "../utils/typings.d";

export type ResultAttrs = {
  examId: string;
  studentId: string;
  marks: number;
  correctQuestions: CorrectQuestion[];
  incorrectQuestions: CorrectQuestion[];
};

export interface ResultDoc extends Document {
  examId: string;
  studentId: string;
  marks: number;
  correctQuestions: CorrectQuestion[];
  incorrectQuestions: CorrectQuestion[];
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
    correctQuestions: {
      type: [
        {
          questionId: String,
          optionPicked: String,
        },
      ],
      required: true,
    },
    incorrectQuestions: {
      type: [
        {
          questionId: String,
          optionPicked: String,
        },
      ],
      required: true,
    },
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

schema.statics.build = (attr: ResultAttrs) => {
  return new ResultModel(attr);
};

const ResultModel = mongoose.model<ResultDoc, IResultModel>("Result", schema);

export { ResultModel };
