import { useQuery } from "@tanstack/react-query";
import { fetchData } from "../../server/fetchData";
import { envVariables } from "../../config";
import { useDispatch } from "react-redux";
import { useEffect } from "react";

const useFetchAppsByJobId = (jobId, setEmpStats) => {
  const dispatch = useDispatch();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["emp-stats"],
    queryFn: () =>
      fetchData(
        {},
        `${envVariables.GET_APPLICATIONS_BY_JOBID_URL}/${jobId}/job`,
        dispatch
      ),
    enabled: false,
  });

  useEffect(() => {
    if (data) {
      setEmpStats(data?.data?.job);
    }
  }, [data, setEmpStats]);

  return {
    data,
    isLoading,
    refetch,
  };
};

export default useFetchAppsByJobId;