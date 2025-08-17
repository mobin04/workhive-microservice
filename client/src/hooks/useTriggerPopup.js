import { useDispatch } from "react-redux";
import { showPopup } from "../store/slices/popupSlice";

const useTriggerPopup = () => {
  const dispatch = useDispatch();

  const triggerPopup = ({ message, type = "success" }) => {
    dispatch(
      showPopup({
        message: message,
        type,
        visible: true,
        popupId: Date.now(),
      })
    );
  };
  
  return {triggerPopup};
};

export default useTriggerPopup;
