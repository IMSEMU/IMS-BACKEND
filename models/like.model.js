import { Sequelize } from 'sequelize';
import db from '../config/db.config.js';
import Students from './student.model.js';
import Posts from './post.model.js';

const { DataTypes } = Sequelize;

const Likes = db.define(
  'likes',
  {
    likeid: {
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

Likes.belongsTo(Posts, {
  foreignKey: 'postid',
});
Likes.belongsTo(Students, {
    foreignKey: 'stdid',
  });

export default Likes;
