import { useQuery } from "@tanstack/react-query";
import useTriggerPopup from "../../hooks/useTriggerPopup";
import { useEffect } from "react";
import { fetchData } from "../../server/fetchData";
import { envVariables } from "../../config";

const useFetchUserById = ( userId, setUser ) => {

  const { triggerPopup } = useTriggerPopup();
  const url = `${envVariables.GET_USER_BY_ID}/${userId}`;
  const { data, isError, refetch, isLoading } = useQuery({
    queryKey: ["user-by-id", url],
    queryFn: ({queryKey}) => fetchData({}, queryKey[1]),
    enabled: false,
  });

  useEffect(() => {
    setUser(data?.data?.user?.data);
  }, [data, setUser]);

  useEffect(() => {
    if (!isError) return;
    triggerPopup({
      message:
        "Failed to fetch user details!, Please try again after sometimes",
      type: "error",
    });
  }, [isError, triggerPopup]);

  return { data, refetch, isLoading };
};

export default useFetchUserById;
