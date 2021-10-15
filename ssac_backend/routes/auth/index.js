var express = require("express");
var router = express.Router();
const authController = require("../../controllers/auth/AuthController");
const authModule = require("../../modules/authModule");
const upload = require("../../modules/awsUpload");

//라우터 접근 인증 조건 없음
router.post("/signup", authController.signup);
router.post("/signin", authController.signin);

//회원 정보 수정 과정에서 이미지 업로드와 정보 저장은 별개라고 가정. (S3에 temp와 uerprofile 폴더 구분 필요)
// 프로필 이미지 업로드(s3)
router.post("/images", upload.single("img"), authController.uploadImage);

//회원 수정 및 탈퇴 : 가입된 회원이면 가능
router.put(
  "/update/:userId",
  authModule.loggedIn,
  authController.updateUserInfo
);
router.delete("/leave/:userId", authModule.loggedIn, authController.deleteUser);

//비밀번호를 제외한 회원 정보 전송
router.get("/profile", authModule.loggedIn, authController.profile);

module.exports = router;
