export function streamToString(stream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
  
      // Collect data chunks from the stream
      stream.on("data", (chunk) => chunks.push(chunk));
  
      // Handle errors
      stream.on("error", reject);
  
      // When done, combine all chunks and convert to string
      stream.on("end", () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer.toString("utf-8"));
      });
    });
  }
  