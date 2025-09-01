import React from "react";

function ProgressBar({ percentage }) {
  return (
    <div className="w-full my-4 h-2 border border-slate-700 bg-slate-200 rounded-full relative">
      <div
        className="h-2 bg-gradient-to-r from-tec-dark to-tec-light rounded-full"
        style={{ width: `${percentage}%` }}
      />
      <span className="absolute right-0 -top-6 text-sm font-medium text-slate-700">
        {percentage}%
      </span>
    </div>
  );
}

export default ProgressBar;


