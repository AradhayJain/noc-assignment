import mysql from "mysql2"
// import mysql from "mysql2/promise";

export const db = mysql.createConnection({
    // host: 'database-1.crewcyuyu6kf.ap-south-1.rds.amazonaws.com', 
    // user: 'admin',
    // password: 'Aradhay1234', 
    host:"localhost",
    user:"root",
    password:"your_password",
    database: 'auth_demo' 
});
