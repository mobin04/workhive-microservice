import { useQuery } from "@tanstack/react-query";
import { fetchJobs } from "../server/fetchJobs";

const useFetchJobByJobId = (url, isEnabled=true) => {
  const { data, isLoading } = useQuery({
    queryKey: ["job", url],
    queryFn: ({ queryKey }) => fetchJobs({}, queryKey[1]),
    enabled: isEnabled,
    refetchOnWindowFocus: false,
  });

  return {
    data,
    isLoading,
  };
};

export default useFetchJobByJobId;