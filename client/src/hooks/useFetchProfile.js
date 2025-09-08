import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setUser } from "../store/slices/userSlice";
import { showError } from "../store/slices/errorSlice";
import { fetchProfile } from "../server/fetchProfile";
import useTriggerPopup from "./useTriggerPopup";

const useFetchProfile = () => {
  const dispatch = useDispatch();
  const { triggerPopup } = useTriggerPopup();

  const { mutate, isPending } = useMutation({
    mutationFn: fetchProfile,
    onSuccess: (data) => {
      dispatch(setUser(data.data.user));
    },
    onError: (err) => {
      if (err.code === "ERR_NETWORK") {
        triggerPopup({
          message: "Internal server error! Please try again later",
          type: "error",
        });

        dispatch(showError({ type: "500", visible: true, onGoHome: false }));
      }
    },
    retry: 2,
    retryDelay: 2000,
  });
  return {
    mutate,
    isPending,
  };
};

export default useFetchProfile;
