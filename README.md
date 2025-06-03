<h1>📡 Sensor Signal Dashboard</h1>

<section>
  <h2>📋 Project Description</h2>
  <p>This project collects IoT signals (temperature, humidity, pressure) from multiple devices and:</p>
  <ul>
    <li>Uploads raw signal data to AWS S3</li>
    <li>Processes and aggregates signals on backend</li>
    <li>Displays data on a React-based dashboard with device selection</li>
    <li>Schedules data generation and processing every 20 minutes via Node-Cron</li>
  </ul>
</section>

<section>
  <h2>🔐 Register and Login Pages</h2>
  <p>The application includes user authentication using secure methods:</p>
  <ul>
    <li><strong>Register Page:</strong> Allows new users to sign up with email and password</li>
    <li><strong>Login Page:</strong> Authenticates users and issues a JWT token</li>
    <li>Passwords are hashed securely using <code>bcrypt</code></li>
    <li>Authentication is handled via <code>JWT (JSON Web Tokens)</code></li>
    <li>Protected routes restrict access based on valid tokens</li>
  </ul>
</section>

<section>
  <h2>🧰 Technologies Used</h2>
  <ul>
    <li><strong>Frontend:</strong> React.js, Chart.js</li>
    <li><strong>Backend:</strong> Node.js, Express.js</li>
    <li><strong>Authentication:</strong> bcrypt, JWT</li>
    <li><strong>Cloud Infrastructure:</strong></li>
    <ul>
      <li><strong>AWS EC2:</strong> Hosts the backend and cron scheduler</li>
      <li><strong>AWS S3:</strong> Stores raw signal JSON files</li>
      <li><strong>AWS RDS (PostgreSQL/MySQL):</strong> Stores user data and processed signal metadata</li>
    </ul>
    <li><strong>Scheduler:</strong> node-cron (runs every 20 minutes)</li>
  </ul>
</section>
