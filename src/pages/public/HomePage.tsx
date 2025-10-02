import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Wrench, ShoppingBag, Users, TrendingUp, CheckCircle, Shield } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: ShoppingBag,
      title: 'Quality Parts',
      description: 'Browse thousands of genuine auto parts from verified vendors',
    },
    {
      icon: Wrench,
      title: 'Expert Mechanics',
      description: 'Connect with certified mechanics in your area for repairs',
    },
    {
      icon: Users,
      title: 'Smart Matching',
      description: 'AI-powered system matches you with the nearest available mechanic',
    },
    {
      icon: TrendingUp,
      title: 'Competitive Pricing',
      description: 'Compare prices from multiple vendors to get the best deal',
    },
  ];

  const benefits = [
    'Instant mechanic assignment based on your location',
    'Transparent pricing with no hidden fees',
    'Real-time service tracking and updates',
    'Secure payment processing',
    'Quality parts from verified vendors',
    'Customer reviews and ratings',
  ];

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Complete Auto Service Solution
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Find parts, book mechanics, and get your vehicle serviced all in one place
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate('/products')}
                className="text-lg"
              >
                Browse Parts
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/services')}
                className="text-lg bg-transparent text-white border-white hover:bg-white hover:text-blue-600"
              >
                Request Service
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose AutoServe?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                How It Works
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Submit Your Request
                    </h3>
                    <p className="text-gray-600">
                      Describe your vehicle issue or browse our parts catalog
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Get Matched
                    </h3>
                    <p className="text-gray-600">
                      Our system finds the nearest available mechanic for your needs
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Get Service
                    </h3>
                    <p className="text-gray-600">
                      Mechanic inspects, recommends parts, and completes the repair
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Platform Benefits</h3>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Parts Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Certified Mechanics</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50,000+</div>
              <div className="text-blue-100">Services Completed</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of satisfied customers who trust AutoServe for their vehicle needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/register')}>
              Create Free Account
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/products')}>
              Explore Products
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
