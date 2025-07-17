import React from "react";
import { FaCircleNotch } from "react-icons/fa";

const Loading = ({ text, useSmall }) => {
    return useSmall != null && useSmall ? (
        <p className="text-center font-semibold">
            <FaCircleNotch className="w-6 h-6 mr-2 animate-spin motion-reduce:hidden inline" />
            {text != null && text != "" ? text : "Loading..."}
        </p>
    ) : (
        <div className="w-fit mx-auto text-tec-darker">
            <FaCircleNotch className="w-12 h-12 mx-auto my-4 animate-spin motion-reduce:hidden" />
            <p className="text-center font-semibold">{text != null && text != "" ? text : "Loading..."}</p>
        </div>
    )
}

export default Loading;