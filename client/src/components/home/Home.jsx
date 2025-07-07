import React, { useContext, useState } from 'react';
import {
  Bell,
  Briefcase,
  Building2,
  MapPin,
  Moon,
  Search,
  Sun,
  User,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  Heart,
  Clock,
  DollarSign,
  Users,
  Code,
  Palette,
  BarChart3,
  Stethoscope,
  Wrench,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
} from 'lucide-react';
import Footer from '../footer/Footer';
import GuestHomePage from './GuestHomePage';
import { ThemeContext } from '../../contexts/ThemeContext';

function Home() {
  const { isDark, themeClasses, bodyThemeClasses, searchBgClasses } = useContext(ThemeContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedJobType, setSelectedJobType] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const staticData = {
    popularSearches: ['Software Engineer', 'Data Analyst', 'Product Manager', 'UX Designer'],
    popularCitys: ['Mumbai, IN', 'Bangalore, IN', 'Hyderabad, IN', 'Chennai, IN'],
    categories: [
      { name: 'Technology', icon: Code, count: 1250 },
      { name: 'Design', icon: Palette, count: 340 },
      { name: 'Marketing', icon: BarChart3, count: 580 },
      { name: 'Healthcare', icon: Stethoscope, count: 290 },
      { name: 'Engineering', icon: Wrench, count: 720 },
      { name: 'Business', icon: Building2, count: 450 },
    ],
    jobTypes: ['Full-time', 'Part-time', 'Contract', 'Remote'],
    jobLevels: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'],
    jobs: [
      {
        id: 1,
        title: 'Senior React Developer',
        company: 'TechCorp',
        location: 'Mumbai, IN',
        type: 'Full-time',
        level: 'Senior Level',
        salary: '₹15-25 LPA',
        posted: '2 days ago',
        logo: '🚀',
      },
      {
        id: 2,
        title: 'UX Designer',
        company: 'DesignStudio',
        location: 'Bangalore, IN',
        type: 'Remote',
        level: 'Mid Level',
        salary: '₹8-15 LPA',
        posted: '1 day ago',
        logo: '🎨',
      },
      {
        id: 3,
        title: 'Data Scientist',
        company: 'DataFlow',
        location: 'Hyderabad, IN',
        type: 'Full-time',
        level: 'Senior Level',
        salary: '₹20-30 LPA',
        posted: '3 days ago',
        logo: '📊',
      },
      {
        id: 4,
        title: 'Product Manager',
        company: 'StartupXYZ',
        location: 'Chennai, IN',
        type: 'Full-time',
        level: 'Mid Level',
        salary: '₹12-20 LPA',
        posted: '1 day ago',
        logo: '💼',
      },
      {
        id: 5,
        title: 'Frontend Developer',
        company: 'WebSolutions',
        location: 'Mumbai, IN',
        type: 'Contract',
        level: 'Entry Level',
        salary: '₹6-10 LPA',
        posted: '4 days ago',
        logo: '💻',
      },
      {
        id: 6,
        title: 'Marketing Specialist',
        company: 'GrowthCo',
        location: 'Bangalore, IN',
        type: 'Part-time',
        level: 'Mid Level',
        salary: '₹5-8 LPA',
        posted: '2 days ago',
        logo: '📈',
      },
    ],
  };

  const toggleLogin = () => setIsLoggedIn(!isLoggedIn);

  // Logged In Homepage
  const LoggedInHomepage = () => (
    <div className={`min-h-screen ${bodyThemeClasses}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1
            className={`text-2xl md:text-3xl font-bold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            Welcome back, John! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Discover your next career opportunity</p>
        </div>

        {/* Filters */}
        <div className={`${themeClasses} p-6 rounded-xl mb-8`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`p-3 rounded-lg border ${searchBgClasses} ${
                isDark ? 'text-white' : 'text-gray-900'
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
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
              className={`p-3 rounded-lg border ${searchBgClasses} ${
                isDark ? 'text-white' : 'text-gray-900'
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
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className={`p-3 rounded-lg border ${searchBgClasses} ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              <option value="All">All Levels</option>
              {staticData.jobLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            <button className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-4 mb-8">
          {staticData.jobs.map((job) => (
            <div
              key={job.id}
              className={`${themeClasses} p-6 rounded-xl hover:shadow-lg transition-all`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{job.logo}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-2">
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
                        <span>{job.posted}</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                        {job.type}
                      </span>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                        {job.level}
                      </span>
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                        {job.salary}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 mt-4 md:mt-0">
                  <button
                    className={`p-2 rounded-lg ${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    } transition-colors`}
                  >
                    <Heart className="h-5 w-5" />
                  </button>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div
          className={`flex justify-center items-center space-x-4 ${
            isDark ? 'text-white' : 'text-gray-600'
          }`}
        >
          <button
            className={`p-2 rounded-lg ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            } transition-colors`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                className={`px-3 py-1 rounded-lg ${
                  page === 1
                    ? 'bg-blue-600 text-white'
                    : `${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`
                } transition-colors`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            className={`p-2 rounded-lg ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            } transition-colors`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      {/* Toggle button for demo purposes */}
      <div className="fixed top-24 right-4 z-50">
        <button
          onClick={toggleLogin}
          className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
        >
          {isLoggedIn ? 'View Guest' : 'View Logged In'}
        </button>
      </div>

      {isLoggedIn ? <LoggedInHomepage /> : <GuestHomePage />}
      <Footer />
    </div>
  );
}

export default Home;
