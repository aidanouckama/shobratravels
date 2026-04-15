"use client";

import { useState } from "react";
import { MapPin, Phone, Mail } from "lucide-react";

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider">
            Get in Touch
          </h1>
          <p className="text-green-200/70 mt-4 text-lg">
            We would be glad to answer your inquiries regarding our upcoming
            trips.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-wider mb-8">
                Contact Information
              </h2>
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary text-accent-light flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-neutral-600">
                      54 Colonial Way
                      <br />
                      Short Hills, NJ 07078
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary text-accent-light flex items-center justify-center shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <a
                      href="tel:2016182629"
                      className="text-neutral-600 hover:text-accent-light transition-colors"
                    >
                      (201) 618-2629
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary text-accent-light flex items-center justify-center shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <a
                      href="mailto:shobratravels@gmail.com"
                      className="text-neutral-600 hover:text-accent-light transition-colors"
                    >
                      shobratravels@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {submitted ? (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold uppercase tracking-wider mb-4">
                    Thank You
                  </h2>
                  <p className="text-neutral-600">
                    We&apos;ve received your message and will get back to you
                    shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, message: e.target.value }))
                      }
                      className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-accent hover:bg-accent-dark text-white font-semibold py-3 uppercase tracking-wider text-sm transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Sending..." : "Contact Us"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
