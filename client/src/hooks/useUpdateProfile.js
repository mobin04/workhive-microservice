import { useMutation } from "@tanstack/react-query";
import updateProfile from "../server/updateProfile";
import useFetchProfile from "./useFetchProfile";
import useTriggerPopup from "./useTriggerPopup";

const useUpdateProfile = () => {
  const { triggerPopup } = useTriggerPopup();

  const { mutate: fetchMutate, isPending: fetchProfilePending } =
    useFetchProfile();

  const { mutate, isPending } = useMutation({
    mutationFn: (credential) => updateProfile(credential),
    onSuccess: () => {
      fetchMutate();
      triggerPopup({
        message: "Profile updated successfully",
        type: "success",
      });
    },
    onError: (err) => {
      if (err.code === "ERR_NETWORK") {
        triggerPopup({
          message:
            err.message ||
            "Failed to update your profile! Please try again after some time",
          type: "error",
        });
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
