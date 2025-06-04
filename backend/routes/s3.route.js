import express from "express"
import { fetchAllDataFromFolder,getDailyAverages } from '../controllers/SignalController.js';


const router = express.Router();
router.get("/folder_data",fetchAllDataFromFolder);
router.get("/data",getDailyAverages);
export default router;