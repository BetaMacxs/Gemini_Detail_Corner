export function Contact() {
  return (
    <div className="bg-brand-bg">
      {/* Hero section */}
      <div className="relative bg-brand-bg overflow-hidden py-32">
        {/* Placeholder for the car background image */}
        <div className="absolute inset-0 opacity-20 bg-gradient-to-b from-transparent to-[#1f1f1f]">
          <div className="absolute inset-0 bg-brand-bg/80" style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8))' }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-brand-text-primary sm:text-5xl md:text-6xl">
            Get <span className="text-brand-accent">In Touch</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-brand-text-secondary">
            Have questions? We're here to help. Get in touch with our team.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="sr-only">Name *</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="block w-full border-0 bg-black/40 text-brand-text-secondary placeholder-gray-500 rounded-md py-3 px-4 focus:ring-2 focus:ring-brand-accent"
                  placeholder="Name *"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">Email *</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="block w-full border-0 bg-black/40 text-brand-text-secondary placeholder-gray-500 rounded-md py-3 px-4 focus:ring-2 focus:ring-brand-accent"
                  placeholder="Email *"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="sr-only">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  className="block w-full border-0 bg-black/40 text-brand-text-secondary placeholder-gray-500 rounded-md py-3 px-4 focus:ring-2 focus:ring-brand-accent"
                  placeholder="Phone"
                />
              </div>
              <div>
                <label htmlFor="subject" className="sr-only">Select a subject *</label>
                <select
                  id="subject"
                  name="subject"
                  className="block w-full border-0 bg-black/40 text-brand-text-secondary placeholder-gray-500 rounded-md py-3 px-4 focus:ring-2 focus:ring-brand-accent"
                  required
                >
                  <option value="">Select a subject *</option>
                  <option value="support">Support</option>
                  <option value="sales">Sales</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="sr-only">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="block w-full border-0 bg-black/40 text-brand-text-secondary placeholder-gray-500 rounded-md py-3 px-4 focus:ring-2 focus:ring-brand-accent"
                  placeholder="Message *"
                  required
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  className="inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-base font-medium rounded-full text-brand-text-primary bg-brand-accent hover:bg-brand-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent focus:ring-offset-[#1f1f1f] transition-colors"
                >
                  Send Message
                </button>
              </div>
            </form>
            <p className="mt-4 text-xs text-brand-text-secondary">
              * This form uses a free third-party service. For sensitive information, please email us directly.
            </p>
          </div>

          {/* Map Placeholder */}
          <div className="bg-black/40 rounded-md overflow-hidden min-h-[400px] flex items-center justify-center relative">
            <div className="absolute inset-0 bg-brand-border/80">
              {/* This would be an iframe or actual map implementation */}
              <div className="w-full h-full flex flex-col items-center justify-center text-brand-text-secondary">
                <span className="block mb-2 text-3xl">📍</span>
                <p>Map Location Placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
