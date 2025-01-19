// "/api/status"

const status = (_req, res) => {
  return res.status(200).json({ status: "Ok" });
};

export default status;
