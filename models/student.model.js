import { Sequelize } from "sequelize";
import db from "../config/db.config.js";
import Users from "./user.model.js";

const { DataTypes } = Sequelize;

const Students = db.define(
  "students",
  {
    stdid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    address: {
      type: DataTypes.STRING,
    },
    phoneno: {
      type: DataTypes.STRING,
    },
    academicYear: {
      type: DataTypes.STRING,
    },
    dept: {
      type: DataTypes.STRING,
    },
    placeofBirth: {
      type: DataTypes.STRING,
    },
    dateofBirth: {
      type: DataTypes.DATE,
    },
    id_passno: {
      type: DataTypes.STRING,
      unique: true,
    },
    mother_name: {
      type: DataTypes.STRING,
    },
    father_name: {
      type: DataTypes.STRING,
    },
    photo: {
      type: DataTypes.STRING,
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

Students.belongsTo(Users, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

export default Students;
