/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import Header from "./components/header/Header";
import Home from "./components/home/Home";
import { Route, Routes } from "react-router-dom";
import Login from "./components/login/Login";
import Footer from "./components/footer/Footer";
import VerifyMagicLogin from "./components/login/VerifyMagicLogin";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "./store/slices/loadingSlice";
import Signup from "./components/sign-up/SignUp";
import JobViewer from "./components/job-viewer/JobViewer";
import JobApplicationForm from "./components/submit-application/JobApplicationForm";
import ErrorComponent from "./components/error-page/ErrorPage";
import Popup from "./components/info-popup/Popup";
import SavedJobs from "./components/saved-jobs/SavedJobs";
import ViewApplications from "./components/view-applications/ViewApplications";
import ViewProfile from "./components/view-profile/Profile";
import useFetchProfile from "./hooks/useFetchProfile";
import NotificationPopup from "./components/notification-popup/NotificationPopup";
import useNotificationListen from "./hooks/useNotificationListen";
import useFetchNotifications from "./hooks/useFetchNotifications";
import EmployerStatistics from "./components/employer-components/employer-stats/EmployerStats";
import JobApplicationsViewer from "./components/employer-components/view-applications/ViewApplications";
import ViewJobEmp from "./components/employer-components/view-job/ViewJobEmp";
import ViewUserProfile from "./components/admin-components/view-user-profile/ViewProfile";
import useSignOut from "./hooks/useSignout";
import AllUsers from "./components/admin-components/get-all-users/AllUsers";

function App() {
  const { popup } = useSelector((state) => state.popup);
  const { user } = useSelector((state) => state.user);
  const { errorShow } = useSelector((state) => state.errorShow);
  const { isVisible, notification } = useSelector(
    (state) => state.notification
  );
  const { refetch } = useFetchNotifications();
  const signOut = useSignOut();

  useNotificationListen(user?._id, refetch);

  const dispatch = useDispatch();
  const { mutate, isPending } = useFetchProfile();

  useEffect(() => {
    if (user && user?.isSuspended) {
      signOut();
    }
  }, [user]);

  useEffect(() => {
    mutate();
  }, []);

  useEffect(() => {
    dispatch(setLoading(isPending));
  }, [isPending]);

  return (
    <div>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/magic-login" element={<VerifyMagicLogin />} />
        <Route path="/job" element={<JobViewer />} />
        <Route path="/apply" element={<JobApplicationForm />} />
        <Route path="/saved-jobs" element={<SavedJobs />} />
        <Route path="/applications" element={<ViewApplications />} />
        <Route path="/profile" element={<ViewProfile />} />
        <Route path="/employer-stats" element={<EmployerStatistics />} />
        <Route path="/view-applications" element={<JobApplicationsViewer />} />
        <Route path="/view-job" element={<ViewJobEmp />} />
        <Route path="/admin/user-profile/:id" element={<ViewUserProfile />} />
        <Route path="/admin/all-users" element={<AllUsers/>} />
        <Route
          path="*"
          element={
            <ErrorComponent
              type="404"
              onGoBack={true}
              onGoHome={true}
              onRetry={false}
            />
          }
        />
      </Routes>
      <Footer />
      {errorShow?.visible ? (
        <ErrorComponent
          title={errorShow?.title}
          message={errorShow?.message}
          showGoBack={errorShow?.onGoBack}
          showGoHome={errorShow?.onGoHome}
          onRetry={errorShow?.onRetry}
          type={errorShow?.type}
        />
      ) : null}

      {popup?.visible ? (
        <Popup
          message={popup.message}
          type={popup.type}
          isVisible={popup.visible}
          popupId={popup.popupId}
        />
      ) : null}

      {isVisible && notification ? (
        <NotificationPopup isVisible={isVisible} notification={notification} />
      ) : null}
    </div>
  );
}

export default App;
