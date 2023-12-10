import { Sequelize } from "sequelize";
import db from "../config/db.config.js";
import DeptSup from "./deptsup.model.js";

const { DataTypes } = Sequelize;

const DueDates = db.define(
  "duedates",
  {
    formid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

(async () => {
  await db.sync();
})();

DueDates.belongsTo(DeptSup, {
  foreignKey: "supid",
});

export default DueDates;
