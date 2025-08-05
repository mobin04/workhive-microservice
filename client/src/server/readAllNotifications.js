import React from "react";
import axios from "axios";
import { showPopup } from "../store/slices/popupSlice";
import { envVariables } from "../config";

const readAllNotification = async (dispatch = null) => {
  try {
    const res = await axios.patch(envVariables.READ_ALL_NOTIFICATION_URL, "", {
      withCredentials: true,
    });
    return res?.data;
  } catch (err) {
    console.log(err);
    if (dispatch !== null) {
      dispatch(
        showPopup({
          message: "Something went wrong! please try after some time",
          type: "error",
          visible: true,
          popupId: Date.now(),
        })
      );
    }
  }
};

export default readAllNotification;
