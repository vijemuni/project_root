const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'bmit0bpiau5ou7gx51fr-mysql.services.clever-cloud.com',
  user: 'uaa1hwklgilqtmzw',
  password: 'lU7UCzZBTZGGeBcdoVxe',
  database: 'bmit0bpiau5ou7gx51fr',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();