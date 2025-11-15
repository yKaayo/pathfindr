export const extractSkills = async (req, rep) => {
  const {
    fullName,
    email,
    linkedin,
    github,
    summary,
    skills,
    experience,
    education,
    certifications,
    languages,
    data,
  } = JSON.parse(req.body.data);

  if (
    fullName == null ||
    email == null ||
    linkedin == null ||
    github == null ||
    summary == null ||
    skills == null ||
    experience == null ||
    education == null ||
    certifications == null ||
    languages == null
  ) {
    return rep.status(400).send({ success: false, error: "Dados incompletos" });
  }
};
