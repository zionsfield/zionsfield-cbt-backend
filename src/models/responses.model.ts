import mongoose, { Document, Model } from "mongoose";
import { Option } from "../enums";

export type ResponseAttrs = {
  examId: string;
  studentId: string;
  questionId: string;
  optionPicked: Option;
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
    optionPicked: { type: String, required: true, enum: Object.values(Option) },
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

schema.statics.build = (attr: ResponseAttrs) => {
  return new ResponseModel(attr);
};

const ResponseModel = mongoose.model<ResponseDoc, IResponseModel>(
  "Response",
  schema
);

export { ResponseModel };
