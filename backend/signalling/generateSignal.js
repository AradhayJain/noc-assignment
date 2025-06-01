import fs from 'fs';
import path from 'path';

// Generate random signal values
const generateRandomSignal = () => {
  return {
    temperature: Math.random(),
    pressure: Math.random(),
    humidity: Math.random(),
  };
};

// Generate 10 signals with timestamps
const generateSignal = () => {
  const signals = [];
  for (let i = 0; i < 10; i++) {
    const timeStamp = new Date().toISOString();
    signals.push({ signal: generateRandomSignal(), timeStamp });
  }
  return { signal: signals };
};

// Convert signal object to JSON
const to_json = (signal) => {
  if (!signal || !signal.signal) {
    throw new Error('Invalid signal object');
  }
  return JSON.stringify({ signal: signal.signal }, null, 2);
};

// Save or append signals to JSON file
export const save_json = () => {
  const filePath = path.join(path.cwd() , 'signal.json');
  const newSignals = generateSignal();

  // Check if file exists
  if (fs.existsSync(filePath)) {
    // Read existing file
    const existingData = fs.readFileSync(filePath, 'utf-8');
    let parsed;

    try {
      parsed = JSON.parse(existingData);
    } catch (err) {
      console.error('Error parsing existing JSON file:', err);
      parsed = { signal: [] };
    }

    // Append new signals to existing ones
    parsed.signal = parsed.signal.concat(newSignals.signal);

    // Save back to file
    fs.writeFile(filePath, JSON.stringify(parsed, null, 2), (err) => {
      if (err) console.error('Error writing file:', err);
      else console.log('Signals appended to signal.json');
    });
  } else {
    // File doesn't exist — create new
    const json = to_json(newSignals);
    fs.writeFile(filePath, json, (err) => {
      if (err) console.error('Error writing file:', err);
      else console.log('Signal saved to new signal.json');
    });
  }
};
