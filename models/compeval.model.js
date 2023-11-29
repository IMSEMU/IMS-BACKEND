import { Sequelize } from "sequelize";
import db from "../config/db.config.js";
import Internshipdtl from "./intdetails.model.js";

const { DataTypes } = Sequelize;

const CompEval = db.define(
  "compeval",
  {
    evalid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    interest: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    attendance: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    technicalablilty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    generalbehaviour: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    overalleval: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    generalcomments: {
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

export default CompEval;
