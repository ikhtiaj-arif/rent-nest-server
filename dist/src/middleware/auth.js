import config from "../config";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
export const auth = (...requiredRoles) => {
    return catchAsync(async (req, res, next) => {
        const token = req.cookies.accessToken
            ? req.cookies.accessToken
            : req.headers.authorization?.startsWith("Bearer ")
                ? req.headers.authorization?.split(" ")[1]
                : req.headers.authorization;
        if (!token) {
            throw new Error("You are not logged in! Please log in to get access.");
        }
        const verifyToken = jwtUtils.verifyToken(token, config.jwt_access_secret);
        if (!verifyToken.success) {
            throw new Error(verifyToken.error);
        }
        const { email, id, name, role, status, phone } = verifyToken.data;
        if (requiredRoles.length && !requiredRoles.includes(role)) {
            throw new Error("Forbidden. You do not have permission to access this resource");
        }
        const user = await prisma.user.findUnique({
            where: { id, email, name, role, status, phone },
        });
        if (!user) {
            throw new Error("User not found");
        }
        if (user.status === "BANNED") {
            throw new Error("Your account is blocked. Please contact support.");
        }
        req.user = { email, id, name, role, status, phone };
        next();
    });
};
//# sourceMappingURL=auth.js.map