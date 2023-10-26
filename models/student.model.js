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
    filled_iaf: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    isConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    filledSocial: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    logComplete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    reportComplete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    workdesc: {
      type: DataTypes.TEXT,
      allowNull: true,
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
