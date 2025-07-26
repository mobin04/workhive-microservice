import React, { memo, useContext } from "react";
import { ThemeContext } from "../../../contexts/ThemeContext";
import { Building2, Clock, Frown, MapPin, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const JobsCard = () => {
  const navigate = useNavigate();
  const { jobs } = useSelector((state) => state.jobs);
  const posted = (timeString) => {
    const postedDateInMs = new Date(timeString).getTime();
    const timeDifferents = Date.now() - postedDateInMs;
    const msInDays = 1000 * 60 * 60 * 24;
    const daysAgo = timeDifferents / msInDays;
    if (Math.round(daysAgo) === 0) {
      return "Today";
    }
    return `${Math.round(daysAgo)} days ago`;
  };

  const { isDark, dynamicFontColor, themeClasses } = useContext(ThemeContext);
  return (
    <div>
      {jobs && jobs?.data?.jobs.length !== 0 ? (
        <div className="space-y-4 mb-8">
          {jobs &&
            jobs?.data?.jobs.map((job) => (
              <div
                key={job._id}
                className={`${themeClasses} p-6 rounded-xl hover:shadow-lg transition-all`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        src={job.companyLogo}
                        alt={`${job.company} logo`}
                        className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">
                        {job.title}
                      </h3>
                      <div
                        className={`flex flex-wrap items-center gap-4 text-sm ${dynamicFontColor} mb-2`}
                      >
                        <span className="flex items-center space-x-1">
                          <Building2 className="h-4 w-4" />
                          <span>{job.company}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{posted(job.createdAt)}</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span
                          className={`px-3 py-2 flex justify-center items-center ${
                            isDark
                              ? "text-white bg-blue-700"
                              : "text-white bg-blue-500"
                          } rounded text-sm`}
                        >
                          {job.jobType.split("_").join(" ").toUpperCase()}
                        </span>
                        <span
                          className={`px-3 py-2 flex justify-center items-center ${
                            isDark
                              ? "text-white bg-red-700"
                              : "text-white bg-red-500"
                          } rounded text-sm`}
                        >
                          {job.jobLevel.split("_").join(" ").toUpperCase()}
                        </span>
                        {job.salaryMinPerMonth && (
                          <span
                            className={`px-3 py-2 flex justify-center items-center ${
                              isDark
                                ? "text-white bg-green-700"
                                : "text-white bg-green-600"
                            } rounded text-sm`}
                          >
                            {`${
                              job.salaryMinPerMonth > 1000
                                ? Math.floor(job.salaryMinPerMonth / 1000) + "k"
                                : job.salaryMinPerMonth
                            } - ${
                              job.salaryMaxPerMonth > 1000
                                ? Math.floor(job.salaryMaxPerMonth / 1000) + "k"
                                : job.salaryMaxPerMonth
                            } / M`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 mt-4 md:mt-0">
                    <button
                      className={`p-2 rounded-lg ${
                        isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                      } transition-colors`}
                    >
                      <Star className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => navigate(`/job?id=${job._id}`)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="flex gap-3 justify-center items-center my-15">
          <div className="text-gray-400 text-3xl font-bold">No Jobs Found!</div>
          <Frown className="text-gray-400 scale-150" />
        </div>
      )}
    </div>
  );
};

export default memo(JobsCard);
