import { Sequelize } from 'sequelize';
import db from '../config/db.config.js';

const { DataTypes } = Sequelize;

const WorkDone = db.define(
  'workdone',
  {
    workid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    work: {
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


export default WorkDone;
