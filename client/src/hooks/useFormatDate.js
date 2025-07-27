import { useCallback } from "react";

function useFormatDate() {
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);
  return formatDate;
}

export default useFormatDate;