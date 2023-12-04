import { Sequelize } from "sequelize";
import db from "../config/db.config.js";
import DeptSup from "./deptsup.model.js";

const { DataTypes } = Sequelize;

const Announcements = db.define(
  "announcements",
  {
    announcementid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

(async () => {
  await db.sync();
})();

Announcements.belongsTo(DeptSup, {
  foreignKey: "supid",
});

export default Announcements;
