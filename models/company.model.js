import { Sequelize } from 'sequelize';
import db from '../config/db.config.js';
import Students from './student.model.js';

const { DataTypes } = Sequelize;

const Company = db.define(
  'company',
  {
    companyid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fields: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    fax: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phoneno: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    website: {
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


export default Company;
