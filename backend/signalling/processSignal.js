import fs from 'fs';
import path from 'path';

const getSignal= () => {
    const filePath = path.join(process.cwd(), 'signal.json');
    if (!fs.existsSync(filePath)) {
        throw new Error('Signal file does not exist');
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}
const processSignal= (signal) => {
    // process the signal
    if (!signal || !signal.signal) {
        throw new Error('Invalid signal object');
    }
    // do something with the signal
    const finalSignal=[...signal.signal];
    var temperatureSum = 0;
    var pressureSum = 0;
    var humiditySum = 0;
    finalSignal.forEach((item) => {
        temperatureSum += parseFloat(item.signal.temperature);
        pressureSum += parseFloat(item.signal.pressure);
        humiditySum += parseFloat(item.signal.humidity);
    });
    const averageSignal = {
        temperature: (temperatureSum / finalSignal.length).toFixed(2),
        pressure: (pressureSum / finalSignal.length).toFixed(2),
        humidity: (humiditySum / finalSignal.length).toFixed(2),
    };

    return {
        signal: finalSignal,
        averageSignal: averageSignal,
        timeStamp: new Date().toISOString()
    }
}

export const saveProcessedSignal = () => {
    const signal = getSignal();
    const processedSignal = processSignal(signal);
    const filePath = path.join(process.cwd(), 'processed_signal.json');
    fs.writeFileSync(filePath, JSON.stringify(processedSignal, null, 2), 'utf8');
    console.log('Processed signal saved to processed_signal.json');
}
