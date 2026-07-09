// Categories Service placeholder
import { Router } from "express";
import { propertiesController } from "../properties/properties.controller";
const router = Router();
router.get("/", propertiesController.getPropertyCategories);
export const categoryRoutes = router;
//# sourceMappingURL=categories.service.js.map