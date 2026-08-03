import { Router } from "express";

import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import { upload } from "../../middleware/upload";
import { userController } from "./users.controller";

const router = Router();

router.get(
  "/me",
  auth(Role.ADMIN, Role.LANDLORD, Role.TENANT),
  userController.getMe,
);

router.patch(
  "/me",
  auth(Role.ADMIN, Role.LANDLORD, Role.TENANT),
  userController.updateMe,
);

router.patch(
  "/change-password",
  auth(Role.ADMIN, Role.LANDLORD, Role.TENANT),
  userController.changePassword,
);
router.patch(
  "/profile-picture",
  auth(Role.ADMIN, Role.LANDLORD, Role.TENANT),
  upload.array("image", 1),
  userController.changeProfilePicture,
);

router.post(
  "/request-landlord",
  auth(Role.TENANT),
  userController.requestLandlord,
);

router.get(
  "/request-landlord",
  auth(Role.ADMIN),
  userController.getLandlordRequest,
);
router.patch(
  "/request-landlord/:id",
  auth(Role.ADMIN),
  userController.updateLandlordRequest,
);

export const userRoutes = router;
