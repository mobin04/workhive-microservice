import { useQuery } from "@tanstack/react-query";
import { fetchData } from "../../server/fetchData";
// import { useEffect } from "react";
import { envVariables } from "../../config";
import { useDispatch } from "react-redux";
import { useEffect } from "react";

const useFetchEmpStats = (empId, setEmpStats) => {
  const dispatch = useDispatch();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["emp-stats"],
    queryFn: () =>
      fetchData(
        {},
        `${envVariables.GET_ALL_JOBS_EMPLOYER_URL}/${empId}/employer-stats`,
        dispatch
      ),
    enabled: false,
  });

  useEffect(() => {
    if (data) {
      setEmpStats(data?.data?.data);
    }
  }, [data, setEmpStats]);

  return {
    data,
    isLoading,
    refetch,
  };
};

export default useFetchEmpStats;
