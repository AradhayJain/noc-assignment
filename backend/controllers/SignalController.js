import { S3Client, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import asyncHandler from "express-async-handler";

// Helper to convert stream to string
console.log("five")
const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });

console.log("six")

const s3 = new S3Client({ region: "ap-south-1"
 });

export const fetchAllDataFromFolder = asyncHandler(async (_, res) => {
  console.log("seven")
  const folderPrefix = "data/"; // default folder
  console.log("first")

  try {
    // Step 1: List all objects in the folder
    const listCommand = new ListObjectsV2Command({
      Bucket: "n0c",
      Prefix: folderPrefix,
    });

    console.log("second")

    const listedObjects = await s3.send(listCommand);

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      return res.status(404).json({ message: "No files found in the folder." });
    }

    const allData = [];

    // Step 2: Loop through each object and fetch its content
    for (const obj of listedObjects.Contents) {
      const getObjectCommand = new GetObjectCommand({
        Bucket: "n0c",
        Key: obj.Key,
      });
      console.log("three")

      const response = await s3.send(getObjectCommand);
      const fileContent = await streamToString(response.Body);
      try {
        allData.push(JSON.parse(fileContent)); 
        console.log("four")
      } catch (err) {
        allData.push({ key: obj.Key, raw: fileContent }); 
      }
    }

    res.status(200).json({ data: allData });
  } catch (err) {
    console.error("S3 Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch S3 data" });
  }
});


export const getDailyAverages = asyncHandler(async (req, res) => {
  const { date } = req.query; // format: YYYY-MM-DD
  if (!date) return res.status(400).json({ message: "Query parameter 'date' is required" });

  const prefix = "summary/";

  try {
    // Step 1: List all objects in the summary folder
    const listCommand = new ListObjectsV2Command({
      Bucket: "n0c",
      Prefix: prefix,
    });

    const listed = await s3.send(listCommand);
    const files = listed.Contents || [];

    if (files.length === 0) {
      return res.status(404).json({ message: "No files found in summary folder" });
    }

    let tempSum = 0, humSum = 0, presSum = 0, count = 0;

    // Step 2: Read each file, filter by generatedAt date, and accumulate values
    for (const file of files) {
      const getCommand = new GetObjectCommand({
        Bucket: "n0c",
        Key: file.Key,
      });

      const response = await s3.send(getCommand);
      const bodyString = await streamToString(response.Body);

      try {
        const json = JSON.parse(bodyString);

        const generatedDate = json.generatedAt?.split("T")[0];
        if (generatedDate === date) {
          tempSum += json.averageTemperature || 0;
          humSum += json.averageHumidity || 0;
          presSum += json.averagePressure || 0;
          count++;
        }
      } catch (err) {
        console.warn(`Skipping invalid JSON from ${file.Key}`);
      }
    }

    if (count === 0) {
      return res.status(404).json({ message: `No data found for date ${date}` });
    }

    const result = {
      date,
      count,
      averageTemperature: +(tempSum / count).toFixed(2),
      averageHumidity: +(humSum / count).toFixed(2),
      averagePressure: +(presSum / count).toFixed(2),
    };

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching from S3:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
