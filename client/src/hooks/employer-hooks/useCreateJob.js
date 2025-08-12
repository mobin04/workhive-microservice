import { useMutation } from "@tanstack/react-query";
import { createJob } from "../../server/createAndEditJob";
import { useDispatch } from "react-redux";
import { showPopup } from "../../store/slices/popupSlice";

const useCreateJob = (setJobDetails = null, onClose = null) => {
  const dispatch = useDispatch();
  const { data, isPending, mutate } = useMutation({
    mutationFn: ({ credential }) => createJob(credential),
    onSuccess: (data) => {
      if (setJobDetails) {
        setJobDetails((prev) => [...prev, data?.data?.job]);
      }
      if (onClose) onClose();
      dispatch(
        showPopup({
          message: data?.message || "Congrats! Job created successfull",
          type: "success",
          visible: true,
          popupId: Date.now(),
        })
      );
    },
    onError: (err) => {
      dispatch(
        showPopup({
          message:
            err.response?.data?.message ||
            "Failed to create your job, Please try again after sometime",
          type: "error",
          visible: true,
          popupId: Date.now(),
        })
      );
    },
  });

  return {
    data,
    isPending,
    mutate,
  };
};

export default useCreateJob;
