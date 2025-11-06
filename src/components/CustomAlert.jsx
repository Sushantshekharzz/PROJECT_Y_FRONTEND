import React, { useEffect } from "react";

export default function CustomAlert({ statusCode, message, setAlert }) {
  useEffect(() => {
    if (setAlert) {
      const timer = setTimeout(() => setAlert(false), 1000); // auto-close after 3s
      return () => clearTimeout(timer);
    }
  }, [setAlert]);

  if (!message) return null;

  // Determine type and colors based on statusCode
  let type, bgColor, textColor, borderColor;
  if (statusCode === 200) {
    type = "success";
    bgColor = "#d1e7dd";
    textColor = "#0f5132";
    borderColor = "#0f5132";
  } else if (statusCode >= 400 && statusCode < 500) {
    type = "error";
    bgColor = "#f8d7da";
    textColor = "#842029";
    borderColor = "#842029";
  } else if (statusCode >= 500) {
    type = "error";
    bgColor = "#f8d7da";
    textColor = "#842029";
    borderColor = "#842029";
  } else {
    type = "info";
    bgColor = "#cff4fc";
    textColor = "#055160";
    borderColor = "#055160";
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        backgroundColor: bgColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
        borderRadius: "8px",
        padding: "10px 16px",
        maxWidth: "90%", // responsive width
        width: "auto",
        textAlign: "center",
        boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
        fontSize: "14px", // readable on mobile
        wordWrap: "break-word", // wrap long text
        animation: "fadein 0.3s ease, fadeout 0.3s ease 2.7s",
      }}
    >
      <strong style={{ display: "block", marginBottom: "4px", fontSize: "15px" }}>
        {type === "success"
          ? "Success!"
          : type === "error"
          ? "Error!"
          : "Info!"}
      </strong>
      <span>{message}</span>

      <style>
        {`
          @keyframes fadein {
            from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
          @keyframes fadeout {
            from { opacity: 1; transform: translateX(-50%) translateY(0); }
            to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          }
        `}
      </style>
    </div>
  );
}
