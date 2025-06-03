import {
    S3Client,
    ListObjectsV2Command,
    GetObjectCommand,
    PutObjectCommand
  } from "@aws-sdk/client-s3";
  import { streamToString } from '../utils/streamToString.js'; // stream reader
  import path from 'path';
  
  const s3 = new S3Client({ region: "ap-south-1"
    
 });
  const BUCKET = "n0c";
  
  export async function processSignals() {
    console.log("🔄 Starting signal processing...");
  
    try {
      const listCmd = new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: "data/"
      });
  
      const listed = await s3.send(listCmd);
  
      if (!listed.Contents || listed.Contents.length === 0) {
        console.log("❌ No data files found.");
        return;
      }
  
      for (const obj of listed.Contents) {
        const key = obj.Key;
  
        if (key.endsWith("/")) continue; // skip folders
  
        const getCmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
        const response = await s3.send(getCmd);
        const body = await streamToString(response.Body);
        const json = JSON.parse(body);
  
        const signals = json.signals;
        const summary = {
          deviceId: json.deviceId,
          generatedAt: json.generatedAt,
          processedAt: new Date().toISOString(),
          averageTemperature: average(signals.map(s => s.temperature)),
          averageHumidity: average(signals.map(s => s.humidity)),
          averagePressure: average(signals.map(s => s.pressure))
        };
  
        const summaryKey = `summary/summary-${path.basename(key)}`;
        const putCmd = new PutObjectCommand({
          Bucket: BUCKET,
          Key: summaryKey,
          Body: JSON.stringify(summary),
          ContentType: "application/json"
        });
  
        await s3.send(putCmd);
        console.log(`✅ Summary saved: ${summaryKey}`);
      }
    } catch (err) {
      console.error("❌ Error in processing:", err);
    }
  }
  
  function average(arr) {
    if (!arr.length) return 0;
    return +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);
  }
  
 
  