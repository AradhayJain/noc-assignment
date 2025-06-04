import mysql from "mysql2"
// import mysql from "mysql2/promise";

export const db = mysql.createConnection({
    host:process.env.HOST, 
    user:process.env.ADMIN,
    password: process.env.PASSWORD, 
    database: 'auth_demo' 
});
