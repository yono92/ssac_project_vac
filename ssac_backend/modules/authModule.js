const user = require("../models/user");
const jwtModule = require("./jwtModule");

// Middleware 형태로 사용 예정
const authModule = {
  loggedIn: async function (req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
      // status 409 : authorization 관련 에러 코드
      return res.status(409).json({
        message: "토큰 없음",
      });
    }

    const decoded = jwtModule.verify(token);
    if (decoded === -1) {
      return res.status(409).json({
        message: "만료된 토큰",
      });
    } else if (decoded === -2) {
      return res.status(409).json({
        message: "유효하지 않은 토큰",
      });
    } else if (decoded === -3) {
      return res.status(409).json({
        message: "토큰 에러",
      });
    }
    let userInfo;
    try {
      userInfo = await user.findOne({ email: decoded.email });
    } catch (error) {
      return res.status(500).json({
        message: "유효하지 않은 유저",
      });
    }
    req.userInfo = userInfo;
    next();
  },
  checkVerified: async function (req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
      // status 409 : authorization 관련 에러 코드
      return res.status(409).json({
        message: "토큰 없음",
      });
    }

    const decoded = jwtModule.verify(token);
    if (decoded === -1) {
      return res.status(409).json({
        message: "만료된 토큰",
      });
    } else if (decoded === -2) {
      return res.status(400).json({
        message: "유효하지 않은 토큰",
      });
    } else if (decoded === -3) {
      return res.status(409).json({
        message: "토큰 에러",
      });
    }

    let userInfo;
    try {
      userInfo = await user.findOne({ email: decoded.email });
      if (!decoded.verified) {
        return res.status(309).json({
          message: "추가 정보를 입력해주세요",
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "유효하지 않은 유저",
      });
    }
    req.userInfo = userInfo;
    next();

    console.log(userInfo);
  },
  loggedInTest: async function (req, res, next) {},
};

function checkTocken(token) {
  if (!token) {
    // status 409 : authorization 관련 에러 코드
    return res.status(409).json({
      message: "토큰 없음",
    });
  }

  const decoded = jwtModule.verify(token);
  if (decoded === -1) {
    return res.status(409).json({
      message: "만료된 토큰",
    });
  } else if (decoded === -2) {
    return res.status(409).json({
      message: "유효하지 않은 토큰",
    });
  } else if (decoded === -3) {
    return res.status(409).json({
      message: "토큰 에러",
    });
  }
}

module.exports = authModule;
