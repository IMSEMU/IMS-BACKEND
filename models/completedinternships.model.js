import { Sequelize } from "sequelize";
import db from "../config/db.config.js";
import Company from "./company.model.js";

const { DataTypes } = Sequelize;

const CompletedInternships = db.define(
  "completedinternships",
  {
    cintid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    year: {
      type: DataTypes.DATE,
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

CompletedInternships.belongsTo(Company, {
  foreignKey: "compid",
});

export default CompletedInternships;
