import { useMutation } from "@tanstack/react-query";
import updateApplication from "../../server/updateApplication";
import useTriggerPopup from "../useTriggerPopup";

const useUpdateApplication = ({ updateApp, onClose = null }) => {
  const { triggerPopup } = useTriggerPopup();
  const { data, isPending, mutate } = useMutation({
    mutationFn: ({ appId, status }) => updateApplication(appId, status),
    onSuccess: (data) => {
      if (onClose) onClose();

      if (updateApp) {
        updateApp((prev) => ({
          ...prev,
          application: prev.application.map((app) =>
            app._id === data?.data?.application?._id
              ? { ...app, status: data?.data?.application?.status }
              : app
          ),
        }));
      }

      triggerPopup({
        message: data?.message || "Operation successfull",
        type: "success",
      });
    },
    onError: (err) => {
      triggerPopup({
        message:
          err.response?.data?.message ||
          "Failed to update application, Please try again after sometime",
        type: "error",
      });
    },
  });

  return {
    data,
    isPending,
    mutate,
  };
};

export default useUpdateApplication;     