import { useCallback } from "react";

function usePostedDate() {
  const posted = useCallback((timeString) => {
    const postedDateInMs = new Date(timeString).getTime();
    const timeDifferents = Date.now() - postedDateInMs;
    const msInDays = 1000 * 60 * 60 * 24;
    const daysAgo = timeDifferents / msInDays;
    if (Math.round(daysAgo) === 0) {
      return "Today";
    }
    return `${Math.round(daysAgo)} days ago`;
  }, []);
  return posted;
}

export default usePostedDate;