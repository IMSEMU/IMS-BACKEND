import { verifyToken } from "../middleware/verifyToken.js";
import { Op } from "sequelize";
import Students from "../models/student.model.js";
import Users from "../models/user.model.js";
import Notifications from "../models/notification.model.js";
import Posts from "../models/post.model.js";
import Likes from "../models/like.model.js";
import Bookmarks from "../models/bookmark.model.js";
import Comments from "../models/comment.model.js";

export const getFeed = async (req, res) => {
  try {
    // Check if user is logged in
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // Verify refresh token and get user ID
    const { userid } = await verifyToken(refreshToken);
    if (!userid) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const posts = await Posts.findAll({ order: [["createdAt", "DESC"]] });

    const feed = [];
    for (const post of posts) {
      const student = await Students.findOne({
        where: { stdid: post.stdid },
      });
      const postauthor = await Users.findOne({
        where: { userid: student.userId },
        attributes: ["firstname", "lastname", "email"],
      });

      const comments = [];
      const cmnt = await Comments.findAll({
        where: { postid: post.postid },
        order: [["createdAt", "DESC"]],
      });

      for (const comment of cmnt) {
        const cmntstdudent = await Students.findOne({
          where: { stdid: comment.stdid },
        });
        const commentauthor = await Users.findOne({
          where: { userid: cmntstdudent.userId },
          attributes: ["firstname", "lastname", "email"],
        });

        comments.push({
          comment,
          commentauthor,
          photo: cmntstdudent.photo,
        });
      }

      const likes = [];
      const likesList = await Likes.findAll({
        where: { postid: post.postid },
        order: [["createdAt", "DESC"]],
      });

      for (const like of likesList) {
        const likestudent = await Students.findOne({
          where: { stdid: like.stdid },
        });
        const likers = await Users.findOne({
          where: { userid: likestudent.userId },
          attributes: ["firstname", "lastname", "email"],
        });

        likes.push(likers);
      }

      const bookmarks = [];
      const bkmrksList = await Bookmarks.findAll({
        where: { postid: post.postid },
        order: [["createdAt", "DESC"]],
      });
      for (const bookmark of bkmrksList) {
        const bkmrkstudent = await Students.findOne({
          where: { stdid: bookmark.stdid },
        });
        const bookmarkers = await Users.findOne({
          where: { userid: bkmrkstudent.userId },
          attributes: ["firstname", "lastname", "email"],
        });

        bookmarks.push(bookmarkers);
      }

      feed.push({
        post,
        postauthor,
        photo: student.photo,
        comments,
        likes,
        bookmarks,
      });
    }

    res.status(200).json(feed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const addPost = async (req, res) => {
  const { text, media } = req.body;
  try {
    // Check if user is logged in
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // Verify refresh token and get user ID
    const { userid } = await verifyToken(refreshToken);
    if (!userid) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const student = await Students.findOne({
      where: { userId: userid },
    });

    const newPost = await Posts.create({
      text: text,
      media: media,
      stdid: student.stdid,
    });

    res.status(200).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const likePost = async (req, res) => {
  const { postid } = req.body;
  try {
    // Check if user is logged in
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // Verify refresh token and get user ID
    const { userid } = await verifyToken(refreshToken);
    if (!userid) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const stduser = await Users.findOne({
      where: { userid: userid },
    });

    const student = await Students.findOne({
      where: { userId: userid },
    });

    const [like, created] = await Likes.findOrCreate({
      where: { postid: postid, stdid: student.stdid },
      defaults: {
        postid: postid,
        stdid: student.stdid,
      },
    });

    if (created) {
      await Posts.increment("likesCount", {
        by: 1,
        where: { postid: postid },
      });

      const post = await Posts.findOne({
        where: { postid: postid },
      });

      const postauthor = await Students.findOne({
        where: { stdid: post.stdid },
      });

      await Notifications.create({
        trigger: "New Like",
        message: `${stduser.firstname} ${stduser.lastname} liked your post.`,
        userid: postauthor.userId,
      });
    }

    return res.status(200).json({ like });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const unlikePost = async (req, res) => {
  const { postid } = req.body;
  try {
    // Check if user is logged in
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // Verify refresh token and get user ID
    const { userid } = await verifyToken(refreshToken);
    if (!userid) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const student = await Students.findOne({
      where: { userId: userid },
    });

    const unlike = await Likes.destroy({
      where: { postid: postid, stdid: student.stdid },
    });

    await Posts.decrement("likesCount", {
      by: 1,
      where: { postid: postid },
    });
    return res.status(200).json({ unlike });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const deletePost = async (req, res) => {
  const { postid } = req.body;
  try {
    // Check if user is logged in
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // Verify refresh token and get user ID
    const { userid } = await verifyToken(refreshToken);
    if (!userid) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    await Posts.destroy({ where: { postid: postid } });
    await Likes.destroy({ where: { postid: postid } });
    await Comments.destroy({ where: { postid: postid } });
    await Bookmarks.destroy({ where: { postid: postid } });

    return res.status(200).json({ msg: "Post Deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const addComment = async (req, res) => {
  const { text, media, postid } = req.body;
  try {
    // Check if user is logged in
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // Verify refresh token and get user ID
    const { userid } = await verifyToken(refreshToken);
    if (!userid) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const student = await Students.findOne({
      where: { userId: userid },
    });

    const newComment = await Comments.create({
      text: text,
      media: media,
      postid: postid,
      stdid: student.stdid,
    });

    await Posts.increment("commentsCount", {
      by: 1,
      where: { postid: postid },
    }),
      res.status(200).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const deleteComment = async (req, res) => {
  const { commentid } = req.body;
  try {
    // Check if user is logged in
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // Verify refresh token and get user ID
    const { userid } = await verifyToken(refreshToken);
    if (!userid) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const comment = await Comments.findOne({
      where: { commentid: commentid },
    });

    await Comments.destroy({
      where: { commentid: commentid },
    });
    await Posts.decrement("commentsCount", {
      by: 1,
      where: { postid: comment.postid },
    });
    res.status(200).json({ msg: "Comment Deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const getBookmarks = async (req, res) => {
  try {
    // Check if user is logged in
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // Verify refresh token and get user ID
    const { userid } = await verifyToken(refreshToken);
    if (!userid) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const student = await Students.findOne({
      where: { userId: userid },
    });

    const bookmarks = await Bookmarks.findAll({
      where: { stdid: student.stdid },
      order: [["createdAt", "DESC"]],
    });

    const feed = [];
    for (const bookmark of bookmarks) {
      const post = await Posts.findOne({
        where: { postid: bookmark.postid },
      });

      const poststudent = await Students.findOne({
        where: { stdid: post.stdid },
      });

      const postauthor = await Users.findOne({
        where: { userid: poststudent.userId },
        attributes: ["firstname", "lastname", "email"],
      });

      const comments = [];
      const cmnt = await Comments.findAll({
        where: { postid: post.postid },
        order: [["createdAt", "DESC"]],
      });

      for (const comment of cmnt) {
        const cmntstdudent = await Students.findOne({
          where: { stdid: comment.stdid },
        });
        const commentauthor = await Users.findOne({
          where: { userid: cmntstdudent.userId },
          attributes: ["firstname", "lastname", "email"],
        });

        comments.push({
          comment,
          commentauthor,
          photo: cmntstdudent.photo,
        });
      }

      const likes = [];
      const likesList = await Likes.findAll({
        where: { postid: post.postid },
        order: [["createdAt", "DESC"]],
      });

      for (const like of likesList) {
        const likestudent = await Students.findOne({
          where: { stdid: like.stdid },
        });
        const likers = await Users.findOne({
          where: { userid: likestudent.userId },
          attributes: ["firstname", "lastname", "email"],
        });

        likes.push(likers);
      }

      const bookmarks = [];
      const bkmrksList = await Bookmarks.findAll({
        where: { postid: post.postid },
        order: [["createdAt", "DESC"]],
      });
      for (const bookmark of bkmrksList) {
        const bkmrkstudent = await Students.findOne({
          where: { stdid: bookmark.stdid },
        });
        const bookmarkers = await Users.findOne({
          where: { userid: bkmrkstudent.userId },
          attributes: ["firstname", "lastname", "email"],
        });

        bookmarks.push(bookmarkers);
      }

      feed.push({
        post,
        postauthor,
        photo: poststudent.photo,
        comments,
        likes,
        bookmarks,
      });
    }

    res.status(200).json(feed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const bookmarkPost = async (req, res) => {
  const { postid } = req.body;
  try {
    // Check if user is logged in
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // Verify refresh token and get user ID
    const { userid } = await verifyToken(refreshToken);
    if (!userid) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const student = await Students.findOne({
      where: { userId: userid },
    });

    const [bookmark, created] = await Bookmarks.findOrCreate({
      where: { postid: postid, stdid: student.stdid },
      defaults: {
        postid: postid,
        stdid: student.stdid,
      },
    });

    res.status(200).json(bookmark);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const deleteBookmark = async (req, res) => {
  const { postid } = req.body;
  try {
    // Check if user is logged in
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // Verify refresh token and get user ID
    const { userid } = await verifyToken(refreshToken);
    if (!userid) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const student = await Students.findOne({
      where: { userid: userid },
    });

    await Bookmarks.destroy({
      where: { postid: postid, stdid: student.stdid },
    });

    res.status(200).json({ msg: "Bookmark Removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};
