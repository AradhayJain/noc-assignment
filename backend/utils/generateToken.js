import jwt from "jsonwebtoken";

export const generateToken = (id) => {
    return jwt.sign({ id },"aradhay", {
        expiresIn: "30d",
    });
}
