import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setUser } from "../store/slices/userSlice";
import { showPopup } from "../store/slices/popupSlice";
import { showError } from "../store/slices/errorSlice";
import { fetchProfile } from "../server/fetchProfile";

const useFetchProfile = () => {
  const dispatch = useDispatch();
  const { mutate, isPending } = useMutation({
    mutationFn: fetchProfile,
    onSuccess: (data) => {
      dispatch(setUser(data.data.user));
    },
    onError: (err) => {
      if (err.code === "ERR_NETWORK") {
        dispatch(
          showPopup({
            message: "Internal server error! Please try again later",
            type: "error",
            visible: true,
          })
        );
        dispatch(showError({ type: "500", visible: true, onGoHome: false }));
      }
    },
    retry: 1,
  });
  return {
    mutate,
    isPending,
  };
};

export default useFetchProfile;
