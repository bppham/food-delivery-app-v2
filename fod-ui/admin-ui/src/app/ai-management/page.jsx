"use client";
import React from "react";
import JobCard from "../../components/AIManagement/JobCard";

const page = () => {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">Quản lý Model AI</h1>
      <div className="flex flex-col flex-wrap">
        <JobCard
          title="Xuất Dữ Liệu"
          type="export"
          icon="/assets/export-file.png"
        />
        <JobCard
          title="Retrain Model"
          type="train"
          icon="/assets/ai-assistant.png"
        />
      </div>
    </div>
  );
};

export default page;
