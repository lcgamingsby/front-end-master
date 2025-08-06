import React from "react";

const GrammarUnderline = ({ text, contentLetter }) => {
    console.log(text, contentLetter);

    if (!text || !contentLetter) {
        return null;
    }

    if (contentLetter.length > 1) {
        console.warn("contentLetter should be a single character, got:", contentLetter);
        return null;
    }

    return (
        <span className="relative">
            <u>{text}</u>
            <span className="absolute left-1/2 -translate-x-1/2 top-4.5 text-xs select-none">{contentLetter}</span>
        </span>
    );
}

export default GrammarUnderline;