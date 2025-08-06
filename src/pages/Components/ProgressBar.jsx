import React from "react";

function ProgressBar(percentage) {
    return (
        <div className="w-full my-4 h-2 border border-slate-700 bg-slate-200 rounded-full">
            <div className={`w-[${percentage}%] h-2 bg-gradient-to-r from-0 from-tec-dark to-100 to-tec-light`} />
            <span>{percentage}%</span>
        </div>
    );
}

export default ProgressBar;

