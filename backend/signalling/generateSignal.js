import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({ region: "ap-south-1"
    
 });

function generateSignalData() {
    const dataPoints = [];

    for (let i = 0; i < 10; i++) {
        const timestamp = new Date(Date.now() - i * 60000); // 1 min intervals
        dataPoints.push({
            timestamp: timestamp.toISOString(),
            temperature: +(20 + Math.random() * 10).toFixed(2), // 20°C to 30°C
            humidity: +(40 + Math.random() * 20).toFixed(2),    // 40% to 60%
            pressure: +(1000 + Math.random() * 50).toFixed(2),  // 1000 hPa to 1050 hPa
        });
    }

    return dataPoints;
}

 export async function generateDataAndUpload() {
    console.log("generating new signals")
    const signalData = {
        deviceId: uuidv4(),
        generatedAt: new Date().toISOString(),
        signals: generateSignalData(),
    };

    const key = `data/${signalData.deviceId}.json`;

    const command = new PutObjectCommand({
        Bucket: "n0c",
        Key: key,
        Body: JSON.stringify(signalData),
        ContentType: "application/json"
    });

    await s3.send(command);
    return key;
}
generateSignalData();


