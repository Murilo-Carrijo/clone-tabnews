import database from "infra/database.js";

const status = async (req, res) => {
  const resutl = await database.query("SELECT 1 + 1 as sum;");
  console.log("resutl =>", resutl.rows);
  return res.status(200).json({ status: "Ok" });
};

export default status;
