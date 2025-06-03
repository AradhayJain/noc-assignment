import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import dayjs from "dayjs";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const Dashboard = () => {
  const [allSignals, setAllSignals] = useState([]);
  const [deviceOptions, setDeviceOptions] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchSensorData = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:3000/api/s3/folder_data");
        console.log("API response:", response.data);

        const allData = response.data.data.flatMap((device) =>
          device.signals.map((signal) => ({
            ...signal,
            deviceId: device.deviceId,
          }))
        );

        allData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setAllSignals(allData);

        const deviceIds = [...new Set(response.data.data.map((d) => d.deviceId))];
        setDeviceOptions(deviceIds);
        setSelectedDevice(deviceIds[0] || "");
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSensorData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const filteredData = allSignals.filter((entry) => {
    const time = dayjs(entry.timestamp);
    const fromTime = from ? dayjs(from) : null;
    const toTime = to ? dayjs(to) : null;

    return (
      entry.deviceId === selectedDevice &&
      (!fromTime || time.isAfter(fromTime)) &&
      (!toTime || time.isBefore(toTime))
    );
  });

  const calculateAverage = (field) => {
    if (!filteredData.length) return 0;
    const sum = filteredData.reduce((acc, curr) => acc + curr[field], 0);
    return (sum / filteredData.length).toFixed(2);
  };

  const generateChartData = (field, label, borderColor) => ({
    labels: filteredData.map((data) => dayjs(data.timestamp).format("HH:mm:ss")),
    datasets: [
      {
        label,
        data: filteredData.map((data) => data[field]),
        borderColor,
        fill: false,
      },
    ],
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Sensor Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-4">
            <div>
              <label className="mr-2 font-semibold">Select Device:</label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="border px-2 py-1 rounded"
              >
                {deviceOptions.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mr-2">From:</label>
              <input
                type="datetime-local"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border px-2 py-1 rounded"
              />
            </div>

            <div>
              <label className="mr-2">To:</label>
              <input
                type="datetime-local"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border px-2 py-1 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Temperature</h2>
              <Line data={generateChartData("temperature", "Temperature (°C)", "rgba(255, 99, 132, 1)")} />
              <p className="mt-2">Average: {calculateAverage("temperature")} °C</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Humidity</h2>
              <Line data={generateChartData("humidity", "Humidity (%)", "rgba(54, 162, 235, 1)")} />
              <p className="mt-2">Average: {calculateAverage("humidity")} %</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Pressure</h2>
              <Line data={generateChartData("pressure", "Pressure (hPa)", "rgba(75, 192, 192, 1)")} />
              <p className="mt-2">Average: {calculateAverage("pressure")} hPa</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
