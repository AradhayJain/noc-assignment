import { S3Client, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

// Helper to convert stream to string
const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });

const s3Client = new S3Client({ region: "ap-south-1"
    ,
    credentials: {
        accessKeyId: "AKIAS6J7P7ECERVKYDG6",
        secretAccessKey: "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"
    }
 });

export const fetchAllDataFromFolder = async (req, res) => {
  const folderPrefix = req.query.prefix || "data/"; // default folder

  try {
    // Step 1: List all objects in the folder
    const listCommand = new ListObjectsV2Command({
      Bucket: "n0c-bucket",
      Prefix: folderPrefix,
    });

    const listedObjects = await s3Client.send(listCommand);

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      return res.status(404).json({ message: "No files found in the folder." });
    }

    const allData = [];

    // Step 2: Loop through each object and fetch its content
    for (const obj of listedObjects.Contents) {
      const getObjectCommand = new GetObjectCommand({
        Bucket: "n0c-bucket",
        Key: obj.Key,
      });

      const response = await s3Client.send(getObjectCommand);
      const fileContent = await streamToString(response.Body);
      try {
        allData.push(JSON.parse(fileContent)); // If JSON file
      } catch (err) {
        allData.push({ key: obj.Key, raw: fileContent }); // If plain text
      }
    }

    res.status(200).json({ data: allData });
  } catch (err) {
    console.error("S3 Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch S3 data" });
  }
};
