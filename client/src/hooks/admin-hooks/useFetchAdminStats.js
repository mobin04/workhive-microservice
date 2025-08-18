import { useQuery } from "@tanstack/react-query";
import fetchAdminStats from "../../server/fetchAdminStats";
import useTriggerPopup from "../../hooks/useTriggerPopup";
import { useEffect } from "react";

const useFetchAdminStats = ({ setAdminStats }) => {
  const { triggerPopup } = useTriggerPopup();

  const { data, isError, refetch, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetchAdminStats(),
    enabled: false,
  });

  useEffect(() => {
    setAdminStats(data?.data);
  }, [data, setAdminStats]);

  useEffect(() => {
    if (!isError) return;
    triggerPopup({
      message:
        "Failed to fetch your statistics!, Please try again after sometimes",
      type: "error",
    });
  }, [isError, triggerPopup]);

  return { data, refetch, isLoading };
};

export default useFetchAdminStats;