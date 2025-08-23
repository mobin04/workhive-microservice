import { useMutation } from "@tanstack/react-query";
import handleSuspendUser from "../../server/handleSuspendUserAdmin";
import useTriggerPopup from "../useTriggerPopup";

const useHandleSuspension = ({ setUser, onClose }) => {
  const { triggerPopup } = useTriggerPopup();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ suspensionInfo, url }) =>
      handleSuspendUser(url, suspensionInfo),
    onSuccess: (data) => {
      triggerPopup({
        message: data?.message || "Successfully suspended this user",
        type: "success",
      });

      const user = data?.data?.user;
      setUser((prev) => ({
        ...prev,
        isSuspended: user?.isSuspended,
        suspendReason: user?.suspendReason,
        suspendedUntil: user?.suspendedUntil,
        _updatedAt: Date.now(),
      }));
      onClose();
    },
    onError: (err) => {
      triggerPopup({
        message: err?.message || "Failed to suspended this user",
        type: "error",
      });
    },
  });

  return {
    mutate,
    isPending,
  };
};

export default useHandleSuspension;
