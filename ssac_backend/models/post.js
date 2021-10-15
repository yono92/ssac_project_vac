const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Schema를 정의하는 2가지 방법
const postSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: Number, default: 0 }, //글 카테고리
  tags: [String], //여러개의 해쉬태그를 입력 - 배열
  publishDate: { type: Date, default: new Date() },
  updateDate: { type: Date, default: null },
  writer: { type: mongoose.Schema.Types.ObjectId, ref: "user" }, // user table 연결
  comments: [
    {
      commentWriter: { type: mongoose.Schema.Types.ObjectId, ref: "user" }, // user table 연결
      commentContent: { type: String, required: true },
      commmetDate: { type: Date, required: true, default: new Date() },
      isEdited: { type: Boolean, default: false },
    },
  ],
});

postSchema.statics.checkWriter = async function (params) {
  const { postId, writerId } = params;
  try {
    const ownPost = await this.findOne({ _id: postId }); //this는 schema 혹은 model
    const ownId = ownPost.writer;
    if (ownId.toString() !== writerId.toString()) return -1;
    else return 1;
  } catch (error) {
    return -2;
  }
};

postSchema.statics.checkCommentWriter = async function (params) {
  const { postId, commentId, writerId } = params;
  try {
    const ownPost = await this.findOne({ _id: postId });
    const ownCommentIndex = ownPost.comments.findIndex(
      (i) => i._id == commentId
    );
    const ownId = ownPost.comments[ownCommentIndex].commentWriter;
    if (ownId.toString() !== writerId.toString()) return -1;
    else return ownCommentIndex;
  } catch (error) {
    return -2;
  }
};

module.exports = mongoose.model("post", postSchema);
