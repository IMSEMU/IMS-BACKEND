import { Sequelize } from 'sequelize';
import db from '../config/db.config.js';
import Students from './student.model.js';
import Posts from './post.model.js';

const { DataTypes } = Sequelize;

const Bookmarks = db.define(
  'bookmarks',
  {
    bkmarkid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    },
  {
    freezeTableName: true,
  }
);

(async () => {
  await db.sync();
})();

Bookmarks.belongsTo(Posts, {
  foreignKey: 'postid',
});
Bookmarks.belongsTo(Students, {
    foreignKey: 'stdid',
  });

export default Bookmarks;
