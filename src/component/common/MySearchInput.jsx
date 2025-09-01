import React, { useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import "../../styles/MyInput.css";

const MySearchInput = ({
  placeholder = "Search...",
  value,
  onChange,
  name = "search",
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`my-input-container ${isFocused ? "focused" : ""}`}
      style={{ position: "relative" }}
    >
      {/* Search Icon */}
      <SearchOutlined
        style={{
          position: "absolute",
          left: "10px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "#aaa",
          fontSize: "16px",
        }}
      />

      {/* Input */}
      <input
        type="text"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="my-input-field"
        style={{ paddingLeft: "35px" }} // extra space for icon
      />
    </div>
  );
};

export default MySearchInput;
