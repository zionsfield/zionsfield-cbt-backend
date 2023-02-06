import { SubjectModel } from "../models/subjects.model";
import { CreateSubjectInput } from "../validators/subjects.validator";
import { addSubjectClass } from "./subjectClasses.service";

/* Services */
export const createSubject = async ({ name, classes }: CreateSubjectInput) => {
  let subject: any = await SubjectModel.findOne({ name });
  if (subject) return;
  else {
    subject = await SubjectModel.build({ name, classes }).save();
  }
  for (const c of classes) {
    await addSubjectClass(subject.id, c);
  }
};
