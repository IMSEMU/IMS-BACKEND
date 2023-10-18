import { Sequelize } from 'sequelize';
import db from '../config/db.config.js';
import Students from './student.model.js';
import Company from './company.model.js';

const { DataTypes } = Sequelize;

const Internshipdtl = db.define(
  'intdetails',
  {
    internshipid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    workingDays: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
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

Internshipdtl.belongsTo(Students, {
  foreignKey: 'stdid',
});
Internshipdtl.belongsTo(Company, {
    foreignKey: 'companyid',
  });


export default Internshipdtl;
