import bcryptsjs from "bcryptjs";

async function hash(password) {
  const rounds = getnumberOfRounds();
  return await bcryptsjs.hash(password, rounds);
}

function getnumberOfRounds() {
  return parseInt(process.env.PASSWORD_HASH_ROUNDS);
}

async function compare(password, passwordInDatabase) {
  return bcryptsjs.compare(password, passwordInDatabase);
}

const password = {
  hash,
  compare,
};

export default password;
