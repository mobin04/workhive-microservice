import React, { useCallback } from "react";

function useFormatSalary() {
  const formatSalary = useCallback((min, max) => {
    const formatNumber = (num) => {
      if (num >= 100000) {
        return `₹${(num / 100000).toFixed(1)}L`;
      } else if (num >= 1000) {
        return `₹${(num / 1000).toFixed(1)}K`;
      } else {
        return `₹${num}`;
      }
    };
    return `${formatNumber(min)} - ${formatNumber(max)}`;
  }, []);
  return formatSalary
}

export default useFormatSalary;