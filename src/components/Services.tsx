import { MessageSquare, Home, Building2, Leaf, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Services = () => {
  const services = [
    {
      icon: <MessageSquare className="w-12 h-12 text-primary" />, // Consultancy
      title: "Free Real Estate Consultancy",
      description: "Do you have any questions you would like to ask? We are always happy to offer you advice, help you and answer all your questions for free.",
    },
    {
      icon: <Home className="w-12 h-12 text-primary" />, // Residential
      title: "Selling, Buying and Renting Properties", // Shortened slightly for layout
      description: "Do you want to buy or sell a property?! Looking for a property with custom specifications in Erbil to rent it?! You have come to the right place!",
    },
    {
      icon: <Building2 className="w-12 h-12 text-primary" />, // Commercial
      title: "Commercial Properties Services",
      description: "Our team of brokerage professionals provides you with innovative solutions. Contact us and tell us more about your requirements and needs.",
    },
    {
      icon: <Leaf className="w-12 h-12 text-primary" />, // Agricultural
      title: "Farms and Agricultural Lands",
      description: "If you are a farmer, landowner or an investor planning to buy or sell, you can contact us or visit us to discuss the issues that concern you.",
    },
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            OUR SERVICES
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-soft hover:shadow-hover transition-all duration-300 flex flex-col items-center text-center group border border-border/50"
            >
              {/* Icon Container with subtle animation */}
              <div className="mb-6 p-4 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300">
                {service.icon}
              </div>
              
              <h3 className="text-lg font-bold mb-4 text-foreground line-clamp-2 h-14 flex items-center">
                {service.title}
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
