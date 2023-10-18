import { Sequelize } from 'sequelize';

 const db = new Sequelize('IMS', 'admin', 'IMSProject1', {
   host: 'localhost',
   dialect: 'mysql',
 })

 export default db;
