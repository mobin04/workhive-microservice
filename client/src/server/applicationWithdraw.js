import axios from "axios";
import { envVariables } from "../config";
import { showPopup } from "../store/slices/popupSlice";

export const withDrawnApplicationApi = async (id, dispatch = null) => {
  try {
    const res = await axios.patch(
      `${envVariables.WITHDRAW_APPLICATION_URL}/${id}/withdraw`,
      "",
      { withCredentials: true }
    );

    if (dispatch !== null && res?.data?.data) {
      dispatch(
        showPopup({
          message: "Your application withdrawned successfully!",
          type: "success",
          visible: true,
          popupId: Date.now(),
        })
      );
    }

    return res?.data?.data;
  } catch (err) {
    if (dispatch !== null) {
      dispatch(
        showPopup({
          message:
            err.response?.data?.message ||
            "Error occour while withdrawing application! Please try again later",
          type: "error",
          visible: true,
          popupId: Date.now(),
        })
      );
    }
  }
};
