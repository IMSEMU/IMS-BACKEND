import { Sequelize } from "sequelize";
import db from "../config/db.config.js";
import Students from "./student.model.js";
import Company from "./company.model.js";
import CompSup from "./compsup.model.js";

const { DataTypes } = Sequelize;

const Internshipdtl = db.define(
  "intdetails",
  {
    internshipid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    workingDays: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
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
  },
  {
    freezeTableName: true,
  }
);

(async () => {
  await db.sync();
})();

Internshipdtl.belongsTo(Students, {
  foreignKey: "stdid",
});
Internshipdtl.belongsTo(Company, {
  foreignKey: "companyid",
});
Internshipdtl.belongsTo(CompSup, {
  foreignKey: "comp_sup",
});

export default Internshipdtl;
