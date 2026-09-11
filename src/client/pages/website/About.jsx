import React from 'react';
import MaterialIcon from '../../components/common/MaterialIcon';

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            About <span className="text-[#0D4715]">Buykart</span>
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium">
            Your trusted partner for fresh produce, farm essentials, and daily household groceries delivered swiftly to your doorstep.
          </p>
        </div>

        {/* Hero Mission Grid */}
        <div className="grid md:grid-cols-2 gap-12 items-center bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-slate-200/80">
          <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden shadow-md">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
              alt="Fresh Organic Produce"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#EBF4DD] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#0D4715]">
              <MaterialIcon name="eco" size={16} />
              <span>Farm to Table Quality</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Our Core Mission</h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              At Buykart, we believe that access to fresh, nutritious food is a fundamental right. Founded with the vision of bridging the gap between local growers and urban households, we strive to bring the freshest produce directly to your home.
            </p>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              We are committed to sustainability, fair trade with growers, and uncompromising quality standards. Every item in our catalog is hand-selected to ensure maximum freshness and satisfaction.
            </p>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black text-slate-900 text-center">Why Customers Choose Us</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-xs border border-slate-200/80 text-center space-y-4 hover:shadow-md transition">
              <div className="w-14 h-14 bg-[#EBF4DD] text-[#0D4715] rounded-2xl flex items-center justify-center mx-auto">
                <MaterialIcon name="eco" size={28} />
              </div>
              <h3 className="font-black text-lg text-slate-900">Fresh & Organic</h3>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                Sourced directly from certified organic local farms to ensure maximum nutrition and natural taste.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xs border border-slate-200/80 text-center space-y-4 hover:shadow-md transition">
              <div className="w-14 h-14 bg-emerald-100 text-[#0D4715] rounded-2xl flex items-center justify-center mx-auto">
                <MaterialIcon name="local_shipping" size={28} />
              </div>
              <h3 className="font-black text-lg text-slate-900">Swift Delivery</h3>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                Dedicated OnTime rider dispatch network ensuring prompt doorstep delivery with zero hassle.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xs border border-slate-200/80 text-center space-y-4 hover:shadow-md transition">
              <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto">
                <MaterialIcon name="support_agent" size={28} />
              </div>
              <h3 className="font-black text-lg text-slate-900">Dedicated Support</h3>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                Our support team is always available to assist with inquiries, custom orders, or delivery support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
