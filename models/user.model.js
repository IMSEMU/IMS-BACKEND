import { Sequelize } from 'sequelize';
import db from '../config/db.config.js';
import Roles from './role.model.js';

const { DataTypes } = Sequelize;

const Users = db.define(
  'users',
  {
    userid: {
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
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.TEXT,
    },
  },
  {
    freezeTableName: true,
  }
);

(async () => {
  await db.sync();
})();

Users.belongsTo(Roles, {
  foreignKey: 'roleId',
});


export default Users;
