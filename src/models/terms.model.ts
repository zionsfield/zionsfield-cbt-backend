import mongoose, { Document, Model } from "mongoose";

export type TermAttrs = {
  startYear: number;
  endYear: number;
  term: number;
  current?: boolean;
};

export interface TermDoc extends Document {
  startYear: number;
  endYear: number;
  current: boolean;
  term: number;
}

interface ITermModel extends Model<TermDoc> {
  build(user: TermAttrs): TermDoc;
}

const schema = new mongoose.Schema(
  {
    startYear: { type: Number, required: true },
    endYear: { type: Number, required: true },
    term: { type: Number, required: true },
    current: { type: Boolean, default: false },
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

schema.pre("save", async function () {
  if (this.current === undefined) this.current = false;
  return;
});

schema.statics.build = (attr: TermAttrs) => {
  return new TermModel(attr);
};

const TermModel = mongoose.model<TermDoc, ITermModel>("Term", schema);
export { TermModel };
