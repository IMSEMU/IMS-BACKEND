import { Sequelize } from "sequelize";
import db from "../config/db.config.js";
import Internshipdtl from "./intdetails.model.js";
import WorkDone from "./workdone.model.js";

const { DataTypes } = Sequelize;

const IntWork = db.define(
  "intwork",
  {
    intworkid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    intdetailInternshipid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    workdoneWorkid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    other: {
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

Internshipdtl.belongsToMany(WorkDone, {
  through: IntWork,
});
WorkDone.belongsToMany(Internshipdtl, {
  through: IntWork,
});

export default IntWork;
