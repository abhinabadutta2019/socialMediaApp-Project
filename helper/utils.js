const bcrypt = require("bcryptjs");

let hashPass = async (passString) => {
  try {
    let stringPassword = passString.toString();
    let saltRounds = 10;
    let hashedPassword = await bcrypt.hash(stringPassword, saltRounds);
    if (!hashedPassword) {
      throw new Error("Password not hashed");
    }
    console.log(hashedPassword, "hashedPassword from hashPass");
    return hashedPassword;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = {
  hashPass,
};
