import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { db } from "./db.js";


// Setup your MySQL connection pool once (better to keep in a separate file)


export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Decode token
      const decoded = jwt.verify(token,"aradhay");

      // Query user from MySQL by id
      const [rows] = db.query("SELECT id, username, email FROM users WHERE id = ?", [decoded.id]);

      if (rows.length === 0) {
        res.status(401);
        throw new Error("User not found");
      }

      // Attach user info to request object (excluding password)
      req.user = rows[0];

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});
