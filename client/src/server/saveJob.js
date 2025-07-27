import React from "react";
import axios from "axios";
import { showPopup } from "../store/slices/popupSlice";

const saveJobToSaveList = async (url, id, dispatch = null) => {
  try {
    const res = await axios.post(`${url}/${id}`, "", {withCredentials: true});
    if (res?.data?.data?.status === "success") return true;
  } catch (err) {
    console.log(err);
    if (dispatch) {
      dispatch(
        showPopup({
          message:
            err.response?.data?.message || "Error occour while saving job",
          type: "error",
          visible: true,
        })
      );
    }
  }
};

export default saveJobToSaveList;
