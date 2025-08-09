import { useQuery } from "@tanstack/react-query";
import { fetchData } from "../../server/fetchData";

const useFetchJobByEmpId = (url, isEnabled = true) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["job-employer", url],
    queryFn: ({ queryKey }) => fetchData({}, queryKey[1]),
    enabled: isEnabled,
  });

  return {
    data,
    isLoading,
    refetch,
  };
}; 

export default useFetchJobByEmpId;
