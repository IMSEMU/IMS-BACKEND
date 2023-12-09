import { Sequelize } from "sequelize";
import db from "../config/db.config.js";
import DeptSup from "./deptsup.model.js";

const { DataTypes } = Sequelize;

const IntPositions = db.define(
  "intpositions",
  {
    posid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    compname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    desc: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    applyby: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    position: {
      type: DataTypes.STRING,
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

IntPositions.belongsTo(DeptSup, {
  foreignKey: "postedby",
});

export default IntPositions;
