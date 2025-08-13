import axios from "axios";
import { showPopup } from "../store/slices/popupSlice";
import { envVariables } from "../config";

export const deleteJob = async ({
  jobId,
  setIsDeleteLoading,
  onClose,
  dispatch = null,
}) => {
  try {
    const res = await axios.delete(`${envVariables.DELETE_JOB_URL}/${jobId}`, {
      withCredentials: true,
    });

    onClose();
    return {
      message: res?.data?.message,
      jobId,
    };
  } catch (err) {
    if (dispatch) {
      setIsDeleteLoading(false);
      dispatch(
        showPopup({
          message:
            err.response?.data?.message ||
            "Failed to delete job, Please try again after sometimes",
          type: "error",
          visible: true,
          popupId: Date.now(),
        })
      );
    }
  }
};
