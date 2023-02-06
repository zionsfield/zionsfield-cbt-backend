import { BadRequestError } from "../errors/bad-request-error";
import { NotFoundError } from "../errors/not-found-error";
import { TermModel } from "../models/terms.model";

/* Services */
export const getTerms = async () => {
  return await TermModel.find().sort({
    createdAt: "desc",
  });
};

export const getCurrentTerm = async () => {
  const term = await TermModel.find({ current: true });
  if (!term[0]) throw new Error("Terms empty");
  return term[0];
};

export const removeTerm = async () => {
  let terms = await getTerms();
  if (terms.length === 1) throw new BadRequestError("Cannot delete all terms");
  await TermModel.deleteOne({ current: true });
  terms = await getTerms();
  if (terms.length > 0) {
    terms[0].current = true;
    terms[0].save();
  }
  return await getTerms();
};

export const addTerm = async () => {
  const currTerm = await getCurrentTerm();
  if (!currTerm) throw new NotFoundError("Term");
  const currSessionStartYear = currTerm.startYear;
  const currSessionEndYear = currTerm.endYear;
  const currSessionTerm = currTerm.term;
  let newSessionStartYear = currSessionStartYear;
  let newSessionEndYear = currSessionEndYear;
  let newSessionTerm: number;
  if (currSessionTerm < 3) newSessionTerm = currSessionTerm + 1;
  else {
    newSessionStartYear = currSessionStartYear + 1;
    newSessionEndYear = currSessionEndYear + 1;
    newSessionTerm = 1;
  }
  await TermModel.updateMany({ current: true }, { $set: { current: false } });
  return await TermModel.build({
    startYear: newSessionStartYear,
    endYear: newSessionEndYear,
    term: newSessionTerm,
    current: true,
  }).save();
};
