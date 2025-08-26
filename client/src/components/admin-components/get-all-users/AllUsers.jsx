import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ThemeContext } from "../../../contexts/ThemeContext";
import Pagination from "../../home/pagination/Pagination";
import useFetchUsers from "../../../hooks/admin-hooks/useFetchUsers";
import { Search, Users, ChevronDown, UserX } from "lucide-react";
import UserTable from "./UserTable";
import { useDebounce } from "../../../hooks/useDebounce";

const AllUsers = () => {
  const { isDark, allUserThemeClasses } = useContext(ThemeContext);
  const [userData, setUserData] = useState({});
  const { isPending, mutate } = useFetchUsers(setUserData);

  const { register, getValues, setValue, watch } = useForm({
    defaultValues: {
      search: "",
      order: "dse", // Newest first
      page: "1",
      limit: "1",
    },
  });

  const searchValue = watch("search");
  const debounceSearch = useDebounce(searchValue, 500);
  const values = watch();

  useEffect(() => {
    const query = { ...getValues(), search: debounceSearch };
    mutate(query);
  }, [
    debounceSearch,
    values.order,
    values.page,
    values.limit,
    getValues,
    mutate,
  ]);

  const handlePagination = (pageNumber) => {
    setValue("page", pageNumber?.toString());
    const allQuery = getValues();
    mutate(allQuery);
  };

  return (
    <div
      className={`min-h-screen p-4 lg:p-8 ${allUserThemeClasses.background}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${allUserThemeClasses.text}`}>
                Users Management
              </h1>
              <p className={allUserThemeClasses.textSecondary}>
                Manage and monitor all WorkHive users
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-6">
            <div
              className={`px-4 py-2 rounded-lg border ${allUserThemeClasses.cardBackground} ${allUserThemeClasses.border}`}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span
                  className={`text-sm font-medium ${allUserThemeClasses.text}`}
                >
                  Total Users: {userData?.data?.users?.length}
                </span>
              </div>
            </div>
            <div
              className={`px-4 py-2 rounded-lg border ${allUserThemeClasses.cardBackground} ${allUserThemeClasses.border}`}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span
                  className={`text-sm font-medium ${allUserThemeClasses.text}`}
                >
                  Active: {userData?.data?.users?.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <form
          // onChange={handleSubmit(onSubmit)}
          className={`${allUserThemeClasses.cardBackground} rounded-xl shadow-sm border ${allUserThemeClasses.border} p-6 mb-6`}
        >
          <div>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${allUserThemeClasses.textSecondary}`}
                />
                <input
                  {...register("search")}
                  type="text"
                  placeholder="Search users by name, email, or role..."
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${allUserThemeClasses.input} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                />
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  {...register("order")}
                  className={`appearance-none w-full lg:w-48 px-4 py-3 rounded-lg border ${allUserThemeClasses.input} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                >
                  <option value="dsc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
                <ChevronDown
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none ${allUserThemeClasses.textSecondary}`}
                />
              </div>
            </div>
          </div>
        </form>

        {userData?.data?.users?.length > 0 ? (
          <>
            <UserTable userData={userData} />

            {/* Pagination */}
            <Pagination
              currentPage={userData?.currentPage || "1"}
              isDark={isDark}
              totalPages={userData?.totalPages || "0"}
              pageFilter={handlePagination}
            />
          </>
        ) : isPending ? (
          <div
            className={`${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } p-6 h-32 flex justify-center items-center rounded-2xl border shadow-sm`}
          >
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin w-6 h-6 sm:w-8 sm:h-8 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
              <span
                className={`text-lg sm:text-xl font-semibold ${
                  isDark ? "text-gray-100" : "text-gray-800"
                }`}
              >
                Loading please wait..
                <span className="dots inline-block w-4"></span>
              </span>
              <style>
                {`
                  .dots::after {
                    content: "";
                    animation: dots 1.2s steps(4, end) infinite;
                  }

                  @keyframes dots {
                    0%   { content: ""; }
                    25%  { content: "."; }
                    50%  { content: ".."; }
                    75%  { content: "..."; }
                    100% { content: ""; }
                  }
                `}
              </style>
            </div>
          </div>
        ) : (
          <div
            className={`${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } p-6 h-32 flex justify-center items-center gap-2 rounded-2xl border shadow-sm`}
          >
            <UserX className="scale-125" />
            <span className={`text-2xl`}>No user found!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
