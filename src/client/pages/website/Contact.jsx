import React, { useState } from 'react';
import axios from 'axios';
import { MapPin, Phone, Mail, Send, CheckCircle2 } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/website/contact', formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Get in Touch with <span className="text-[#0D4715]">Buykart</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Have questions about our fresh products, order delivery, or partnership opportunities? We'd love to hear from you!
          </p>
        </div>

        {/* Contact Content Grid */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Info Card & Google Maps Embed */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
              Contact Details
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#EBF4DD] text-[#0D4715] rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Store Location</h3>
                  <p className="text-gray-600 text-sm mt-0.5">24/74E, Vettukattu valasu, Erode - 638011</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#EBF4DD] text-[#0D4715] rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Phone Helpline</h3>
                  <p className="text-gray-600 text-sm mt-0.5">+91 6383217328</p>
                  <span className="text-xs text-gray-400 font-medium">Mon-Sun: 9:00 AM - 6:00 PM</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#EBF4DD] text-[#0D4715] rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Email Address</h3>
                  <p className="text-gray-600 text-sm mt-0.5">support@buykart.com</p>
                </div>
              </div>
            </div>

            {/* Embedded Google Map */}
            <div className="h-56 rounded-2xl overflow-hidden shadow-inner border border-gray-200">
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
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
              Send Us a Message
            </h2>

            {submitted && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 text-sm font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Thank you! Your message has been sent successfully.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0D4715] focus:outline-none text-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0D4715] focus:outline-none text-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we help you today?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0D4715] focus:outline-none text-sm transition resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0D4715] hover:bg-[#41644A] text-white font-bold py-3.5 px-4 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
