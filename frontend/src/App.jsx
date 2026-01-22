import { useState } from "react";
import "./App.css";

export default function App() {
  const [name, setName] = useState("Hod Kadar");
  const [sizeMm, setSizeMm] = useState(20);
  const [thicknessMm, setThicknessMm] = useState(3);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    const base = import.meta.env.VITE_API_BASE;

    if (!base) {
      setError("חסר VITE_API_BASE (בדוק Environment Variables)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${base}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // כרגע ה-Backend שלך מצפה ל-size_mm ו-thickness_mm בלבד
        body: JSON.stringify({
          size_mm: Number(sizeMm),
          thickness_mm: Number(thicknessMm),
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${text}`);
      }

      // השרת מחזיר קובץ STL, לכן קוראים blob (לא json)
      const blob = await res.blob();

      // נסה לקחת שם קובץ מה-header אם קיים
      const contentDisposition = res.headers.get("content-disposition") || "";
      const match = contentDisposition.match(/filename="?([^"]+)"?/i);
      const filename = match?.[1] || `${name || "pendant"}.stl`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setError("שגיאה ביצירת הקובץ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#1f1f1f",
        color: "#fff",
      }}
    >
      <div style={{ width: "min(520px, 92vw)" }}>
        <h1 style={{ fontSize: 56, margin: "0 0 18px", fontWeight: 800 }}>
          מחולל תליון שם
        </h1>

        <label style={{ display: "block", marginBottom: 8, opacity: 0.9 }}>
          שם (כרגע לא משפיע על ה־STL עד שנעדכן את ה־backend)
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="לדוגמה: Hod Kadar"
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.25)",
            background: "rgba(255,255,255,0.10)",
            color: "#fff",
            fontSize: 20,
            outline: "none",
            marginBottom: 16,
          }}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, opacity: 0.9 }}>
              Size (mm)
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={sizeMm}
              onChange={(e) => setSizeMm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(255,255,255,0.10)",
                color: "#fff",
                fontSize: 18,
                outline: "none",
                marginBottom: 16,
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, opacity: 0.9 }}>
              Thickness (mm)
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={thicknessMm}
              onChange={(e) => setThicknessMm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(255,255,255,0.10)",
                color: "#fff",
                fontSize: 18,
                outline: "none",
                marginBottom: 16,
              }}
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            padding: "12px 18px",
            borderRadius: 10,
            border: "none",
            background: loading ? "rgba(255,255,255,0.15)" : "#0b0b0b",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 18,
            fontWeight: 700,
            boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
          }}
        >
          {loading ? "מייצר..." : "צור STL"}
        </button>

        {error ? (
          <div style={{ marginTop: 14, color: "#ff4d4d", fontSize: 18 }}>
            {error}
          </div>
        ) : null}

        <div style={{ marginTop: 18, opacity: 0.7, fontSize: 14, lineHeight: 1.4 }}>
          API Base: <code style={{ opacity: 0.9 }}>{import.meta.env.VITE_API_BASE || "לא מוגדר"}</code>
        </div>
      </div>
    </div>
  );
}
