
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Star } from 'lucide-react';

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      quote: "Ruzma has completely transformed how we approach recruitment. The AI insights are incredibly accurate, and we've reduced our time-to-hire by 70%. It's like having a senior recruiter working 24/7.",
      name: "Jennifer Walsh",
      role: "VP of Talent Acquisition",
      company: "TechGlobal Solutions",
      avatar: "JW",
      rating: 5
    },
    {
      quote: "The candidate matching is phenomenal. We used to spend days reviewing resumes, now Ruzma presents us with pre-qualified candidates that are perfect fits. Our hiring quality has improved dramatically.",
      name: "David Park",
      role: "Head of HR",
      company: "InnovateFlow",
      avatar: "DP",
      rating: 5
    },
    {
      quote: "As a startup, we needed to hire fast without compromising quality. Ruzma helped us build our entire engineering team in 2 months. The automated screening saved us countless hours.",
      name: "Maria Santos",
      role: "Co-founder & COO",
      company: "NextGen Startup",
      avatar: "MS",
      rating: 5
    },
    {
      quote: "The bias-free hiring approach of Ruzma has helped us create a more diverse team. The AI focuses purely on skills and qualifications, which aligns perfectly with our inclusive hiring goals.",
      name: "Robert Kim",
      role: "Diversity & Inclusion Director",
      company: "Global Enterprise Corp",
      avatar: "RK",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what recruiting professionals say about Ruzma.
          </p>
        </div>
        
        <Carousel className="max-w-5xl mx-auto">
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2">
                <Card className="bg-gradient-to-br from-yellow-50 to-white rounded-2xl shadow-lg border border-yellow-100 h-full">
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 flex-grow italic">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mr-4">
                        <span className="text-white font-bold">
                          {testimonial.avatar}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                        <div className="text-sm text-gray-500">{testimonial.company}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};

export default TestimonialsSection;
