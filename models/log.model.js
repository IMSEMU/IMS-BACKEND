import { Sequelize } from 'sequelize';
import db from '../config/db.config.js';
import Users from './user.model.js';

const { DataTypes } = Sequelize;

const Log = db.define(
  'log',
  {
    logid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    day: {
        type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
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

Log.belongsTo(Users, {
  foreignKey: 'userid',
});


export default Log;
