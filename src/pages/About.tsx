import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Award, Building2, TrendingUp, Phone, Mail, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import erbilBg from "@/assets/abt-bg.jpg";
import bakoImg from "@/assets/bako.jpg";
import mohammedImg from "@/assets/mohammed.jpeg";
import harmandImg from "@/assets/harmand.jpg";
import alanImg from "@/assets/alan.jpg";

const About = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      toast.success("Message sent successfully!", {
        description: "We'll get back to you as soon as possible."
      });
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[60vh] pt-20 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${erbilBg})`
            }}
          />
          <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 animate-fade-in-up">
              Building Trust, Creating Homes
            </h1>
            <p className="text-xl text-white/90 font-light max-w-2xl mx-auto animate-fade-in-up delay-100">
              At Fresh Estate, we believe in more than just transactions. We believe in finding the perfect space where your life's best memories will unfold.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 px-4 container mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold mb-6 text-foreground">Our Mission</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                To revolutionize the real estate experience in the region by providing transparent, efficient, and personalized services. We strive to empower our clients with market insights and exceptional support, ensuring every decision is made with confidence.
              </p>

              <h2 className="text-3xl font-display font-bold mb-6 text-foreground">Our Vision</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                To be the most trusted and innovative real estate partner in the Middle East, known for integrity, excellence, and a deep commitment to community growth and development.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80"
                  alt="Modern Office"
                  className="rounded-2xl shadow-lg w-full h-64 object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80"
                  alt="Team Meeting"
                  className="rounded-2xl shadow-lg w-full h-48 object-cover"
                />
              </div>
              <div className="space-y-4 pt-8">
                <img
                  src="https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&q=80"
                  alt="Handshake"
                  className="rounded-2xl shadow-lg w-full h-48 object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80"
                  alt="Happy Clients"
                  className="rounded-2xl shadow-lg w-full h-64 object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <Building2 className="w-10 h-10 mx-auto opacity-80" />
                <h3 className="text-4xl font-bold">500+</h3>
                <p className="text-white/80">Properties Sold</p>
              </div>
              <div className="space-y-2">
                <Users className="w-10 h-10 mx-auto opacity-80" />
                <h3 className="text-4xl font-bold">1200+</h3>
                <p className="text-white/80">Happy Clients</p>
              </div>
              <div className="space-y-2">
                <Award className="w-10 h-10 mx-auto opacity-80" />
                <h3 className="text-4xl font-bold">15+</h3>
                <p className="text-white/80">Awards Won</p>
              </div>
              <div className="space-y-2">
                <TrendingUp className="w-10 h-10 mx-auto opacity-80" />
                <h3 className="text-4xl font-bold">10+</h3>
                <p className="text-white/80">Years Experience</p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 px-4 container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our diverse team of experts is dedicated to guiding you through every step of your real estate journey.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                name: "Mohammed Hussein",
                role: "Co-Founder",
                image: mohammedImg
              },
              {
                name: "Harmand Zahir",
                role: "Co-Founder",
                image: harmandImg
              },
              {
                name: "Bako Abdullah",
                role: "Co-Founder",
                image: bakoImg
              },
              {
                name: "Alan Omed",
                role: "Co-Founder",
                image: alanImg
              },
            ].map((member) => (
              <div key={member.name} className="group relative overflow-hidden rounded-2xl bg-white shadow-lg">
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-white/80">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-display font-bold mb-4">Get in Touch</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Have questions about a property or need assistance? Our team is here to help you every step of the way.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Info */}
              <div className="space-y-8">
                <div className="bg-white rounded-3xl p-8 space-y-8 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-1">Phone</h3>
                      <p className="text-muted-foreground mb-2">Mon-Sat from 9am to 6pm</p>
                      <a href="tel:+9647501234567" className="text-primary font-bold hover:underline">
                        +964 750 123 4567
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-1">Email</h3>
                      <p className="text-muted-foreground mb-2">Our team will respond within 24 hours</p>
                      <a href="mailto:info@moodrealestate.com" className="text-primary font-bold hover:underline">
                        info@moodrealestate.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-1">Office</h3>
                      <p className="text-muted-foreground mb-2">Come visit us at our HQ</p>
                      <address className="not-italic text-foreground">
                        Dream City, Villa 245<br />
                        Erbil, Kurdistan Region<br />
                        Iraq
                      </address>
                    </div>
                  </div>
                </div>

                {/* Map Placeholder */}
                <div className="rounded-3xl overflow-hidden h-64 shadow-lg bg-slate-100 relative group">
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80"
                    alt="Map Location"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button variant="secondary" className="shadow-lg pointer-events-none">
                      View on Google Maps
                    </Button>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white border border-border rounded-3xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <Input required placeholder="John" className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <Input required placeholder="Doe" className="bg-background" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input required type="email" placeholder="john@example.com" className="bg-background" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number (Optional)</label>
                    <Input type="tel" placeholder="+964..." className="bg-background" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      required
                      placeholder="I'm interested in viewing a property..."
                      className="min-h-[150px] bg-background resize-none"
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full h-12 text-lg shadow-lg shadow-primary/20">
                    {loading ? "Sending..." : (
                      <span className="flex items-center gap-2">
                        Send Message <Send className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
