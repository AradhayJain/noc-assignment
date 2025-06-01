import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
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
  const [data, setData] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const navigate=useNavigate();

  useEffect(()=>{
    if(!localStorage.getItem("token")){
      navigate("/login")
    }

  })

  useEffect(() => {
    const mockData = Array.from({ length: 20 }, (_, i) => ({
      timestamp: dayjs().subtract(i, "hour").toISOString(),
      temperature: 20 + Math.random() * 5,
      humidity: 40 + Math.random() * 10,
      pressure: 1000 + Math.random() * 20,
    })).reverse();
    setData(mockData);
  }, []);

  const filteredData = data.filter((entry) => {
    const time = dayjs(entry.timestamp);
    const fromTime = from ? dayjs(from) : null;
    const toTime = to ? dayjs(to) : null;
    return (!fromTime || time.isAfter(fromTime)) && (!toTime || time.isBefore(toTime));
  });

  const calculateAverage = (field) => {
    if (!filteredData.length) return 0;
    const sum = filteredData.reduce((acc, curr) => acc + curr[field], 0);
    return (sum / filteredData.length).toFixed(2);
  };

  const commonOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: false },
    },
  };

  const chartData = (label, field, borderColor) => ({
    labels: filteredData.map((d) => dayjs(d.timestamp).format("HH:mm")),
    datasets: [
      {
        label,
        data: filteredData.map((d) => d[field]),
        borderColor,
        fill: false,
      },
    ],

  });
  const handleLogout = ()=>{
    console.log("loggin out")
    localStorage.removeItem("token");
    navigate("/login")
  }

  
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className=" flex justify-evenly">
         <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Sensor Dashboard</h1>
         <button onClick={handleLogout} className="absolute right-15 rounded-xl border-2 border-gray-200 px-12 py-4 bg-blue-300">Logout</button>


      </div>
      
      {/* Timestamp Filter */}
      <div className="flex flex-col md:flex-row justify-center gap-4 mb-6">
        <div>
          <label className="block mb-1 font-medium">From:</label>
          <input
            type="datetime-local"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">To:</label>
          <input
            type="datetime-local"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
      </div>

      {/* Averages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <h2 className="text-xl font-semibold text-gray-700">Avg. Temperature</h2>
          <p className="text-2xl font-bold text-red-500">{calculateAverage("temperature")} °C</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <h2 className="text-xl font-semibold text-gray-700">Avg. Humidity</h2>
          <p className="text-2xl font-bold text-blue-500">{calculateAverage("humidity")} %</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <h2 className="text-xl font-semibold text-gray-700">Avg. Pressure</h2>
          <p className="text-2xl font-bold text-yellow-600">{calculateAverage("pressure")} hPa</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <Line data={chartData("Temperature (°C)", "temperature", "rgb(255, 99, 132)")} options={commonOptions} />
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <Line data={chartData("Humidity (%)", "humidity", "rgb(54, 162, 235)")} options={commonOptions} />
        </div>
        <div className="bg-white p-4 rounded-xl shadow md:col-span-2">
          <Line data={chartData("Pressure (hPa)", "pressure", "rgb(255, 206, 86)")} options={commonOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
