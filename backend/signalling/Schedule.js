import cron from 'node-cron';
import { save_json } from './generateSignal.js';
import { saveProcessedSignal } from './processSignal.js';

export const Schedule=()=>{
  cron.schedule('*/1 * * * *', async () => {
    console.log('⏱ Generating raw sensor data...');
    await save_json();
  
    console.log('🕑 Waiting 30 seconds before processing...');
    setTimeout(async () => {
      console.log('⚙️ Processing sensor data...');
      await saveProcessedSignal();
    }, 30 * 1000);
  });
  
  console.log("🟢 Cron is running...");
}
