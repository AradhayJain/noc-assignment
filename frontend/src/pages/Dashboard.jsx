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
  const [loading, setLoading] = useState(true);

  // New state for selected date and averages for that date
  const [selectedDate, setSelectedDate] = useState("");
  const [averagesForDate, setAveragesForDate] = useState(null);

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
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSensorData();
  }, []);

  // Filtered data for charts without device filtering
  const filteredData = allSignals; // showing all signals

  // Fetch averages when selectedDate changes (without deviceId)
  useEffect(() => {
    const fetchAverages = async () => {
      if (!selectedDate) {
        setAveragesForDate(null);
        return;
      }

      try {
        const res = await axios.get(`/api/s3/data?date=${selectedDate}`);
        if (res.data && res.data.avg) {
          setAveragesForDate(res.data.avg);
        } else {
          setAveragesForDate(null);
        }
      } catch (err) {
        console.error("Failed to fetch averages:", err);
        setAveragesForDate(null);
      }
    };

    fetchAverages();
  }, [selectedDate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

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
            {/* Only date input */}
            <div>
              <label className="mr-2 font-semibold">Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border px-2 py-1 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Temperature</h2>
              <Line
                data={generateChartData(
                  "temperature",
                  "Temperature (°C)",
                  "rgba(255, 99, 132, 1)"
                )}
              />
              <p className="mt-2">Average: {calculateAverage("temperature")} °C</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Humidity</h2>
              <Line
                data={generateChartData("humidity", "Humidity (%)", "rgba(54, 162, 235, 1)")}
              />
              <p className="mt-2">Average: {calculateAverage("humidity")} %</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Pressure</h2>
              <Line
                data={generateChartData(
                  "pressure",
                  "Pressure (hPa)",
                  "rgba(75, 192, 192, 1)"
                )}
              />
              <p className="mt-2">Average: {calculateAverage("pressure")} hPa</p>
            </div>
          </div>

          {/* Show averages fetched for selectedDate */}
          {selectedDate && (
            <div className="mt-10">
              <h2 className="text-xl font-bold mb-4">Averages for {selectedDate}</h2>
              {averagesForDate ? (
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-4 py-2">Temperature (°C)</th>
                      <th className="border px-4 py-2">Humidity (%)</th>
                      <th className="border px-4 py-2">Pressure (hPa)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-4 py-2">{averagesForDate.temperature?.toFixed(2) || "-"}</td>
                      <td className="border px-4 py-2">{averagesForDate.humidity?.toFixed(2) || "-"}</td>
                      <td className="border px-4 py-2">{averagesForDate.pressure?.toFixed(2) || "-"}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p>No data available for this date.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
