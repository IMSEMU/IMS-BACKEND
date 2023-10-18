import { Sequelize } from 'sequelize';
import db from '../config/db.config.js';

const { DataTypes } = Sequelize;

const Roles = db.define(
  'roles',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
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

export default Roles;
