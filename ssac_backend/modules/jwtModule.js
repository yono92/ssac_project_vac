const jwt = require("jsonwebtoken");
const jwtSecret = require("../config/jwtSecret.json");

const jwtModule = {
  create: (payload) => {
    // jwt 생성

    const option = {
      algorithm: "HS256",
      expiresIn: "30d",
      issuer: "ssac",
    };

    const token = jwt.sign(payload, jwtSecret.secretKey, option);

    return token;
  },
  verify: (token) => {
    // jwt 확인
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret.secretKey);
    } catch (error) {
      console.log(error);
      if (error.message === "jwt expired") {
        console.log("expired token");
        return -1;
      } else if (error.message === "invalid token") {
        console.log("invalid token");
        return -2;
      } else {
        console.log("error token");
        return -3;
      }
    }
    return decoded;
  },
};

module.exports = jwtModule;
