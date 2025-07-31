import { useMemo } from "react";
import { useSelector } from "react-redux";

export const useMergeWithdrawnApp = () => {
  const { applications, withDrawnedApp } = useSelector(
    (state) => state.applications
  );

  const activeApplications = useMemo(() => {
    const active = applications?.filter((app) => app?.job !== false);
    const uniqueIds = new Set(active?.map((app) => app.application._id));
    const onlyWithdrawn = withDrawnedApp?.filter(
      (app) => !uniqueIds.has(app.application._id)
    );
    return [...(active || []), ...(onlyWithdrawn || [])];
  }, [applications, withDrawnedApp]);
  
  return activeApplications;
};
