import React, { memo, useContext } from "react";
import { ThemeContext } from "../../../contexts/ThemeContext";
import { Building2, Clock, Frown, MapPin, Star } from "lucide-react";

const JobsCard = ({ jobs, posted }) => {

  const { isDark, dynamicFontColor, themeClasses } = useContext(ThemeContext);
  return (
    <div>
      {jobs && jobs.length !== 0 ? (
        <div className="space-y-4 mb-8">
          {jobs &&
            jobs.map((job) => (
              <div
                key={job._id}
                className={`${themeClasses} p-6 rounded-xl hover:shadow-lg transition-all`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex items-start space-x-4">
                    {/* <div className="text-3xl" >{job.logo}</div> */}
                    <div className="w-14 h-14 p-1 rounded-full bg-gray-100 overflow-hidden">
                      <img
                        className="w-full h-full object-cover object-center"
                        src={job.companyLogo}
                        alt="logo"
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
                          <span>{posted(job.updatedAt)} days ago</span>
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
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="flex gap-3 justify-center items-center mt-20">
          <div
            className="text-gray-400 text-3xl font-bold"
          >
            No Jobs Found!
          </div>
          <Frown
            className="text-gray-400 scale-150"
          />
        </div>
      )}
    </div>
  );
};

export default memo(JobsCard);