import React from "react";
import { FaCircleNotch } from "react-icons/fa";

// Loading component
const Loading = ({ text, useSmall }) => {
    return useSmall != null && useSmall ? (
        <p className="text-center font-semibold text-tec-darker">
            <FaCircleNotch className="w-6 h-6 mr-2 motion-safe:animate-spin inline" />
            {text != null && text != "" ? text : "Loading..."}
        </p>
    ) : (
        <div className="w-fit mx-auto text-tec-darker">
            <FaCircleNotch className="w-12 h-12 mx-auto my-4 motion-safe:animate-spin" />
            <p className="text-center font-semibold">{text != null && text != "" ? text : "Loading..."}</p>
        </div>
    )
}

export default Loading;