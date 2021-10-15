const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  //회원가입 필수 정보: email ,nickName, password
  email: { type: String, required: true, unique: true },
  nickName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // 추가정보 : 백신 타입, 나이, 성별, 백신접종날짜
  bDay: { type: Date, default: null },
  gender: { type: Number, enum: [0, 1, 2, null], default: null }, //0 : 여자, 1 : 남자, 2 : 기타
  profileImage: { type: String, default: null }, //S3 img file url
  signupDate: { type: Date, default: new Date() },
  updateDate: { type: Date, default: null },

  //추가정보 5가지를 모두 입력 시 verified=true, 그 외에는 false
  verified: { type: Boolean, default: false },
  inoInfo: [
    {
      inoDate: { type: Date, default: null },
      type: {
        type: String,
        enum: ["Moderna", "Pfizer", "AZ", "Jonhsen", null],
        default: null,
      },
      degree: { type: Number, default: 0 },
    },
  ],
});

// ---------------------------------------DB 내 password 암호화를 위한 구현 ------------------
// bcrypt package 이용 - node.js 내장모듈인 crypto보다 더 보안성이 뛰어남

// 회원 비밀번호는 암호화하여 저장
const bcrypt = require("bcrypt");
const saltRounds = 10; // 간단히 암호화 interation controll - 클수록 암호화가 오래 걸림

userSchema.pre("save", function (next) {
  var user = this; // userSchema 를 가리키고 있는 것

  // if문이 없다면 이름이든 이메일이든 어떤 값을 변경할 때마다 매번 비밀번호를 암호화 처리하게 됨
  if (user.isModified("password")) {
    // password가 변경될 때만 처리
    // saltRounds를 이용해서 salt 생성하고, salt 를 이용해서 비밀번호 암호화
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err); // next 하면 user.save()로 바로 넘어감
      bcrypt.hash(user.password, salt, function (err, hash) {
        // user.password를 salt를 이용해서 암호화하여 hash (암호화 된 비밀번호) 로 만든다
        if (err) return next(err);
        user.password = hash;
        next(); // user.save() 실행
      });
    });
  } else {
    // 비밀번호가 아니라 다른 항목을 바꾼 경우에는 그냥 나가기
    next();
  }
});

// 입력받은 비밀번호와 DB내 암호화된 비밀번호가 일치하는지 확인하는 method
/* 
    function을 만들 때 동일하게 인자로 plainPassword와 callback function(cb)를 줌. 
    암호화 하기 전 비밀번호와 암호화한 후에 비밀번호가 같은지 체크하려면 
    plainPassword를 암호화해서 데이터베이스에 들어있는 암호화된 비밀번호와 일치하는지 봐야함 
    암호화된걸 복호화 할 수는 없음. 따라서 다시 bcrypt를 가져와서 compare 메소드 사용. 
    첫번째 인자로 plainPassword 주고, 두번째 인자로 암호화된 password 줌. 마지막 인자로 callback function 줌. 
    비밀번호가 같지 않으면 cb(err)를 return.
    비밀번호가 같으면 cb(null, isMatch) error는 없고 isMatch를 줌. 여기서 isMatch는 true일 것.
  */
userSchema.methods.comparePassword = function (plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    // arrow 안쓰는 이유 : 함수 내에서 this를 호출해야 하기 때문. 화살표 함수는 this를 바인딩하지 않음
    if (err) {
      return cb(err);
    } else {
      cb(null, isMatch);
    }
  });
};

module.exports = mongoose.model("user", userSchema);
