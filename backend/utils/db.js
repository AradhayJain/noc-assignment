import mysql from "mysql2"

export const db = mysql.createConnection({
    host: 'database-1.crewcyuyu6kf.ap-south-1.rds.amazonaws.com', 
    user: 'admin',
    password: 'Aradhay1234', 
    database: 'auth_demo' 
});
