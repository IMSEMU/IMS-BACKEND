import { Sequelize } from "sequelize";
import db from "../config/db.config.js";
import Users from "./user.model.js";

const { DataTypes } = Sequelize;

const DeptSup = db.define(
  "deptsup",
  {
    supid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    department: {
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

DeptSup.belongsTo(Users, {
  foreignKey: "userid",
});

export default DeptSup;
