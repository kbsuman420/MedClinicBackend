import { Router } from "express";
import {
  createClinic,
  getAllClinic,
  updateClinic,
  deleteClinic,
} from "./clinic.controller.js";

const clinicRouter = Router();

// Create clinic
clinicRouter.route("/create-clinic").post(createClinic);

// Get all clinics
clinicRouter.route("/all-clinic").get(getAllClinic);

// Update clinic
clinicRouter.route("/update-clinic/:id").patch(updateClinic);

// Delete clinic
clinicRouter.route("/delete-clinic/:id").delete(deleteClinic);

export default clinicRouter;