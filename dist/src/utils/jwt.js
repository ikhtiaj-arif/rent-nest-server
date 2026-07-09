import jwt from "jsonwebtoken";
const createToken = (payload, secret, expiresIn) => {
    const token = jwt.sign(payload, secret, expiresIn);
    return token;
};
const verifyToken = (token, secret) => {
    try {
        const decoded = jwt.verify(token, secret);
        return { success: true, data: decoded };
    }
    catch (error) {
        return { success: false, error: error.message || "Invalid token" };
    }
};
export const jwtUtils = {
    createToken,
    verifyToken,
};
//# sourceMappingURL=jwt.js.map