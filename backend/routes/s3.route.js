import express from "express"
import { fetchAllDataFromFolder } from '../controllers/SignalController.js';


const router = express.Router();
router.get('/folder_data', (req, res, next) => {
    console.log("folder_data route triggered");
    next();
  }, fetchAllDataFromFolder);

export default router;