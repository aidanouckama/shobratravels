import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.png"
                alt="Shobra Travel Agency"
                width={36}
                height={36}
                className="brightness-0 invert"
              />
              <h3 className="text-lg font-bold uppercase tracking-wider">
                Shobra Travel Agency
              </h3>
            </div>
            <p className="text-sm text-green-300 uppercase tracking-widest mb-4">
              Cultural Historical Boutique Tours
            </p>
            <p className="text-sm text-green-200/70 leading-relaxed">
              Curating extraordinary travel experiences for discerning travelers
              seeking cultural and historical adventures.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <nav className="flex flex-col gap-2">
              {[
                { href: "/trips", label: "Upcoming Trips" },
                { href: "/gallery", label: "Gallery" },
                { href: "/reviews", label: "Reviews" },
                { href: "/contact", label: "Contact Us" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-green-200/70 hover:text-accent-light transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">
              Contact
            </h3>
            <div className="flex flex-col gap-3 text-sm text-green-200/70">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="shrink-0 text-accent-light" />
                <span>54 Colonial Way, Short Hills, NJ 07078</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="shrink-0 text-accent-light" />
                <a href="tel:2016182629" className="hover:text-accent-light transition-colors">
                  (201) 618-2629
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="shrink-0 text-accent-light" />
                <a
                  href="mailto:shobratravels@gmail.com"
                  className="hover:text-accent-light transition-colors break-all"
                >
                  shobratravels@gmail.com
                </a>
              </div>
              <a
                href="https://facebook.com/shobratravel"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-accent-light transition-colors mt-2"
              >
                <ExternalLink size={16} className="text-accent-light" />
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-green-700 mt-12 pt-8 text-center text-sm text-green-200/50">
          &copy; 2026 Shobra Travel Agency, LLC. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
