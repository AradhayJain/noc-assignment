import { S3Client, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

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

export const fetchAllDataFromFolder = async (req, res) => {
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
};
