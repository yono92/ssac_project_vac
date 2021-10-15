const user = require("../../models/user");
const jwtModule = require("../../modules/jwtModule");

const AuthController = {
  signup: async function (req, res) {
    const { email, password, nickName } = req.body;
    try {
      const checkEmail = await user.findOne({ email: email });
      const checkNickName = await user.findOne({ nickName: nickName });

      if (!checkEmail && !checkNickName) {
        const userModel = new user({ email, nickName, password });
        await userModel.save();

        //accessTocken 생성
        const payload = {
          email: userModel.email,
          verified: userModel.verified,
        };
        const token = jwtModule.create(payload);
        console.log(token);

        return res.status(200).json({
          message: "신규 가입 성공",
          accessToken: token,
        });
      } else if (checkEmail) {
        return res.status(409).json({
          message: "동일한 email이 존재합니다.",
        });
      } else if (checkNickName) {
        return res.status(409).json({
          message: "동일한 닉네임이 존재합니다.",
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "서버 에러",
        error: error,
      });
    }
  },
  signin: async function (req, res) {
    const { email, password } = req.body;
    try {
      const result = await user.findOne({ email: email });

      if (!result) {
        return res.status(400).json({
          message: "해당 email이 존재하지 않습니다.",
        });
      } else {
        //해당 id의 유저가 존재하는 경우, 비밀번호를 확인하여 isMatch로 결과 반환
        result.comparePassword(password, (err, isMatch) => {
          if (isMatch) {
            //id&pw 일치 시 jwt token 생성 - id와 이름을 담음
            const payload = {
              email: result.email,
              verified: result.verified,
            };
            const token = jwtModule.create(payload);
            console.log(token);
            return res.status(200).json({
              message: "로그인 성공",
              accessToken: token,
            });
          } else {
            console.log("pw 불일치");
            return res.status(400).json({
              message: "비밀번호가 틀렸습니다.",
            });
          }
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "서버 에러",
        error: error,
      });
    }
  },
  deleteUser: async function (req, res) {
    const userInfo = req.userInfo;
    const userId = req.params.userId;

    if (userInfo._id.toString() !== userId) {
      return res.status(409).json({
        message: "회원 탈퇴는 회원 본인만 신청 가능합니다.",
      });
    } else {
      try {
        await user.findByIdAndDelete(userId);
        return res.status(200).json({
          message: "회원 탈퇴 완료",
        });
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          message: "DB 서버 에러",
        });
      }
    }
  },
  updateUserInfo: async function (req, res) {
    const userInfo = req.userInfo;
    const userId = req.params.userId;

    if (userInfo._id.toString() !== userId) {
      return res.status(409).json({
        message: "회원 정보 수정은 회원 본인만 신청 가능합니다.",
      });
    } else {
      try {
        //프론트에서 개인정보 수정시, userInfo를 read하여 모든 field의 정보를 한번에 보내준다고 가정
        //프론트의 로직에 따라 추후 수정 필요
        //email은 수정 불가
        const {
          nickName,
          password,
          type,
          age,
          gender,
          inoDate1,
          inoDate2,
          profileImage,
        } = req.body;

        // verified의 기본값은 false - 추가정보 5종 모두 입력 시 true로 변환
        let verified = false;

        if (
          bDay !== null &&
          gender !== null &&
          profileImage !== null &&
          inoInfo !== null
        ) {
          verified = true;
        }

        const updated = await user.findByIdAndUpdate(
          userId,
          {
            email,
            nickName,
            password,
            type,
            age,
            gender,
            inoDate1,
            inoDate2,
            profileImage,
            updateDate: new Date(),
            verified: verified,
          },
          { new: true }
        );

        return res.status(200).json({
          message: "회원 정보 수정 성공",
          data: updated,
        });
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          message: "DB 서버 에러",
        });
      }
    }
  },
  uploadImage: function (req, res) {
    const img = req.file;
    if (img) {
      res.status(200).json({
        message: "이미지 업로드 완료",
        imgUrl: img.location,
      });
    } else {
      res.status(400).json({
        message: "이미지 업로드 실패",
      });
    }
  },
  profile: function (req, res) {
    let userInfo = req.userInfo;
    userInfo.password = null;

    res.status(200).json({
      message: "해당 회원 정보 전송",
      data: userInfo,
    });
  },
};

module.exports = AuthController;
