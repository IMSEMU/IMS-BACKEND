import { Sequelize } from "sequelize";
import db from "../config/db.config.js";
import Students from "./student.model.js";
import Company from "./company.model.js";
import CompSup from "./compsup.model.js";
import DeptSup from "./deptsup.model.js";
import CompEval from "./compeval.model.js";

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
    iafConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    filledConForm: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    conFormConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    filledSocial: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    sifConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    logComplete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    logConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    compEvalFilled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    compEvalConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    reportComplete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    reportConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    deptEvalFilled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    intComplete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    workdesc: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    conForm: {
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

Internshipdtl.belongsTo(Students, {
  foreignKey: "stdid",
});
Internshipdtl.belongsTo(Company, {
  foreignKey: "companyid",
});
Internshipdtl.belongsTo(CompSup, {
  foreignKey: "comp_sup",
});
Internshipdtl.belongsTo(DeptSup, {
  foreignKey: "dept_sup",
});

Internshipdtl.hasOne(CompEval, {
  foreignKey: "internshipid",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export default Internshipdtl;
