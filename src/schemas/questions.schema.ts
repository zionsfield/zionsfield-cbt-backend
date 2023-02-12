import mongoose, { Document, Model } from "mongoose";
import { Option } from "../enums";

export type QuestionAttrs = {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: Option;
};

export interface QuestionDoc extends Document {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
}

interface IQuestionModel extends Model<QuestionDoc> {
  build(attrs: QuestionAttrs): QuestionDoc;
}

const schema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    optionA: { type: String, required: true },
    optionB: { type: String, required: true },
    optionC: { type: String, required: true },
    optionD: { type: String, required: true },
    correctOption: {
      type: String,
      required: true,
      enum: Object.values(Option),
    },
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

schema.statics.build = (attr: QuestionAttrs) => {
  return new QuestionModel(attr);
};

const QuestionModel = mongoose.model<QuestionDoc, IQuestionModel>(
  "Question",
  schema
);

export { QuestionModel };
