import { Sequelize } from "sequelize";
import db from "../config/db.config.js";
import Students from "./student.model.js";
import Posts from "./post.model.js";

const { DataTypes } = Sequelize;

const Comments = db.define(
  "comments",
  {
    commentid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    media: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
  }
);

(async () => {
  await db.sync();
})();

Comments.belongsTo(Posts, {
  foreignKey: "postid",
});
Comments.belongsTo(Students, {
  foreignKey: "stdid",
});

export default Comments;
