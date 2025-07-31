import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../loader/Loading";
import useFetchApplications from "../../hooks/useFetchApplications";
import { Search, Briefcase, AlertTriangle, X } from "lucide-react";
import ApplicationCard from "./ApplicationCard";
import useFetchWithdrawnApp from "../../hooks/useFetchWithdrawnApp";
import { withDrawnApplicationApi } from "../../server/applicationWithdraw";
import { useMutation } from "@tanstack/react-query";
import { updateApplicationStatus } from "../../store/slices/applicationSlice";
import { useMergeWithdrawnApp } from "../../hooks/useMergeWithdrawnApp";

const ViewApplications = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { isDark, applicationThemeClasses } = useContext(ThemeContext);
  const { applications } = useSelector(
    (state) => state.applications
  );
  const { isLoading: activeAppLoading } = useFetchApplications();
  const { isLoading: withDrawnedAppLoading } = useFetchWithdrawnApp();
  const [isWithdrawPopup, setIsWithdrawPopup] = useState(false);
  const [withDrawnId, setWithDrawnId] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    if (isWithdrawPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isWithdrawPopup]);

  const activeApplications = useMergeWithdrawnApp();

  // search
  const filteredApplications = useMemo(() => {
    return activeApplications?.filter(
      (app) =>
        app?.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app?.job?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app?.job?.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app?.job?.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeApplications, searchTerm]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleCancel = () => {
    setIsWithdrawPopup(false);
  };

  const { mutate, isPending: isWithdrawPending } = useMutation({
    mutationFn: () => withDrawnApplicationApi(withDrawnId, dispatch),
    onSuccess: () => {
      dispatch(
        updateApplicationStatus({ id: withDrawnId, status: "withdrawn" })
      );
      setIsWithdrawPopup(false);
      setWithDrawnId("");
    },
  });

  const handleConfirmWithdraw = () => {
    mutate();
  };

  if (activeAppLoading || withDrawnedAppLoading) return <Loading />;

  const totalStatus = (status) => {
    return filteredApplications.filter(
      (app) => app.application.status === status
    ).length;
  };

  return (
    <>
      {isWithdrawPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleCancel}
          />

          <div
            className={`
            relative w-full max-w-md mx-auto 
            ${
              isDark
                ? "bg-gray-900 border-gray-700 text-white"
                : "bg-white border-gray-200 text-gray-900"
            } 
            border rounded-2xl shadow-2xl 
            animate-in zoom-in-95 fade-in duration-200
          `}
          >
            <button
              onClick={handleCancel}
              className={`
                absolute top-4 right-4 p-1 rounded-full transition-colors
                ${
                  isDark
                    ? "hover:bg-gray-800 text-gray-400 hover:text-gray-300"
                    : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                }
              `}
            >
              <X size={20} />
            </button>

            {/* Content */}
            <div className="p-6">
              {/* Icon */}
              <div
                className={`
                w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center
                ${isDark ? "bg-red-900/20" : "bg-red-50"}
              `}
              >
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-center mb-2">
                Withdraw Application
              </h3>

              {/* Description */}
              <p
                className={`
                text-center mb-6 text-sm leading-relaxed
                ${isDark ? "text-gray-300" : "text-gray-600"}
              `}
              >
                Are you sure you want to withdraw this application? This action
                cannot be undone and you'll need to wait 30 days after reapply if you change your
                mind.
              </p>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  disabled={isWithdrawPending}
                  className={`
                    flex-1 disabled:cursor-none cursor-pointer px-4 py-2.5 rounded-xl font-medium transition-all duration-200
                    ${
                      isDark
                        ? "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                    }
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                  `}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmWithdraw}
                  disabled={isWithdrawPending}
                  className="
                    flex-1 px-4 disabled:cursor-none cursor-pointer py-2.5 rounded-xl font-medium transition-all duration-200
                    bg-red-600 hover:bg-red-700 text-white
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                    transform hover:scale-[1.02] active:scale-[0.98]
                  "
                >
                  <div className="flex items-center justify-center gap-3">
                    {isWithdrawPending && (
                      <div className="animate-spin w-7 h-7 border-3 border-b-transparent rounded-full"></div>
                    )}
                    {isWithdrawPending ? "Withdrawing..." : "Withdraw"}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className={`min-h-screen ${applicationThemeClasses.themeClasses} ${
          isWithdrawPopup ? "pointer-events-none" : ""
        } transition-all duration-300`}
      >
        {filteredApplications && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div>
                  <h1 className="text-3xl font-bold ">My Applications</h1>
                  <p
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    } mt-1`}
                  >
                    Track and manage your job applications
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div
                  className={`${applicationThemeClasses.cardClasses} border rounded-lg p-4 transition-all duration-200`}
                >
                  <div className="text-2xl font-bold text-blue-600">
                    {applications?.length}
                  </div>
                  <div
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Total Applications
                  </div>
                </div>
                <div
                  className={`${applicationThemeClasses.cardClasses} border rounded-lg p-4 transition-all duration-200`}
                >
                  <div className="text-2xl font-bold text-yellow-600">
                    {totalStatus("pending")}
                  </div>
                  <div
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Pending
                  </div>
                </div>
                <div
                  className={`${applicationThemeClasses.cardClasses} border rounded-lg p-4 transition-all duration-200`}
                >
                  <div className="text-2xl font-bold text-red-600">
                    {totalStatus("rejected")}
                  </div>
                  <div
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Rejected
                  </div>
                </div>
                <div
                  className={`${applicationThemeClasses.cardClasses} border rounded-lg p-4 transition-all duration-200`}
                >
                  <div className="text-2xl font-bold text-green-600">
                    {totalStatus("accepted")}
                  </div>
                  <div
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Accepted
                  </div>
                </div>
                <div
                  className={`${applicationThemeClasses.cardClasses} border rounded-lg p-4 transition-all duration-200`}
                >
                  <div className="text-2xl font-bold text-red-600">
                    {totalStatus("withdrawn")}
                  </div>
                  <div
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Withdrawn
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className={`${applicationThemeClasses.inputClasses} pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200`}
                />
              </div>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
              {filteredApplications?.length === 0 ? (
                <div
                  className={`${applicationThemeClasses.cardClasses} border rounded-lg p-12 text-center`}
                >
                  <Briefcase
                    className={`h-12 w-12 mx-auto mb-4 ${
                      isDark ? "text-gray-600" : "text-gray-400"
                    }`}
                  />
                  <h3
                    className={`text-lg font-semibold mb-2 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    No applications found
                  </h3>
                  <p
                    className={`${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "Start applying to jobs to see them here"}
                  </p>
                </div>
              ) : (
                filteredApplications?.map((app) => (
                  <ApplicationCard
                    setIsWithdrawPopup={setIsWithdrawPopup}
                    setWithDrawnId={setWithDrawnId}
                    app={app}
                    key={app.application._id}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ViewApplications;
