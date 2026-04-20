import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function App() {
  const [data, setData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message }
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/data`);
      const json = await res.json();
      setData(json);
    } catch {
      setStatus({ type: "error", message: "Failed to fetch data from server." });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const uploadFile = async (file) => {
    if (!file) return;
    if (!file.name.endsWith(".json")) {
      setStatus({ type: "error", message: "Please upload a valid .json file." });
      return;
    }

    setUploading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API}/upload`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", message: json.error || "Upload failed." });
      } else {
        setStatus({ type: "success", message: json.message });
        fetchData();
      }
    } catch {
      setStatus({ type: "error", message: "Network error — is the backend running?" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e) => {
    uploadFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    uploadFile(e.dataTransfer.files[0]);
  };

  const clearData = async () => {
    if (!window.confirm("Clear all records from the database?")) return;
    try {
      const res = await fetch(`${API}/data`, { method: "DELETE" });
      const json = await res.json();
      setStatus({ type: "success", message: json.message });
      setData([]);
    } catch {
      setStatus({ type: "error", message: "Failed to clear data." });
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <span className="logo">⚡ Smart Dashboard</span>
          <span className="record-count">{data.length} record{data.length !== 1 ? "s" : ""}</span>
        </div>
      </header>

      <main className="main">
        {/* Upload Card */}
        <section className="card upload-card">
          <h2 className="card-title">Upload JSON File</h2>
          <p className="card-subtitle">
            Upload a <code>.json</code> file containing an array of objects (or a single object) to import records.
          </p>

          <div
            className={`drop-zone${dragOver ? " drag-over" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="spinner-wrap">
                <div className="spinner" />
                <span>Uploading…</span>
              </div>
            ) : (
              <>
                <div className="drop-icon">📂</div>
                <p className="drop-text">Drag &amp; drop your JSON file here</p>
                <p className="drop-sub">or <span className="link-text">click to browse</span></p>
              </>
            )}
          </div>

          <input
            id="json-file-input"
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {status && (
            <div className={`alert alert-${status.type}`}>
              {status.type === "success" ? "✅" : "❌"} {status.message}
            </div>
          )}
        </section>

        {/* Data Table */}
        <section className="card table-card">
          <div className="table-header">
            <h2 className="card-title">Stored Records</h2>
            {data.length > 0 && (
              <button className="btn btn-danger" onClick={clearData}>
                🗑 Clear All
              </button>
            )}
          </div>

          {data.length === 0 ? (
            <div className="empty-state">
              <p>No records yet. Upload a JSON file to get started.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    {Object.keys(data[0]).filter(k => k !== "__v").map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i}>
                      {Object.keys(data[0]).filter(k => k !== "__v").map((key) => (
                        <td key={key}>{String(row[key] ?? "—")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
