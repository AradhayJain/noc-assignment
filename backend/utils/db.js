import mysql from "mysql2"
// import mysql from "mysql2/promise";

export const db = mysql.createConnection({
    host: 'process.env.HOST', 
    user: 'admin',
    password: 'Aradhay1234', 
    database: 'auth_demo' 
});
