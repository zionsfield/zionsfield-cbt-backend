import mongoose, { Document, Model } from "mongoose";

export type ExamAttrs = {
  name: string;
  subjectClass: string;
  questions: string[];
  questionNumber?: number;
  startTime: string;
  duration?: number;
  teacher: string;
  term: string;
};

export interface ExamDoc extends Document {
  name: string;
  subjectClass: string;
  questions: string[];
  questionNumber: number;
  startTime: Date;
  duration: number;
  term: string;
  teacher: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IExamModel extends Model<ExamDoc> {
  build(attrs: ExamAttrs): ExamDoc;
}

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    questions: {
      type: [mongoose.Types.ObjectId],
      ref: "Question",
    },
    subjectClass: {
      type: mongoose.Types.ObjectId,
      ref: "SubjectClass",
      required: true,
    },
    teacher: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    term: { type: mongoose.Types.ObjectId, ref: "Term", required: true },
    questionNumber: {
      type: Number,
      default: 40,
    },
    startTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      default: 60,
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

schema.pre("save", async function () {
  if (!this.isModified("startTime")) {
    return;
  }
  this.startTime = new Date(this.startTime);
  return;
});

schema.index({ name: "text" });

schema.statics.build = (attr: ExamAttrs) => {
  return new ExamModel(attr);
};

const ExamModel = mongoose.model<ExamDoc, IExamModel>("Exam", schema);

export { ExamModel };
