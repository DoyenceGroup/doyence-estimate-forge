import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Users, BarChart, Calculator } from 'lucide-react';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <span className="text-xl font-montserrat font-bold text-primary-700">
                Doyence Estimating
              </span>
            </div>
            <nav className="hidden md:flex space-x-10">
              <a href="#features" className="text-base font-medium text-gray-500 hover:text-gray-900">
                Features
              </a>
              <a href="#how-it-works" className="text-base font-medium text-gray-500 hover:text-gray-900">
                How it works
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto pt-16 pb-24 px-4 sm:pt-24 sm:pb-32 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1>
                <span className="block text-sm font-semibold uppercase tracking-wide text-primary-600">
                  Construction Estimating Software
                </span>
                <span className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl">
                  <span className="text-gray-900">Simplify Your</span>{' '}
                  <span className="text-primary-600">Estimating Process</span>
                </span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Create professional estimates for your construction projects, track progress,
                and manage customers all in one place.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <Link to="/signup">
                  <Button size="lg" className="px-8 py-3 rounded-lg flex items-center gap-2">
                    Get Started <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                <div className="relative block w-full bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    className="w-full"
                    src="https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
                    alt="Construction estimating preview"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to manage your estimates
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Doyence Estimating provides all the tools you need to create accurate construction estimates.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
                  <Calculator className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Accurate Estimating</h3>
                <p className="text-base text-gray-500 text-center">
                  Create detailed estimates for materials, labor, and equipment costs.
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Client Management</h3>
                <p className="text-base text-gray-500 text-center">
                  Keep track of all your customers and their project requirements.
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Professional Documents</h3>
                <p className="text-base text-gray-500 text-center">
                  Generate professional quotes and invoices with your company branding.
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
                  <BarChart className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Detailed Analytics</h3>
                <p className="text-base text-gray-500 text-center">
                  Track project performance with detailed reports and analytics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">How it works</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Start creating estimates in minutes
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 text-primary-600 mb-4">
                  <span className="text-lg font-bold">1</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sign up and set up your profile</h3>
                <p className="text-base text-gray-500">
                  Create your account and add your company information and logo.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 text-primary-600 mb-4">
                  <span className="text-lg font-bold">2</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Create your first estimate</h3>
                <p className="text-base text-gray-500">
                  Add project details, customer information, and your itemized costs.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 text-primary-600 mb-4">
                  <span className="text-lg font-bold">3</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Send professional quotes</h3>
                <p className="text-base text-gray-500">
                  Generate and send professional-looking estimates to your customers.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link to="/signup">
              <Button size="lg" className="px-8 py-3 rounded-lg">
                Get Started Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex items-center">
              <span className="text-xl font-montserrat font-bold text-primary-700">
                Doyence Estimating
              </span>
            </div>
            <div className="mt-8 md:mt-0">
              <p className="text-center text-base text-gray-400">
                &copy; {new Date().getFullYear()} Doyence Estimating. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
