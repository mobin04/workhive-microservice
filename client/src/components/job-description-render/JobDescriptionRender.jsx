import React, { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";

export default function JobDescriptionRender({ description }) {
  const {isDark} = useContext(ThemeContext)
  return (
    <>
      <style>{`
        .job-desc blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 12px;
          padding-bottom: 5px;
          margin: 16px 0;
          font-style: italic;
          color: ${isDark ? "#f0f9ff" : "#111"};
          background: ${isDark ? "oklch(0.373 0.034 259.733)" : "#f0f9ff"};
          border-radius: 0 4px 4px 0;
        }

        /* Unordered list (dot) */
        .job-desc ul.bullet-list {
          list-style-type: disc;
          margin: 16px 0;
          padding-left: 24px;
        }

        /* Ordered list (number) */
        .job-desc ol.ordered-list {
          list-style-type: decimal;
          margin: 16px 0;
          padding-left: 24px;
        }

        .job-desc li.list-item {
          margin: 8px 0;
        }

        .job-desc li.list-item p {
          margin: 0;
        }
      `}</style>

      <div
        className="leading-relaxed job-desc"
        style={{
          padding: "10px",
          minHeight: "100px",
        }}
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </>
  );
}
