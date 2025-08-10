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
import { Search, Briefcase } from "lucide-react";
import ApplicationCard from "./ApplicationCard";
import useFetchWithdrawnApp from "../../hooks/useFetchWithdrawnApp";
import { withDrawnApplicationApi } from "../../server/applicationWithdraw";
import { useMutation } from "@tanstack/react-query";
import { updateApplicationStatus } from "../../store/slices/applicationSlice";
import { useMergeWithdrawnApp } from "../../hooks/useMergeWithdrawnApp";
import { useNavigate } from "react-router-dom";
import WarningMessage from "../warning-msg/WarningMessage";

const ViewApplications = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { isDark, applicationThemeClasses } = useContext(ThemeContext);
  const { user } = useSelector((state) => state.user);
  const { applications } = useSelector((state) => state.applications);
  const { isLoading: activeAppLoading } = useFetchApplications();
  const { isLoading: withDrawnedAppLoading } = useFetchWithdrawnApp();
  const [isWithdrawPopup, setIsWithdrawPopup] = useState(false);
  const [withDrawnId, setWithDrawnId] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user?.role !== "job_seeker") {
      navigate("/");
    }
  }, [user, navigate]);

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
        <WarningMessage
          handleCancel={handleCancel}
          handleConfirm={handleConfirmWithdraw}
          isPending={isWithdrawPending}
          message={`Are you sure you want to withdraw this application? This action
                cannot be undone and you'll need to wait 30 days after reapply
                if you change your mind.`}
          title={"Withdraw Application"}
        />
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
                  <div className="text-2xl font-bold text-lime-600">
                    {totalStatus("shortlisted")}
                  </div>
                  <div
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Shortlisted
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
