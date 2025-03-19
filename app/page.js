"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function Home() {
    const [status, setStatus] = useState("");
    const [temperature, setTemperature] = useState("--");
    const [humidity, setHumidity] = useState("--");
    const [brightness, setBrightness] = useState(50);
    const [activeButton, setActiveButton] = useState(""); // Track active button

    const sendCommand = async (command) => {
        setActiveButton(command); // Set active button dynamically
        await sendCmd(command);
        await sendCmd("temp");
    };

    // Function to send commands (ON, OFF, Brightness)
    const sendCmd = async (command) => {
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
            } else {
                setStatus(`Error: ${data.error}`);
            }
        } catch (error) {
            setStatus(`Request failed: ${error.message}`);
        }
    };

    // Function to set heater brightness/temperature
    const setHeaterTemperature = async () => {
        // If the heater is OFF, turn it ON first
        if (activeButton === "off") {
            setActiveButton("on"); // Activate ON button
        }
        
        await sendCmd(`brightness ${brightness}`);
        await sendCmd("temp");
    };

    // Send "temp" command to bot on page load
    useEffect(() => {
        const fetchInitialSensorData = async () => {
            try {
                await sendCmd("temp"); // Send "temp" command once
            } catch (error) {
                console.error("Failed to send initial temp command:", error);
            }
        };

        fetchInitialSensorData();
    }, []);

    // Update sensor data every 3 seconds
    useEffect(() => {
        const fetchSensorData = async () => {
            try {
                const response = await fetch("/api/telegram");
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                if (data.success) {
                    setTemperature(data.temperature);
                    setHumidity(data.humidity);
                } else {
                    console.error("API Error:", data.error);
                }
            } catch (error) {
                console.error("Failed to fetch sensor data:", error);
                setTemperature("--");
                setHumidity("--");
            }
        };

        const interval = setInterval(fetchSensorData, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Heater Controller</h1>

            <div className={styles.sensorData}>
                <h2>Real-time Sensor Data</h2>
                <p><strong>Temperature:</strong> {temperature}</p>
                <p><strong>Humidity:</strong> {humidity}</p>
            </div>

            <div className={styles.controlButtons}>
                <button 
                    onClick={() => sendCommand("on")} 
                    className={`${styles.btn} ${styles.onBtn} ${activeButton === "on" ? styles.active : ""}`}
                >
                    Turn ON
                </button>
                <button 
                    onClick={() => sendCommand("off")} 
                    className={`${styles.btn} ${styles.offBtn} ${activeButton === "off" ? styles.active : ""}`}
                >
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
                <p>Temperature: {brightness}°C</p>
                <button 
                    onClick={setHeaterTemperature} 
                    className={`${styles.btn} ${styles.brightnessBtn} ${activeButton === "brightness" ? styles.active : ""}`}
                >
                    Set Temperature
                </button>
            </div>
        </div>
    );
}
