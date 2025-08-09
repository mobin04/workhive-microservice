import {
  BarChart3,
  Building2,
  Code,
  Palette,
  Stethoscope,
  Wrench,
  MapPin,
  Users,
  Briefcase,
  Target,
} from "lucide-react";
import { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import {useNavigate} from 'react-router-dom' 


function GuestHomePage() {
  // Mock theme context for demonstration

  const { bodyThemeClasses, themeClasses, dynamicFontColor, isDark } =
    useContext(ThemeContext);
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path)
  };

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
    locationFeatures: [
      {
        icon: MapPin,
        title: "Smart Location Filters",
        description:
          "Find jobs in your preferred city, state, or explore remote opportunities with our intelligent location-based search.",
      },
      {
        icon: Target,
        title: "Proximity-Based Matching",
        description:
          "Discover opportunities within your commute range and get personalized job recommendations based on your location preferences.",
      },
      {
        icon: Briefcase,
        title: "Local Market Insights",
        description:
          "Access salary insights, market trends, and company culture information specific to your target locations.",
      },
    ],
    employerFeatures: [
      {
        icon: Building2,
        title: "Comprehensive Job Management",
        description:
          "Employers can effortlessly create, edit, and manage all job postings from a unified, intuitive dashboard.",
      },
      {
        icon: Users,
        title: "Advanced Candidate Filtering",
        description:
          "Powerful tools to filter and shortlist candidates based on skills, experience, location, and custom criteria.",
      },
      {
        icon: BarChart3,
        title: "Real-Time Analytics",
        description:
          "Track application metrics, view performance insights, and optimize your hiring process with detailed analytics.",
      },
    ],
  };

  return (
    <div className={`${bodyThemeClasses}`}>
      {/* Hero Section */}
      <div className={`${themeClasses} py-16 px-4`}>
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Dream Job
            </span>
          </h1>
          <p className={`text-xl mb-8 ${dynamicFontColor}`}>
            Connect with top companies and discover opportunities that match
            your skills
          </p>

          <button
            onClick={() => handleNavigation("/login")}
            className="px-8 py-4 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Job Categories */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2
          className={`text-3xl font-bold text-center mb-12 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Browse by Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {staticData.categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <div
                key={index}
                className={`${themeClasses} p-6 rounded-xl hover:shadow-lg transition-all cursor-pointer group`}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="p-1 sm:p-2 lg-p-3 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                    <IconComponent
                      className={`h-6 w-6 ${
                        isDark ? "text-blue-200" : "text-blue-300"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl">{category.name}</h3>
                    <p className="text-sm text-gray-500">
                      {category.count} jobs
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Location-Based Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2
            className={`text-3xl font-bold mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Smart Location-Based Search
          </h2>
          <p className={`text-lg ${dynamicFontColor} max-w-3xl mx-auto`}>
            Discover opportunities tailored to your location preferences with
            our advanced geographic filtering system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {staticData.locationFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className={`${themeClasses} p-8 rounded-xl text-center hover:shadow-lg transition-all`}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-6">
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <h3
                  className={`text-xl font-semibold mb-4 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {feature.title}
                </h3>
                <p className={`${dynamicFontColor} leading-relaxed`}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Section */}
      <div className={`${themeClasses} py-16`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
              <div className={`${dynamicFontColor}`}>Active Jobs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">5K+</div>
              <div className={`${dynamicFontColor}`}>Companies</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">50K+</div>
              <div className={`${dynamicFontColor}`}>Job Seekers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
              <div className={`${dynamicFontColor}`}>Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Employer Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2
            className={`text-3xl font-bold mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Powerful Tools for Employers
          </h2>
          <p className={`text-lg ${dynamicFontColor} max-w-3xl mx-auto`}>
            Streamline your hiring process with our comprehensive suite of
            employer tools and analytics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {staticData.employerFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className={`${themeClasses} p-8 rounded-xl hover:shadow-lg transition-all group`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:from-blue-600 group-hover:to-blue-700 transition-all">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`text-xl font-semibold mb-3 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {feature.title}
                    </h3>
                    <p className={`${dynamicFontColor} leading-relaxed`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => handleNavigation("/signup")}
            className="px-8 cursor-pointer py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg"
          >
            Start Hiring Today
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuestHomePage;
