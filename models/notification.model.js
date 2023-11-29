import { Sequelize } from "sequelize";
import db from "../config/db.config.js";
import Users from "./user.model.js";

const { DataTypes } = Sequelize;

const Notifications = db.define(
  "notifications",
  {
    notifid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    trigger: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notifdate: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    freezeTableName: true,
  }
);

(async () => {
  await db.sync();
})();

Notifications.belongsTo(Users, {
  foreignKey: "userid",
});

export default Notifications;
