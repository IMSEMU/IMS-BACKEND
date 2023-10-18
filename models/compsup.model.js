import { Sequelize } from 'sequelize';
import db from '../config/db.config.js';
import Company from './company.model.js';

const { DataTypes } = Sequelize;

const CompSup = db.define(
  'compsup',
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

CompSup.belongsTo(Company, {
  foreignKey: 'companyid'
});


export default CompSup;
