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
import { fetchJobs } from "../../utils/fetchJobs";

function Home() {
  const { isDark, bodyThemeClasses } = useContext(ThemeContext);
  const { user } = useSelector((state) => state.user);
  const { isLoading } = useSelector((state) => state.loading);
  const dispatch = useDispatch();
  const [filter, setFilter] = useState({
    category: "ALL",
    jobType: "ALL",
    jobLevel: "ALL",
    limit: "10",
    page: "1",
  });

  const { data, isLoading: isPending } = useQuery({
    queryKey: ["jobs", { filter, url: envVariables.GET_JOB_URL }],
    queryFn: ({ queryKey }) => {
      const { filter, url } = queryKey[1];
      return fetchJobs(filter, url);
    },
  });

  useEffect(() => {
    dispatch(setLoading(isPending));
  }, [isPending]);

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

  const posted = (timeString) => {
    const postedDateInMs = new Date(timeString).getTime();
    const timeDifferents = Date.now() - postedDateInMs;
    const msInDays = 1000 * 60 * 60 * 24;
    const daysAgo = timeDifferents / msInDays;
    return Math.round(daysAgo);
  };

  // Logged In Homepage
  const LoggedInHomepage = () => (
    <div className={`min-h-screen ${bodyThemeClasses}`}>
      <div className="max-w-7xl mx-auto px-4 pb-3 pt-3">
        {/* Filters */}
        <Filtering applyFilter={applyFilter} />

        {data?.data?.jobs && data?.totalJobs ? (
          <p
            className={`ml-1 mb-2 ${
              isDark ? "text-gray-400" : "text-gray-400"
            }`}
          >
            Total {data?.totalJobs} jobs found
          </p>
        ) : (
          <p className={`${isDark ? "text-gray-400" : "text-gray-400"}`}>
            No jobs found
          </p>
        )}
        {/* Job Listings */}
        <JobsCard jobs={data?.data?.jobs} posted={posted} />
        {/* Pagination */}
        {data?.data?.jobs.length !== 0 ? (
          <Pagination
            currentPage={data?.currentPage}
            isDark={isDark}
            totalPages={data?.totalPages}
            pageFilter={pageFilter}
          />
        ) : null}
      </div>
    </div>
  );

  if (isLoading) return <Loading />;

  return (
    <div className={`min-h-screen ${isDark ? "dark" : ""}`}>
      {user ? <LoggedInHomepage /> : <GuestHomePage />}
    </div>
  );
}

export default Home;
