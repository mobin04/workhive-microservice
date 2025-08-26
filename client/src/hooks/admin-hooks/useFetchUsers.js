import { useMutation } from "@tanstack/react-query";
import { fetchData } from "../../server/fetchData";
import { envVariables } from "../../config";
import { useDispatch } from "react-redux";

const useFetchUsers = (setUserData) => {
  const dispatch = useDispatch();
  const { data, mutate, isPending } = useMutation({
    mutationFn: ( query={} ) =>
      fetchData(query, envVariables.FETCH_ALL_USERS_URL, dispatch),

    onSuccess: (data) => {
      setUserData(data);
    },
  });

  return { mutate, data, isPending };
};

export default useFetchUsers;
