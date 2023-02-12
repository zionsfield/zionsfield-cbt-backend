import { SubjectClassModel } from "../schemas/subjectClasses.schema";
/* Services */
export const getSubjectClasses = async (filter: {
  [key: string]: any;
  inUse?: boolean;
}) => {
  Object.keys(filter).forEach((key) => {
    if (
      !filter[key] &&
      !!filter[key] !== false &&
      parseInt(filter[key]!.toString()) !== 0
    ) {
      delete filter[key];
    }
  });
  return await SubjectClassModel.find(filter)
    .sort({
      subject: "desc",
    })
    .populate([
      {
        path: "subject",
      },
      {
        path: "class",
      },
    ]);
};

export const addSubjectClass = async (subject: string, classId: string) => {
  return await SubjectClassModel.build({
    subject,
    class: classId,
  }).save();
};
