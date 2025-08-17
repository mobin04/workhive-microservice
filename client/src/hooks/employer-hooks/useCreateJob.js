import { useMutation } from "@tanstack/react-query";
import { createJob } from "../../server/createAndEditJob";
import useTriggerPopup from "../useTriggerPopup";

const useCreateJob = (setJobDetails = null, onClose = null) => {
  const { triggerPopup } = useTriggerPopup();

  const { data, isPending, mutate } = useMutation({
    mutationFn: ({ credential }) => createJob(credential),
    onSuccess: (data) => {
      if (setJobDetails) {
        setJobDetails((prev) => [...prev, data?.data?.job]);
      }
      if (onClose) onClose();
      triggerPopup({
        message: data?.message || "Congrats! Job created successfull",
        type: "success",
      });
    },
    onError: (err) => {
      triggerPopup({
        message:
          err.response?.data?.message ||
          "Failed to create your job, Please try again after sometime",
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

export default useCreateJob;
