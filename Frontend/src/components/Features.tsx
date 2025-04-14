
import React, { useEffect, useRef } from 'react';
import { ArrowLeftRight, Columns, Database, FileText } from 'lucide-react';

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  delay = 0 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  delay?: number;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            cardRef.current?.classList.add('opacity-100', 'translate-y-0');
            cardRef.current?.classList.remove('opacity-0', 'translate-y-4');
          }, delay);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [delay]);

  return (
    <div 
      ref={cardRef} 
      className="feature-card opacity-0 translate-y-4 transition-all duration-500 dark:bg-pipeman-deep-blue/30 dark:text-white"
    >
      <Icon className="w-12 h-12 text-pipeman-teal mb-4" />
      <h3 className="text-xl font-semibold text-pipeman-deep-blue dark:text-white mb-2">{title}</h3>
      <p className="text-pipeman-grey dark:text-gray-300">{description}</p>
    </div>
  );
};

const Features = () => {
  return (
    <section className="py-20 bg-white dark:bg-pipeman-deep-blue/80">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-pipeman-deep-blue dark:text-white">
          Powerful Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={ArrowLeftRight}
            title="Bidirectional Flow"
            description="Move data in either direction between ClickHouse and Flat Files with the same intuitive interface."
            delay={0}
          />
          
          <FeatureCard
            icon={Columns}
            title="Column Selection"
            description="Choose exactly which columns to include in your data transfer for precision control."
            delay={200}
          />
          
          <FeatureCard
            icon={Database}
            title="ClickHouse Integration"
            description="Native support for ClickHouse databases with secure JWT authentication."
            delay={400}
          />
          
          <FeatureCard
            icon={FileText}
            title="Flexible File Formats"
            description="Support for CSV, TSV, and other delimited file formats with custom delimiter options."
            delay={600}
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
