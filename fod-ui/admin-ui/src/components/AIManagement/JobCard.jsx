"use client";
import React, { useState } from "react";
import { exportData, retrainModel, checkStatus } from "../../api/aiManagement";
import Image from "next/image";

const JobCard = ({ title, icon, type }) => {
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const startJob = async () => {
    setLoading(true);
    setStatus("");
    setMessage("");

    try {
      let res;
      if (type === "export") {
        res = await exportData();
      } else if (type === "train") {
        res = await retrainModel();
      }

      const id = res.data.job_id;
      setJobId(id);
      pollStatus(id);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const pollStatus = (id) => {
    const interval = setInterval(async () => {
      try {
        const res = await checkStatus(id);
        const data = res.data;
        setStatus(data.status);
        setMessage(data.message);

        if (data.status === "COMPLETED" || data.status === "FAILED") {
          clearInterval(interval);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        clearInterval(interval);
        setLoading(false);
      }
    }, 2000);
  };

  const getStatusColor = () => {
    if (status === "COMPLETED") return "text-green-600";
    if (status === "FAILED") return "text-red-600";
    if (status === "RUNNING") return "text-blue-600";
    return "text-gray-500";
  };

  return (
    <div className="border border-solid border-gray-200 rounded-xl shadow-md p-4 m-3 flex flex-col md:flex-row gap-4 hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col items-center md:items-start flex-1 gap-3">
        <div className="flex gap-2 items-center">
          <Image
            src={icon}
            alt={title}
            width={30}
            height={30}
            className="mb-2"
          />
          <h2 className="text-lg font-bold">{title}</h2>
        </div>

        <button
          onClick={startJob}
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition"
        >
          {loading ? "Đang thực hiện..." : `Bắt đầu`}
        </button>
      </div>

      <div className="flex-1 rounded-lg p-4 bg-gray-50 text-sm">
        {jobId ? (
          <div className="space-y-2 text-left">
            <p>
              <span className="font-semibold">Job ID:</span> {jobId}
            </p>
            <p className={getStatusColor()}>
              <span className="font-semibold">Status:</span>{" "}
              {status || "Pending..."}
            </p>
            <p>
              <span className="font-semibold">Message:</span> {message || "-"}
            </p>
          </div>
        ) : (
          <p className="text-gray-400 text-center">
            Chưa có tiến trình nào được chạy.
          </p>
        )}
      </div>
    </div>
  );
};

export default JobCard;
