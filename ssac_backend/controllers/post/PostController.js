const post = require("../../models/post");

const PostController = {
  readAll: async function (req, res) {
    try {
      // writer의 oid 정보와 연결된 collection인 user로부터 원하는 column인 nickName 정보를 받아옴
      //populate 대상은 front 구현시 필요 정보 정의 후 확정
      const result = await post.find().populate("writer", "nickName");
      if (!result) {
        return res.status(400).json({
          message: "게시물 조회 실패",
        });
      } else {
        res.status(200).json({
          message: "게시물 조회 성공",
          data: result,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "DB 서버 에러",
        error: error,
      });
    }
  },
  readExactPost: async function (req, res) {
    const { id } = req.params;
    try {
      //populate 대상은 front 구현시 필요 정보 정의 후 확정
      const result = await post.findById(id).populate("writer", "nickName");
      if (result) {
        return res.status(200).json({
          message: "조회 성공",
          data: result,
        });
      } else {
        return res.status(400).json({
          message: "해당 id의 게시글이 존재하지 않습니다",
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "조회 실패",
        error: error,
      });
    }
  },
  readRelated: async function (req, res) {
    const { writerId } = req.params;
    try {
      //populate 대상은 front 구현시 필요 정보 정의 후 확정
      const result = await post
        .find({ writer: writerId })
        .populate("writer", "nickName");
      if (result) {
        return res.status(200).json({
          message: "조회 성공",
          data: result,
        });
      } else {
        return res.status(400).json({
          message: "해당 id의 게시글이 존재하지 않습니다",
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "조회 실패",
        error: error,
      });
    }
  },
  createPost: function (req, res) {
    const userInfo = req.userInfo;
    const { title, content, tags, category } = req.body;

    const boardModel = new post({
      title,
      content,
      category,
      tags,
      publishDate: new Date(),
      writer: userInfo._id,
    });

    boardModel
      .save()
      .then((savedPost) => {
        res.status(200).json({
          message: "게시물 생성 성공",
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: "DB 서버 에러",
        });
      });
  },
  updatePost: async function (req, res) {
    const userInfo = req.userInfo;
    const { id } = req.params; //게시물의 id를 parameter로 받음

    //글쓴이=삭제요청자 인 경우에만 수정 허용
    const isSameWriter = await post.checkWriter({
      postId: id,
      writerId: userInfo._id,
    });

    if (isSameWriter === -1) {
      return res.status(409).json({ message: "접근 권한이 없습니다." });
    } else if (isSameWriter === -2) {
      return res.status(500).json({ message: "DB 서버 에러" });
    } else {
      try {
        const { title, content, tags, category } = req.body;
        const updated = await post.findByIdAndUpdate(
          id,
          {
            title,
            content,
            tags,
            category,
            updateDate: new Date(),
          },
          { new: true }
        );
        res.status(200).json({
          message: "게시물 수정 완료",
          data: updated,
        });
      } catch (error) {
        res.status(500).json({
          message: "게시물 수정 실패",
          error: error,
        });
        console.log(error);
      }
    }
  },
  deletePost: async function (req, res) {
    const userInfo = req.userInfo;
    const { id } = req.params; //게시물의 id를 parameter로 받음

    //글쓴이=삭제요청자 인 경우에만 삭제
    const isSameWriter = await post.checkWriter({
      postId: id,
      writerId: userInfo._id,
    });

    if (isSameWriter === -1) {
      return res.status(409).json({ message: "접근 권한이 없습니다." });
    } else if (isSameWriter === -2) {
      return res.status(500).json({ message: "DB 서버 에러" });
    } else {
      try {
        await post.findByIdAndDelete(id);
        res.status(200).json({
          message: "게시물 삭제 완료",
        });
      } catch (error) {
        res.status(500).json({
          message: "게시물 삭제 실패",
          error: error,
        });
      }
    }
  },
  createComment: async function (req, res) {
    const userInfo = req.userInfo;
    const { content } = req.body;
    const { id } = req.params;

    const newComment = {
      commentWriter: userInfo._id,
      commentContent: content,
      commentDate: new Date(),
    };
    try {
      const updated = await post.findByIdAndUpdate(
        id,
        { $push: { comments: newComment } },
        { new: true }
      );
      res.status(200).json({
        message: "댓글 생성 성공",
      });
    } catch (error) {
      res.status(500).json({
        message: "DB 서버 에러",
      });
    }
  },
  deleteComment: async function (req, res) {
    const userInfo = req.userInfo;
    const postId = req.params.id;
    const commentId = req.params.commentid;

    //삭제요청자=댓글작성자 확인 - 해당 comment의 index 반환
    const isSameWriter = await post.checkCommentWriter({
      postId: postId,
      commentId: commentId,
      writerId: userInfo._id,
    });

    if (isSameWriter === -1) {
      return res.status(409).json({ message: "접근 권한이 없습니다." });
    } else if (isSameWriter === -2) {
      return res.status(500).json({ message: "DB 서버 에러" });
    } else {
      try {
        const updated = await post.findByIdAndUpdate(
          postId,
          { $pull: { comments: { _id: commentId } } },
          { new: true }
        );
        res.status(200).json({
          message: "댓글 삭제 완료",
        });
      } catch (error) {
        res.status(500).json({
          message: "DB 서버 에러",
        });
      }
    }
  },
  updateComment: async function (req, res) {
    const userInfo = req.userInfo;
    const postId = req.params.id;
    const commentId = req.params.commentid;
    const { content } = req.body;

    //삭제요청자=댓글작성자 확인 - 해당 comment의 index 반환
    const isSameWriter = await post.checkCommentWriter({
      postId: postId,
      commentId: commentId,
      writerId: userInfo._id,
    });

    if (isSameWriter === -1) {
      return res.status(409).json({ message: "접근 권한이 없습니다." });
    } else if (isSameWriter === -2) {
      return res.status(500).json({ message: "DB 서버 에러" });
    } else {
      try {
        const updated = await post.findOneAndUpdate(
          { _id: postId, "comments._id": commentId },
          {
            $set: {
              "comments.$.commentContent": content,
              "comments.$.commentDate": new Date(),
              "comments.$.isEdited": true,
            },
          },
          { new: true }
        );
        res.status(200).json({
          message: "댓글 수정 완료",
        });
      } catch (error) {
        res.status(500).json({
          message: "DB 서버 에러",
        });
      }
    }
  },
};

module.exports = PostController;
