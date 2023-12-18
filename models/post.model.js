import { Sequelize } from "sequelize";
import db from "../config/db.config.js";
import Students from "./student.model.js";

const { DataTypes } = Sequelize;

const Posts = db.define(
  "posts",
  {
    postid: {
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
    commentsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    likesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
  }
);

(async () => {
  await db.sync();
})();

Posts.belongsTo(Students, {
  foreignKey: "stdid",
});

export default Posts;
