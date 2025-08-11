import { useMutation } from "@tanstack/react-query";
import editJob from "../../server/editJob";
import { useDispatch } from "react-redux";
import { showPopup } from "../../store/slices/popupSlice";

const useEditJob = (setJob) => {
  const dispatch = useDispatch();
  const { data, isPending, mutate } = useMutation({
    mutationFn: ({url, credential}) => editJob(url, credential),
    onSuccess: (data) => {
      if (data?.data?.closedJob) {
        setJob(data?.data?.closedJob);
      }
      if (data?.data?.renewedJob) {
        setJob(data?.data?.renewedJob);
      }
      if(data?.data?.updatedJob){
        setJob(data?.data?.updatedJob)
      }
      dispatch(
        showPopup({
          message: data?.message || "Operation successfull",
          type: "success",
          visible: true,
          popupId: Date.now(),
        })
      );
    },
    onError: (err) => {
      dispatch(
        showPopup({
          message: err.response?.data?.message || "Failed to close job",
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

export default useEditJob;
