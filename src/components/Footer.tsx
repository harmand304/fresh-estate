import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react";
import logo from "@/assets/Logo - Edited.webp";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <img src={logo} alt="Mood Real Estate" className="h-16 w-auto object-contain brightness-0 invert" />
            </Link>
            <p className="text-primary-foreground/70 mb-6">
              Your trusted partner for finding the perfect property in Kurdistan.
              Modern apartments, luxury villas, and family homes.
            </p>
            <div className="flex gap-4 social-icons">
              {/* Facebook */}
              <div className="icon-content">
                <a href="#" data-social="facebook" aria-label="Facebook">
                  <span className="filled"></span>
                  <Facebook className="w-5 h-5 relative z-10" />
                </a>
                <span className="tooltip">Facebook</span>
              </div>

              {/* Instagram */}
              <div className="icon-content">
                <a href="#" data-social="instagram" aria-label="Instagram">
                  <span className="filled"></span>
                  <Instagram className="w-5 h-5 relative z-10" />
                </a>
                <span className="tooltip">Instagram</span>
              </div>

              {/* Twitter */}
              <div className="icon-content">
                <a href="#" data-social="twitter" aria-label="Twitter">
                  <span className="filled"></span>
                  <Twitter className="w-5 h-5 relative z-10" />
                </a>
                <span className="tooltip">Twitter</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/properties"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  All Properties
                </Link>
              </li>
              <li>
                <Link
                  to="/cities/erbil"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Properties in Erbil
                </Link>
              </li>
              <li>
                <Link
                  to="/cities/sulaymaniyah"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Properties in Sulaymaniyah
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/about#contact"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Property Types</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/properties?type=apartment"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Apartments
                </Link>
              </li>
              <li>
                <Link
                  to="/properties?type=house"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Houses
                </Link>
              </li>
              <li>
                <Link
                  to="/properties?type=villa"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Villas
                </Link>
              </li>
              <li>
                <Link
                  to="/properties?purpose=rent"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  For Rent
                </Link>
              </li>
              <li>
                <Link
                  to="/properties?purpose=sale"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  For Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/70">
                  Empire World Tower, Erbil, Kurdistan Region, Iraq
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a
                  href="tel:+9647501234567"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  +964 750 123 4567
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a
                  href="mailto:info@mood.iq"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  info@mood.iq
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/60 text-sm">
            © {new Date().getFullYear()} Mood Real Estate. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;