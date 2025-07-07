import { Briefcase, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import React, { useContext } from 'react'
import { ThemeContext } from '../../contexts/ThemeContext';

function Footer() {
  const {themeClasses, dynamicFontColor} = useContext(ThemeContext);

  return (
    <footer className={`${themeClasses} border-t-2`}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-lg">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                WorkHive
              </h3>
            </div>
            <p className={`${dynamicFontColor} mb-4`}>
              Your gateway to finding the perfect job and building your career.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-600 dark:text-gray-300 hover:text-blue-600 cursor-pointer" />
              <Twitter className="h-5 w-5 text-gray-600 dark:text-gray-300 hover:text-blue-600 cursor-pointer" />
              <Linkedin className="h-5 w-5 text-gray-600 dark:text-gray-300 hover:text-blue-600 cursor-pointer" />
              <Instagram className="h-5 w-5 text-gray-600 dark:text-gray-300 hover:text-blue-600 cursor-pointer" />
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Job Seekers</h4>
            <ul className={`space-y-2 ${dynamicFontColor}`}>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Browse Jobs</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Career Advice</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Resume Builder</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Salary Guide</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Employers</h4>
            <ul className={`space-y-2 ${dynamicFontColor}`}>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Post Jobs</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Find Candidates</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Employer Resources</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className={`space-y-2 ${dynamicFontColor}`}>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>hello@workhive.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Mumbai, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={`border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center ${dynamicFontColor}`}>
          <p>&copy; 2025 WorkHive By Mobin. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
