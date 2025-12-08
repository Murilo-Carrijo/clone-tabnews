import bcryptjs from "bcryptjs";

const hash = async (password) => {
  const rounds = Number(process.env.ROUNDS);
  return await bcryptjs.hash(`${password}${process.env.PEPPER}`, rounds);
};

const compare = async (providedPassword, soteredPassword) => {
  return await bcryptjs.compare(providedPassword, soteredPassword);
};

const password = {
  hash,
  compare,
};

export default password;
