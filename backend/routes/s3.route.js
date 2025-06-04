import express from "express"
import { fetchAllDataFromFolder } from '../controllers/SignalController.js';


const router = express.Router();
router.get("/folder_data",fetchAllDataFromFolder);

export default router;