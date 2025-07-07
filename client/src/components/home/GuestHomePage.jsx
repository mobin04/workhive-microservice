import { BarChart3, Building2, Code, Palette, Stethoscope, Wrench } from 'lucide-react';
import React, { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';

function GuestHomePage() {
  const {bodyThemeClasses, themeClasses, dynamicFontColor, isDark} = useContext(ThemeContext);
  
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
  };


  return (
    <div className={`min-h-screen ${bodyThemeClasses}`}>
      {/* Hero Section */}
      <div className={`${themeClasses} py-16 px-4`}>
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Your{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Dream Job
            </span>
          </h1>
          <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
            Connect with top companies and discover opportunities that match your skills
          </p>

          <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
            Get Started
          </button>
        </div>
      </div>

      {/* Job Categories */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2
          className={`text-3xl font-bold text-center mb-12 ${
            isDark ? 'text-white' : 'text-gray-900'
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
                    <IconComponent className={`h-6 w-6 ${isDark ? 'text-blue-200' :  'text-blue-300'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.count} jobs</p>
                  </div>
                </div>
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
    </div>
  );
}

export default GuestHomePage;
