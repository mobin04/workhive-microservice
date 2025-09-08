import { useQuery } from "@tanstack/react-query";
import { fetchData } from "../server/fetchData";

const useFetchJobByJobId = (url, isEnabled = true) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["job", url],
    queryFn: ({ queryKey }) => fetchData({}, queryKey[1]),
    enabled: isEnabled,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 2000,
  });

  return {
    data,
    isLoading,
    refetch
  };
};

export default useFetchJobByJobId;
