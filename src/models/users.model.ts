import mongoose, { Document, Model } from "mongoose";
import * as argon from "argon2";
import { Role } from "../enums";

export type UserAttrs = {
  email: string;
  password: string;
  name: string;
  subjectClasses: string[];
  role: Role;
};

interface UserDoc extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  subjectClasses: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface IUserModel extends Model<UserDoc> {
  build(attr: UserAttrs): UserDoc;
}

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true, enum: Object.values(Role) },
    subjectClasses: { type: [mongoose.Types.ObjectId], ref: "SubjectClass" },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

schema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const hash = await argon.hash(this.password!);
  this.password = hash;
  return;
});

schema.index({ name: "text" });

schema.statics.build = (attr: UserAttrs) => {
  return new UserModel(attr);
};

const UserModel = mongoose.model<UserDoc, IUserModel>("User", schema);

export { UserModel };
