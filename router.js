import { Router } from "express";
import { generatePaste,fetchPaste,getHealthZ } from "./controller.js";

const router = Router()

router.get("/healthz",getHealthZ)
router.post("/pastes",generatePaste);
router.get("/pastes/:id",fetchPaste)

export default router;