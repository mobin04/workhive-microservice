import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import useTriggerPopup from "./useTriggerPopup";
import { setUser } from "../store/slices/userSlice";
import signoutApi from "../server/signOut";

const useSignOut = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { triggerPopup } = useTriggerPopup();

  const signOut = async () => {
    try {
      const res = await signoutApi();
      if (res.data.message) {
        dispatch(setUser(null));

        triggerPopup({ message: "Sign out successfully!", type: "success" });

        navigate("/");
      }
    } catch (err) {
      triggerPopup({
        message: err?.message || "Sign out successfully!",
        type: "error",
      });
    }
  };

  return signOut;
};

export default useSignOut;
