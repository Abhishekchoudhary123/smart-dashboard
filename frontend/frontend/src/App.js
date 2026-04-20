import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import axios from "axios";

// Use environment variable in production, fallback to localhost for development
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function App() {
  const [data, setData] = useState([]);

  // ✅ Function for colored markers
  const getIcon = (growth) => {
    return new L.Icon({
      iconUrl:
        growth >= 80
          ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
          : growth >= 50
          ? "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
          : "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
      iconSize: [25, 41],
    });
  };

  // Fetch data from backend
  useEffect(() => {
    axios.get(`${API_URL}/data`)
      .then(res => setData(res.data))
      .catch(err => console.log(err));
  }, []);

  // Handle file upload
  const handleFileUpload = async (e) => {
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      await axios.post(`${API_URL}/upload`, formData);
      alert("File uploaded");

      // Refresh data after upload
      const res = await axios.get(`${API_URL}/data`);
      setData(res.data);

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      {/* Upload Button */}
      <input type="file" onChange={handleFileUpload} />

      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: "90vh", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Dynamic markers */}
        {data.map((item, index) => (
          <Marker
            key={index}
            position={[item.lat, item.lng]}
            icon={getIcon(item.growth || 0)}
          >
            <Popup>
              <strong>{item.title}</strong> <br />
              Type: {item.type} <br />
              Growth: {item.growth || "N/A"} <br />

              {/* Image if available */}
              {item.image && (
                <img
                  src={item.image}
                  alt="info"
                  width="150"
                  style={{ marginTop: "5px" }}
                />
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
}

export default App;