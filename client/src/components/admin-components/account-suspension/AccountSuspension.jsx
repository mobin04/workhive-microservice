import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { X, AlertTriangle, User, Mail, Clock, FileText } from "lucide-react";
import { ThemeContext } from "../../../contexts/ThemeContext";
import useHandleSuspension from "../../../hooks/admin-hooks/useHandleSuspension";
import { envVariables } from "../../../config";

const AccountSuspention = ({ user, isOpen, onClose, setUser }) => {
  const { isDark, suspendThemeClass } = useContext(ThemeContext);
  const {
    mutate,
    isPending,
  } = useHandleSuspension({ setUser, onClose });


  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      suspensionDays: "",
      suspensionReason: "",
      customReason: "",
    },
  });

  const predefinedReasons = [
    "Violation of community guidelines",
    "Inappropriate content posting",
    "Spam or promotional activities",
    "Harassment or abusive behavior",
    "Multiple policy violations",
    "Suspicious account activity",
    "Copyright infringement",
    "Fake profile information",
  ];

  const currentTheme = isDark
    ? suspendThemeClass.dark
    : suspendThemeClass.light;

  const watchedReason = watch("suspensionReason");

  const onSuspend = (data) => {
    const finalReason =
      data.suspensionReason === "custom"
        ? data.customReason
        : data.suspensionReason;

    mutate({
      suspensionInfo: {
        days: parseInt(data.suspensionDays),
        reason: finalReason,
      },
      url: `${envVariables.SUSPEND_USER_URL}/${user?._id}`,
    });
  };

  const onUnsuspend = () => {
    mutate({
      suspensionInfo: {},
      url: `${envVariables.UNSUSPEND_USER_URL}/${user?._id}`,
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div
      className={`fixed backdrop-blur-lg inset-0 z-50 flex items-center justify-center p-4 ${currentTheme.overlay}`}
    >
      <div
        className={`relative w-full max-w-md rounded-xl shadow-2xl ${currentTheme.popup} transform transition-all duration-200 scale-100`}
      >
        {/* Header */}
        <div
          className={`flex items-center gap-3 px-6 py-4 rounded-t-xl border-b ${
            user?.isSuspended
              ? currentTheme.headerUnsuspend
              : currentTheme.header
          }`}
        >
          <AlertTriangle
            className={`w-5 h-5 ${
              user?.isSuspended
                ? currentTheme.headerIconUnsuspend
                : currentTheme.headerIcon
            }`}
          />
          <h2
            className={`text-lg font-semibold ${
              user?.isSuspended
                ? currentTheme.headerTextUnsuspend
                : currentTheme.headerText
            }`}
          >
            {user?.isSuspended ? "Remove Suspension" : "Suspend User Account"}
          </h2>
          <button
            onClick={handleClose}
            className={`ml-auto p-1 rounded-lg ${
              isDark ? "hover:bg-red-400/20" : "hover:bg-red-200 "
            } transition-colors ${currentTheme.headerIcon} cursor-pointer`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className={`mx-6 mt-4 p-4 rounded-lg ${currentTheme.userInfo}`}>
          <div className="flex items-center gap-3">
            <img
              src={user?.coverImage}
              alt={user?.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 opacity-60" />
                <span className="font-medium truncate">{user?.name}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4 opacity-60" />
                <span className="text-sm opacity-80 truncate">
                  {user?.email}
                </span>
              </div>
              <div className="mt-1">
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full ${
                    user?.role === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : user.role === "employer"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user?.role?.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSuspend)} className="p-6 space-y-4">
          {user?.isSuspended ? (
            <div
              className={`p-4 rounded-xl border shadow-sm ${
                currentTheme.userInfo || "bg-gray-50"
              }`}
            >
              <p className="text-sm leading-relaxed">
                ⚠️ Unsuspending this user will restore their full account
                access. Make sure the suspension reason has been resolved before
                proceeding.
              </p>
            </div>
          ) : (
            <>
              {/* Suspension Days */}
              <div>
                <label
                  className={`flex items-center gap-2 text-sm font-medium mb-2 ${currentTheme.label}`}
                >
                  <Clock className="w-4 h-4" />
                  Suspension Duration (Days)
                </label>
                <input
                  type="number"
                  {...register("suspensionDays", {
                    required: "Suspension duration is required",
                    min: { value: 1, message: "Minimum duration is 1 day" },
                    max: {
                      value: 3650,
                      message: "Maximum duration is 3650 days",
                    },
                    valueAsNumber: true,
                  })}
                  placeholder="Enter number of days"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none transition-colors ${
                    errors.suspensionDays ? "border-red-500" : ""
                  } ${currentTheme.input}`}
                />
                {errors.suspensionDays && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.suspensionDays.message}
                  </p>
                )}
                <p className="text-xs opacity-60 mt-1">
                  Maximum: 3650 days (10 years)
                </p>
              </div>

              {/* Suspension Reason */}
              <div>
                <label
                  className={`flex items-center gap-2 text-sm font-medium mb-2 ${currentTheme.label}`}
                >
                  <FileText className="w-4 h-4" />
                  Suspension Reason
                </label>
                <select
                  {...register("suspensionReason", {
                    required: "Please select a suspension reason",
                  })}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none transition-colors ${
                    errors.suspensionReason ? "border-red-500" : ""
                  } ${currentTheme.select}`}
                >
                  <option value="">Select a reason</option>
                  {predefinedReasons.map((reason, index) => (
                    <option key={index} value={reason}>
                      {reason}
                    </option>
                  ))}
                  <option value="custom">Custom reason...</option>
                </select>
                {errors.suspensionReason && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.suspensionReason.message}
                  </p>
                )}
              </div>

              {watchedReason === "custom" && (
                <div>
                  <label
                    className={`text-sm font-medium mb-2 block ${currentTheme.label}`}
                  >
                    Custom Reason
                  </label>
                  <textarea
                    {...register("customReason", {
                      required:
                        watchedReason === "custom"
                          ? "Custom reason is required"
                          : false,
                      minLength: {
                        value: 10,
                        message: "Custom reason must be at least 10 characters",
                      },
                      maxLength: {
                        value: 500,
                        message: "Custom reason cannot exceed 500 characters",
                      },
                    })}
                    placeholder="Enter custom suspension reason..."
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none transition-colors resize-none ${
                      errors.customReason ? "border-red-500" : ""
                    } ${currentTheme.input}`}
                    rows="3"
                  />
                  {errors.customReason && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.customReason.message}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${currentTheme.button.secondary}`}
              disabled={isPending}
            >
              Cancel
            </button>
            {user?.isSuspended ? (
              <button
                type="button"
                onClick={onUnsuspend}
                disabled={isPending || !isValid}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${currentTheme.button.saveGreen}`}
              >
                {isPending ? (
                  <div className="flex justify-center items-center gap-2">
                    <div className="animate-spin w-3 h-3 border-2 border-b-transparent rounded-full"></div>
                    <span>Unsuspending...</span>
                  </div>
                ) : (
                  <span>Unsuspend</span>
                )}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isPending || !isValid}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${currentTheme.button.primary}`}
              >
                {isPending ? (
                  <div className="flex justify-center items-center gap-2">
                    <div className="animate-spin w-3 h-3 border-2 border-b-transparent rounded-full"></div>
                    <span>Suspending...</span>
                  </div>
                ) : (
                  <span>Suspend User</span>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountSuspention;
