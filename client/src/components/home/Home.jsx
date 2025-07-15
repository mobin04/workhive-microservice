import React, { useContext, useEffect, useState } from "react";
import GuestHomePage from "./GuestHomePage";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { envVariables } from "../../config";
import axios from "axios";
import { useForm } from "react-hook-form";
import {
  Building2,
  Filter,
  Code,
  Palette,
  BarChart3,
  Stethoscope,
  Wrench,
} from "lucide-react";
import JobsCard from "./jobsCard/JobsCard";
import Pagination from "./pagination/Pagination";
import { setLoading } from "../../store/slices/loadingSlice";
import Loading from "../loader/Loading";

const fetchJobs = async (filter = {}) => {
  try {
    const cleanedFilter = Object.fromEntries(
      Object.entries(filter).filter(
        // eslint-disable-next-line no-unused-vars
        ([_, value]) => value?.toString().trim().toLowerCase() !== "all"
      )
    );

    const queryString = new URLSearchParams(cleanedFilter).toString();

    const res = await axios.get(`${envVariables.GET_JOB_URL}?${queryString}`, {
      withCredentials: true,
    });

    return res.data;
  } catch (err) {
    console.log(err);
  }
  return;
};

function Home() {
  const {
    isDark,
    themeClasses,
    bodyThemeClasses,
    searchBgClasses,
    dynamicFontColor,
  } = useContext(ThemeContext);
  const { user } = useSelector((state) => state.user);
  const { register, handleSubmit } = useForm();
  const { isLoading } = useSelector((state) => state.loading);
  const dispatch = useDispatch();
  const [filter, setFilter] = useState({
    category: "ALL",
    jobType: "ALL",
    jobLevel: "ALL",
    limit: "10",
    page: "1",
  });

  const staticData = {
    popularSearches: [
      "Software Engineer",
      "Data Analyst",
      "Product Manager",
      "UX Designer",
    ],
    popularCitys: [
      "Mumbai, IN",
      "Bangalore, IN",
      "Hyderabad, IN",
      "Chennai, IN",
    ],
    categories: [
      { name: "Technology", icon: Code, count: 1250 },
      { name: "Design", icon: Palette, count: 340 },
      { name: "Marketing", icon: BarChart3, count: 580 },
      { name: "Healthcare", icon: Stethoscope, count: 290 },
      { name: "Engineering", icon: Wrench, count: 720 },
      { name: "Business", icon: Building2, count: 450 },
    ],
    jobTypes: ["Full-time", "Part-time", "internship", "Remote", "contract"],
    jobLevels: [
      "Entry Level",
      "Mid Level",
      "Senior Level",
      "Director",
      "Vp or Above",
    ],
  };

  const { data, isLoading: isPending } = useQuery({
    queryKey: ["jobs", filter],
    queryFn: ({ queryKey }) => fetchJobs(queryKey[1]),
  });
  
  useEffect(() => {
    dispatch(setLoading(isPending))
  },[isPending])

  const applyFilter = (data) => {
    setFilter({
      category: data?.category,
      jobLevel: data?.joblevel.split(" ").join("_").toLowerCase(),
      jobType: data?.jobtype.split("-").join("_").toLowerCase(),
    });
  };

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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1
            className={`text-2xl md:text-3xl font-bold mb-2 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Welcome back, John! 👋
          </h1>
          <p className={`${dynamicFontColor}`}>
            Discover your next career opportunity
          </p>
        </div>

        {/* Filters */}
        <div className={`${themeClasses} p-6 rounded-xl mb-8`}>
          <form
            onSubmit={handleSubmit(applyFilter)}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <select
              {...register("category")}
              name="category"
              className={`p-3 rounded-lg border ${searchBgClasses} ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              <option value="All">All Categories</option>
              {staticData.categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              {...register("jobtype")}
              name="jobtype"
              className={`p-3 rounded-lg border ${searchBgClasses} ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              <option value="All">All Job Types</option>
              {staticData.jobTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              {...register("joblevel")}
              name="joblevel"
              className={`p-3 rounded-lg border ${searchBgClasses} ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              <option value="All">All Levels</option>
              {staticData.jobLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Apply Filters</span>
            </button>
          </form>
        </div>

        {/* Job Listings */}
        <JobsCard jobs={data?.data?.jobs} posted={posted} />

        {/* Pagination */}
        <Pagination
          currentPage={data?.currentPage}
          isDark={isDark}
          totalPages={data?.totalPages}
          pageFilter={pageFilter}
        />
      </div>
    </div>
  );
  
  if(isLoading) return <Loading />
  
  return (
    <div className={`min-h-screen ${isDark ? "dark" : ""}`}>
      {user ? <LoggedInHomepage /> : <GuestHomePage />}
    </div>
  );
}

export default Home;
