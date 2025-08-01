import { useQuery } from "@tanstack/react-query";
import { fetchData } from "../server/fetchData";

const useFetchJobByJobId = (url, isEnabled = true) => {
  const { data, isLoading } = useQuery({
    queryKey: ["job", url],
    queryFn: ({ queryKey }) => fetchData({}, queryKey[1]),
    enabled: isEnabled,
    refetchOnWindowFocus: false,
  });

  return {
    data,
    isLoading,
  };
};

export default useFetchJobByJobId;
