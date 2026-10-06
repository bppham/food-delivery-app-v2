"use client";

import { useEffect, useState, useRef } from "react";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const logEndRef = useRef(null);

  useEffect(() => {
    const evtSource = new EventSource(
      `${process.env.NEXT_PUBLIC_LOG_URI}/logs/stream`
    );

    evtSource.onmessage = (event) => {
      setLogs((prev) => [...prev, event.data]);
    };

    evtSource.onerror = (err) => {
      console.error("❌ SSE error:", err);
      evtSource.close();
    };

    return () => evtSource.close();
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const getColor = (status) => {
    if (status >= 200 && status < 300) return "text-lime-400";
    if (status >= 400 && status < 500) return "text-orange-400";
    if (status >= 500) return "text-red-400";
    return "text-white";
  };

  return (
    <div className="p-5">
      <h1 className="text-lg font-semibold">Realtime Server Logs</h1>

      <div
        className="
          h-[75vh] overflow-y-auto bg-[#1e1e1e] 
          text-white p-4 rounded-lg 
          font-mono text-sm mt-5
        "
      >
        {logs.map((log, i) => {
          const parts = log.split(" ");
          const status = Number(parts[parts.length - 2]);

          return (
            <div key={i} className={getColor(status)}>
              {log}
            </div>
          );
        })}

        <div ref={logEndRef}></div>
      </div>
    </div>
  );
}
