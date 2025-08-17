import { useMutation } from "@tanstack/react-query";
import { editJob } from "../../server/createAndEditJob";
import useTriggerPopup from "../useTriggerPopup";

const useEditJob = (setJob = null, onClose = null) => {
  const { triggerPopup } = useTriggerPopup();

  const { data, isPending, mutate } = useMutation({
    mutationFn: ({ url, credential }) => editJob(url, credential),
    onSuccess: (data) => {
      if (setJob) {
        if (data?.data?.closedJob) {
          setJob(data?.data?.closedJob);
        }
        if (data?.data?.renewedJob) {
          setJob(data?.data?.renewedJob);
        }
        if (data?.data?.updatedJob) {
          setJob(data?.data?.updatedJob);
        }
      }
      if (onClose) onClose();

      triggerPopup({
        message: data?.message || "Operation successfull",
        type: "success",
      });
    },
    onError: (err) => {
      triggerPopup({
        message:
          err.response?.data?.message ||
          "Operation Failed! Please try again later",
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

export default useEditJob;
