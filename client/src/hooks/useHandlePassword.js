import { useMutation } from "@tanstack/react-query";
import { forgotPassword, resetPassword } from "../server/handlePassword";
import useTriggerPopup from "./useTriggerPopup";

export const useForgotPassword = (setSubmit) => {
  const { triggerPopup } = useTriggerPopup();
  const { mutate, isPending } = useMutation({
    mutationFn: ({ credentials = {} }) => forgotPassword({ credentials }),
    onSuccess: (data) => {
      setSubmit(true);
      triggerPopup({
        message: data?.data?.message || "Password reset link has been send!",
        type: "success",
      });
    },
    onError: (err) => {
      triggerPopup({
        message: err.message || "Failed to send token, Please try again later",
        type: "error",
      });
    },
  });

  return { mutate, isPending };
};

export const useResetPassword = ({ setIsSuccess }) => {
  const { triggerPopup } = useTriggerPopup();
  const { mutate, isPending } = useMutation({
    mutationFn: ({ credentials = {}, token }) =>
      resetPassword({ credentials, token }),
    onSuccess: (data) => {
      setIsSuccess(true);
      triggerPopup({
        message:
          data?.data?.message ||
          "Password reset successfully, Please login to get access your account",
        type: "success",
      });
    },
    onError: (err) => {
      triggerPopup({
        message: err.message || "Failed to send token, Please try again later",
        type: "error",
      });
    },
  });

  return { mutate, isPending };
};
