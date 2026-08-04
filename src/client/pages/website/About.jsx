import React from 'react';
import { Leaf, Truck, Headset, ShieldCheck, HeartHandshake } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            About <span className="text-[#0D4715]">Buykart</span>
          </h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            Your trusted partner for fresh groceries, farm-fresh produce, and daily household essentials, delivering quality directly to your doorstep.
          </p>
        </div>

        {/* Hero Mission Grid */}
        <div className="grid md:grid-cols-2 gap-12 items-center bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-100">
          <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden shadow-md">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
              alt="Fresh Organic Produce"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#EBF4DD] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#0D4715]">
              <Leaf className="w-4 h-4" />
              <span>Farm to Table Quality</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Our Core Mission</h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              At Buykart, we believe that access to fresh, nutritious food is a fundamental right. Founded with the vision of bridging the gap between local farmers and urban households, we strive to bring the freshest produce directly to your home.
            </p>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              We are committed to sustainability, fair trade with growers, and uncompromising quality standards. Every item in our catalog is hand-selected to ensure maximum freshness and satisfaction.
            </p>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="space-y-8">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center">Why Customers Choose Us</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-xs border border-gray-100 text-center space-y-4 hover:shadow-md transition">
              <div className="w-14 h-14 bg-[#EBF4DD] text-[#0D4715] rounded-2xl flex items-center justify-center mx-auto">
                <Leaf className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-lg text-gray-900">Fresh & Organic</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Sourced directly from certified organic local farms to ensure maximum nutrition and taste.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xs border border-gray-100 text-center space-y-4 hover:shadow-md transition">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-lg text-gray-900">Superfast Delivery</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Efficient logistics network ensuring your order arrives on time with zero hassle.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xs border border-gray-100 text-center space-y-4 hover:shadow-md transition">
              <div className="w-14 h-14 bg-orange-100 text-[#E9762B] rounded-2xl flex items-center justify-center mx-auto">
                <Headset className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-lg text-gray-900">Dedicated Support</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Our support team is always here to ensure your grocery shopping experience is smooth and delightful.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
