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
  const [dateWiseAverages, setDateWiseAverages] = useState([]);
  const [customDate, setCustomDate] = useState("");
  const [customDateResult, setCustomDateResult] = useState(null);
  const [customDateLoading, setCustomDateLoading] = useState(false);
  const [customDateError, setCustomDateError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await axios.get("/api/s3/folder_data");
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

  // Filtered data based on device and date range
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

  // Fetch date-wise averages whenever filters change
  useEffect(() => {
    const fetchDateWiseAverages = async () => {
      if (!selectedDevice) return;

      const uniqueDates = Array.from(
        new Set(
          filteredData.map((entry) => dayjs(entry.timestamp).format("YYYY-MM-DD"))
        )
      );

      const result = [];
      for (const date of uniqueDates) {
        try {
          const res = await axios.get(`/api/s3/data?date=${date}`);
          if (res.data && res.data.avg) {
            result.push({
              date,
              ...res.data.avg,
            });
          }
        } catch (err) {
          console.error(`Failed to fetch average for ${date}`, err);
        }
      }

      setDateWiseAverages(result);
    };

    fetchDateWiseAverages();
    // eslint-disable-next-line
  }, [selectedDevice, from, to, allSignals]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Calculate average for a field
  const calculateAverage = (field) => {
    if (!filteredData.length) return 0;
    const sum = filteredData.reduce((acc, curr) => acc + curr[field], 0);
    return (sum / filteredData.length).toFixed(2);
  };

  // Generate chart data for a field
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

  // Fetch data for custom date
  const handleFetchCustomDate = async () => {
    setCustomDateResult(null);
    setCustomDateError("");
    if (!customDate) return;

    setCustomDateLoading(true);
    try {
      // Optionally, add &deviceId=${selectedDevice} if your API supports device filtering
      const res = await axios.get(`/api/s3/data?date=${customDate}`);
      if (res.data && res.data.avg) {
        setCustomDateResult({ date: customDate, ...res.data.avg });
      } else {
        setCustomDateError("No data found for this date.");
      }
    } catch (err) {
      setCustomDateError("Failed to fetch data.");
      console.error(err);
    }
    setCustomDateLoading(false);
  };

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

          {/* DAILY AVERAGES TABLE from API */}
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">Daily Averages (from API)</h2>
            <table className="min-w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2">Date</th>
                  <th className="border px-4 py-2">Avg Temp (°C)</th>
                  <th className="border px-4 py-2">Avg Humidity (%)</th>
                  <th className="border px-4 py-2">Avg Pressure (hPa)</th>
                </tr>
              </thead>
              <tbody>
                {dateWiseAverages.map((entry) => (
                  <tr key={entry.date}>
                    <td className="border px-4 py-2">{entry.date}</td>
                    <td className="border px-4 py-2">{entry.temperature?.toFixed(2) || "-"}</td>
                    <td className="border px-4 py-2">{entry.humidity?.toFixed(2) || "-"}</td>
                    <td className="border px-4 py-2">{entry.pressure?.toFixed(2) || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CUSTOM DATE FETCH */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">Get Data for a Specific Date</h2>
            <div className="flex items-center gap-4 mb-4">
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="border px-2 py-1 rounded"
              />
              <button
                onClick={handleFetchCustomDate}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={customDateLoading}
              >
                {customDateLoading ? "Loading..." : "Fetch"}
              </button>
            </div>
            {customDateError && <p className="text-red-600">{customDateError}</p>}
            {customDateResult && (
              <table className="min-w-max border border-gray-300 text-sm mt-2">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-4 py-2">Date</th>
                    <th className="border px-4 py-2">Avg Temp (°C)</th>
                    <th className="border px-4 py-2">Avg Humidity (%)</th>
                    <th className="border px-4 py-2">Avg Pressure (hPa)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-2">{customDateResult.date}</td>
                    <td className="border px-4 py-2">{customDateResult.temperature?.toFixed(2) || "-"}</td>
                    <td className="border px-4 py-2">{customDateResult.humidity?.toFixed(2) || "-"}</td>
                    <td className="border px-4 py-2">{customDateResult.pressure?.toFixed(2) || "-"}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
