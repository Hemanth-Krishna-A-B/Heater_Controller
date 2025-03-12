"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function Home() {
    const [status, setStatus] = useState("");
    const [temperature, setTemperature] = useState("--");
    const [humidity, setHumidity] = useState("--");
    const [brightness, setBrightness] = useState(128);

    // Function to send command and fetch data
    const sendCommand = async (command) => {
        setStatus(`Sending '${command}' command...`);
        try {
            const response = await fetch("/api/telegram", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ command }),
            });

            const data = await response.json();
            if (data.success) {
                setStatus(`Command '${command}' sent successfully!`);

                if (data.temperature && data.humidity) {
                    setTemperature(data.temperature);
                    setHumidity(data.humidity);
                }
            } else {
                setStatus(`Error: ${data.error}`);
            }
        } catch (error) {
            setStatus(`Request failed: ${error.message}`);
        }
    };

    // Function to fetch sensor data every 5 seconds
    useEffect(() => {
        const fetchData = async () => {
            await sendCommand("temp"); // Request temperature and humidity
        };

        fetchData(); // Initial fetch
        const interval = setInterval(fetchData, 8000); // Auto-refresh every 5 seconds

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, []);

    // Function to set LED brightness
    const setLedBrightness = async () => {
        await sendCommand(`brightness ${brightness}`);
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Heater Controller</h1>
            
            <div className={styles.sensorData}>
                <h2>Real-time Sensor Data</h2>
                <p><strong>Temperature:</strong> {temperature} </p>
                <p><strong>Humidity:</strong> {humidity} </p>
            </div>
            
            <div className={styles.controlButtons}>
                <button onClick={() => sendCommand("on")} className={`${styles.btn} ${styles.onBtn}`}>
                    Turn ON
                </button>
                <button onClick={() => sendCommand("off")} className={`${styles.btn} ${styles.offBtn}`}>
                    Turn OFF
                </button>
            </div>
            
            <div className={styles.brightnessControl}>
                <h2>Set Heater Temperature</h2>
                <input 
                    type="range" 
                    min="25" 
                    max="75" 
                    value={brightness} 
                    onChange={(e) => setBrightness(e.target.value)}
                    className={styles.slider}
                />
                <p>Temperature: {brightness}</p>
                <button onClick={setLedBrightness} className={`${styles.btn} ${styles.brightnessBtn}`}>
                    Set Temperature
                </button>
            </div>
    
        </div>
    );
}

