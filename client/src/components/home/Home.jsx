import React, { useCallback, useContext, useEffect, useState } from "react";
import GuestHomePage from "./GuestHomePage";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { envVariables } from "../../config";
import Filtering from "./filter/Filter";
import JobsCard from "./jobsCard/JobsCard";
import Pagination from "./pagination/Pagination";
import { setLoading } from "../../store/slices/loadingSlice";
import Loading from "../loader/Loading";
import { fetchJobs } from "../../server/fetchJobs";
import { setJobs } from "../../store/slices/jobSlice";

function Home() {
  const { isDark, bodyThemeClasses } = useContext(ThemeContext);
  const { user } = useSelector((state) => state.user);
  const { jobs } = useSelector((state) => state.jobs);
  const { isLoading } = useSelector((state) => state.loading);
  const dispatch = useDispatch();
  const [filter, setFilter] = useState({
    category: "ALL",
    jobType: "ALL",
    jobLevel: "ALL",
    limit: "10",
    page: "1",
  });

  const {
    data,
    isLoading: isPending,
    error,
    isError,
  } = useQuery({
    queryKey: ["jobs", { filter, url: envVariables.GET_JOB_URL }],
    queryFn: ({ queryKey }) => {
      const { filter, url } = queryKey[1];
      return fetchJobs(filter, url, dispatch);
    },
    enabled: user ? true : false,
  });

  if (isError) {
    console.log("error happended" + error.message);
  }

  useEffect(() => {
    if (!data) return;
    dispatch(setJobs(data));
  }, [data, dispatch]);

  useEffect(() => {
    dispatch(setLoading(isPending));
  }, [isPending, dispatch]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const applyFilter = useCallback((data) => {
    setFilter({
      category: data?.category,
      jobLevel: data?.joblevel.split(" ").join("_").toLowerCase(),
      jobType: data?.jobtype.split("-").join("_").toLowerCase(),
      salaryMinPerMonth: data?.minSalary,
      salaryMaxPerMonth: data?.maxSalary,
    });
  }, []);

  const pageFilter = (data) => {
    setFilter((prev) => ({
      ...prev,
      page: data.toString(),
    }));
  };
  
  

  // Logged In Homepage
  const LoggedInHomepage = () => (
    <div className={`${bodyThemeClasses}`}>
      <div className="max-w-7xl mx-auto px-4 pb-3 pt-3">
        {/* Filters */}
        <Filtering applyFilter={applyFilter} />

        {jobs && jobs.totalJobs ? (
          <p
            className={`ml-1 mb-2 ${
              isDark ? "text-gray-400" : "text-gray-400"
            }`}
          >
            Total {jobs.totalJobs} jobs found
          </p>
        ) : (
          <p className={`${isDark ? "text-gray-400" : "text-gray-400"}`}>
            No jobs found
          </p>
        )}
        {/* Job Listings */}
        <JobsCard />
        {/* Pagination */}
        {jobs && jobs.totalPages > 1 ? (
          <Pagination
            currentPage={jobs?.currentPage}
            isDark={isDark}
            totalPages={jobs?.totalPages}
            pageFilter={pageFilter}
          />
        ) : null}
      </div>
    </div>
  );

  if (isLoading) return <Loading />;

  return (
    <div className={`${isDark ? "dark" : ""}`}>
      {user ? <LoggedInHomepage /> : <GuestHomePage />}
    </div>
  );
}

export default Home;
