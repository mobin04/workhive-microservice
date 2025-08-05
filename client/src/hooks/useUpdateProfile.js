import { useMutation } from "@tanstack/react-query";
import updateProfile from "../server/updateProfile";
import useFetchProfile from "./useFetchProfile";
import { useDispatch } from "react-redux";
import { showPopup } from "../store/slices/popupSlice";

const useUpdateProfile = () => {
  const { mutate: fetchMutate, isPending: fetchProfilePending } =
    useFetchProfile();
  const dispatch = useDispatch();

  const { mutate, isPending } = useMutation({
    mutationFn: (credential) => updateProfile(credential),
    onSuccess: () => {
      fetchMutate();
      dispatch(
        showPopup({
          message: "Profile updated successfully",
          type: "success",
          visible: true,
          popupId: Date.now(),
        })
      );
    },
    onError: (err) => {
      if (err.code === "ERR_NETWORK") {
        dispatch(
          showPopup({
            message:
              err.message ||
              "Failed to update your profile! Please try again after some time",
            type: "error",
            visible: true,
            popupId: Date.now(),
          })
        );
      }
    },
  });

  return {
    isPending,
    mutate,
    fetchProfilePending,
  };
};

export default useUpdateProfile;
