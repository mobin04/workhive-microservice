import React from "react";
import axios from "axios";
import { showPopup } from "../store/slices/popupSlice";
import { envVariables } from "../config";

const deleteNoficationApi = async (id, dispatch = null) => {
  try {
    const res = await axios.delete(
      `${envVariables.DELETE_NOTIFICATION_URL}/${id}`,
      { withCredentials: true }
    );
    return res?.data;
  } catch (err) {
    console.log(err);
    if (dispatch) {
      dispatch(
        showPopup({
          message:
            err.response?.data?.message || "Error occour while saving job",
          type: "error",
          visible: true,
          popupId: Date.now(),
        })
      );
    }
  }
};

export default deleteNoficationApi;
