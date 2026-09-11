import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '../../components/common/Toast';
import MaterialIcon from '../../components/common/MaterialIcon';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/website/contact', formData);
      showSuccess('Thank you! Your message has been sent. We will get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Get in Touch with <span className="text-[#0D4715]">Buykart</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base font-medium">
            Have questions about our fresh produce, delivery service, or wholesale orders? We are here to help!
          </p>
        </div>

        {/* Contact Content Grid */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Info Card & Google Maps Embed */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-8">
            <h2 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <MaterialIcon name="contact_phone" size={22} className="text-[#0D4715]" />
              Store & Support Details
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-[#EBF4DD] text-[#0D4715] rounded-2xl flex items-center justify-center shrink-0">
                  <MaterialIcon name="location_on" size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Main Store Location</h3>
                  <p className="text-slate-600 text-xs sm:text-sm mt-0.5">24/74E, Vettukattu valasu, Erode - 638011</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-[#EBF4DD] text-[#0D4715] rounded-2xl flex items-center justify-center shrink-0">
                  <MaterialIcon name="call" size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Helpline Support</h3>
                  <p className="text-slate-600 text-xs sm:text-sm mt-0.5 font-bold">+91 6383217328</p>
                  <span className="text-[11px] text-slate-400 font-semibold">Mon-Sun: 8:00 AM - 9:00 PM</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-[#EBF4DD] text-[#0D4715] rounded-2xl flex items-center justify-center shrink-0">
                  <MaterialIcon name="mail" size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Customer Email</h3>
                  <p className="text-slate-600 text-xs sm:text-sm mt-0.5 font-semibold">support@buykart.com</p>
                </div>
              </div>
            </div>

            {/* Embedded Google Map */}
            <div className="h-56 rounded-2xl overflow-hidden shadow-inner border border-slate-200">
              <iframe
                title="Buykart Map Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1955.9526869730444!2d77.69672282780762!3d11.341621979536473!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba96ed9aafbce3f%3A0xa7343cf5ed2b6633!2s74d%2C%20Vivekananda%20Rd%2C%20Vettukattuvalasu%2C%20Erode%2C%20Tamil%20Nadu%20638011!5e0!3m2!1sen!2sin!4v1768663313262!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
          </div>

          {/* Interactive Form */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-6">
            <h2 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <MaterialIcon name="mail" size={22} className="text-[#0D4715]" />
              Send Us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0D4715]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Your Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0D4715]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Message / Inquiry</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us what you'd like to ask or share..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0D4715]"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#0D4715] hover:bg-[#1b5e20] text-white font-extrabold py-3.5 px-6 rounded-2xl transition shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                ) : (
                  <>
                    <MaterialIcon name="send" size={16} />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
