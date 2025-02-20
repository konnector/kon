import React, { useState, useEffect } from 'react';
import { Feature, PricingTier } from '../types';
import SignUpPopup from './SignUpPopup';
import SignInPopup from './SignInPopup';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Infinity } from 'lucide-react';
import UserMenu from './ui/UserMenu';

const HomePage = () => {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [userType, setUserType] = useState<'influencer' | 'brand' | null>(null);
  const [user, setUser] = useState<any>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const features: Feature[] = [
    {
      title: "Smart Matching",
      description: "AI-powered matching system that connects you with the perfect brand or influencer",
      icon: "✨"
    },
    {
      title: "Brand Collaboration",
      description: "Easily manage and track your brand deals and sponsorships",
      icon: "🤝"
    },
    {
      title: "Analytics Dashboard",
      description: "Track your campaign performance and ROI in real-time",
      icon: "📊"
    },
    {
      title: "Secure Payments",
      description: "Safe and secure payment processing for all collaborations",
      icon: "💳"
    },
    {
      title: "Contract Management",
      description: "Professional contract templates and e-signing capabilities",
      icon: "📝"
    },
    {
      title: "Communication Hub",
      description: "Built-in messaging and collaboration tools for seamless partnerships",
      icon: "💬"
    }
  ];

  const pricingTiers: PricingTier[] = [
    {
      name: "Starter",
      price: 19,
      features: [
        "5 active campaigns",
        "Basic analytics",
        "Direct messaging",
        "Contract templates",
        "Basic support"
      ]
    },
    {
      name: "Growth",
      price: 49,
      features: [
        "20 active campaigns",
        "Advanced analytics",
        "Priority matching",
        "Custom contracts",
        "Priority support",
        "Campaign management"
      ],
      isPopular: true
    },
    {
      name: "Scale",
      price: 95,
      features: [
        "Unlimited campaigns",
        "Enterprise analytics",
        "VIP matching",
        "Custom branding",
        "Dedicated account manager",
        "API access"
      ]
    }
  ];

  const faqs = [
    {
      question: "What is Konnector and how does it work?",
      answer: "Konnector is an AI-powered platform that connects businesses with the right influencers for marketing campaigns. Brands can find influencers based on niche, audience, and engagement, while influencers get collaboration opportunities."
    },
    {
      question: "How do I sign up as an influencer or a business?",
      answer: "Simply create an account, set up your profile, and connect your social media. Businesses can post campaign needs, while influencers can showcase their content to get discovered."
    },
    {
      question: "How are influencers matched with brands?",
      answer: "Konnector uses AI to match influencers with brands based on niche, audience demographics, engagement, and campaign goals. Brands can also manually browse influencer profiles."
    },
    {
      question: "Is there a fee to use the platform?",
      answer: "Konnector offers a freemium model—basic access is free, while premium features and campaign tools may require a subscription or commission."
    },
    {
      question: "How do payments and collaborations work?",
      answer: "Payments are processed securely through Konnector's escrow system and released once deliverables are met. Brands and influencers can set terms based on fixed fees, performance, or product exchange."
    },
    {
      question: "What types of influencers and brands can join?",
      answer: "Konnector is open to all influencers—micro to macro—across TikTok, YouTube, and Instagram. Businesses from all industries can sign up to run influencer campaigns."
    },
    {
      question: "How do you ensure quality and prevent scams?",
      answer: "We verify influencers and businesses, hold payments securely, and offer dispute resolution. Reviews and ratings help maintain trust within the platform."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm border border-gray-100">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">Konnecter</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#how-it-works" className="text-gray-600 hover:text-black transition-colors">
                How it Works
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-black transition-colors">
                Pricing
              </a>
              <a href="#faq" className="text-gray-600 hover:text-black transition-colors">
                FAQ
              </a>
              {user ? (
                <UserMenu />
              ) : (
                <button 
                  onClick={() => setIsSignInOpen(true)}
                  className="bg-black text-white px-4 py-2 rounded-full text-sm hover:bg-black/90 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-8 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-5 text-[#2d3748] leading-tight">
            Connect With The Perfect<br />Influencer/Brand...
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Connect... Collabrate... Grow...
          </p>
          <div className="flex justify-center gap-3 mb-10">
            <button 
              className="bg-black text-white px-6 py-2 rounded-full text-base font-medium hover:bg-black/90 transition-colors"
              onClick={async () => {
                if (user) {
                  // If user is logged in, check their onboarding status
                  const { data: profile } = await supabase
                    .from('influencer_profiles')
                    .select('onboarding_completed')
                    .eq('id', user.id)
                    .single();
                  
                  if (profile?.onboarding_completed) {
                    router.push('/dashboard/influencer');
                  } else {
                    router.push('/onboarding');
                  }
                } else {
                  setUserType('influencer');
                  setIsSignUpOpen(true);
                }
              }}
            >
              I am an Influencer →
            </button>
            <button 
              className="bg-black text-white px-6 py-2 rounded-full text-base font-medium border border-gray-200 hover:bg-black/90 transition-colors"
              onClick={async () => {
                if (user) {
                  // If user is logged in, check their onboarding status
                  const { data: profile } = await supabase
                    .from('business_profiles')
                    .select('onboarding_completed')
                    .eq('id', user.id)
                    .single();
                  
                  if (profile?.onboarding_completed) {
                    router.push('/dashboard/business');
                  } else {
                    router.push('/onboarding');
                  }
                } else {
                  setUserType('brand');
                  setIsSignUpOpen(true);
                }
              }}
            >
              I am a Brand/Business →
            </button>
          </div>

          {/* Infinite Loop Animation */}
          <div className="relative mt-10 overflow-hidden max-w-4xl mx-auto">
            {/* Left gradient overlay */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10"></div>
            {/* Right gradient overlay */}
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10"></div>
            
            <div className="flex space-x-3 animate-infinite-scroll px-2">
              {/* First set of images */}
              <div className="flex-none w-32 h-[260px] rounded-xl overflow-hidden">
                <Image 
                  src="/images/tiktok-thumbnail.png"
                  alt="TikTok Thumbnail"
                  width={128}
                  height={260}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              <div className="flex-none w-32 h-[260px] rounded-xl overflow-hidden">
                <Image 
                  src="/images/fdsfsdf.png"
                  alt="Creator Content"
                  width={128}
                  height={260}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              <div className="flex-none w-32 h-[260px] rounded-xl overflow-hidden">
                <Image 
                  src="/images/gguqwenlk.png"
                  alt="Social Media"
                  width={128}
                  height={260}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              <div className="flex-none w-32 h-[260px] rounded-xl overflow-hidden">
                <Image 
                  src="/images/gvhbjkwe.jpg"
                  alt="Content Creator"
                  width={128}
                  height={260}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              <div className="flex-none w-32 h-[260px] rounded-xl overflow-hidden">
                <Image 
                  src="/images/ddc1f1fdb9f34179b72eb0e29ccf7556_1688864558.jpg"
                  alt="Influencer"
                  width={128}
                  height={260}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>

              {/* Duplicate set for seamless loop */}
              <div className="flex-none w-32 h-[260px] rounded-xl overflow-hidden">
                <Image 
                  src="/images/tiktok-thumbnail.png"
                  alt="TikTok Thumbnail"
                  width={128}
                  height={260}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              <div className="flex-none w-32 h-[260px] rounded-xl overflow-hidden">
                <Image 
                  src="/images/fdsfsdf.png"
                  alt="Creator Content"
                  width={128}
                  height={260}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              <div className="flex-none w-32 h-[260px] rounded-xl overflow-hidden">
                <Image 
                  src="/images/gguqwenlk.png"
                  alt="Social Media"
                  width={128}
                  height={260}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              <div className="flex-none w-32 h-[260px] rounded-xl overflow-hidden">
                <Image 
                  src="/images/gvhbjkwe.jpg"
                  alt="Content Creator"
                  width={128}
                  height={260}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              <div className="flex-none w-32 h-[260px] rounded-xl overflow-hidden">
                <Image 
                  src="/images/ddc1f1fdb9f34179b72eb0e29ccf7556_1688864558.jpg"
                  alt="Influencer"
                  width={128}
                  height={260}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add the animation keyframes */}
      <style jsx global>{`
        @keyframes infinite-scroll {
          from {
            transform: translateX(-0%);
          }
          to {
            transform: translateX(-100%);
          }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 10s linear infinite;
        }
      `}</style>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-16 px-4 bg-gray-50 scroll-mt-20">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">How it Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 scroll-mt-20">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">Choose your plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <div 
                key={index} 
                className={`
                  p-6 rounded-2xl border 
                  ${tier.isPopular 
                    ? 'border-2 border-black shadow-lg' 
                    : 'border-gray-300'
                  }
                `}
              >
                {tier.isPopular && (
                  <span className="bg-black/5 text-black px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold mt-4">{tier.name}</h3>
                <div className="text-4xl font-bold my-4">
                  ${tier.price}<span className="text-xl text-gray-500">/mo</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => setIsSignInOpen(true)}
                  className={`
                    w-full py-3 rounded-full font-medium transition-colors
                    bg-black text-white hover:bg-black/90
                  `}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-4 bg-white scroll-mt-20">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold text-center mb-12">FAQs</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openFaqIndex === index ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PlusIcon className="w-5 h-5 flex-shrink-0 text-gray-500" />
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: openFaqIndex === index ? "auto" : 0,
                    opacity: openFaqIndex === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 text-gray-600">
                    {faq.answer}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Have more questions?{' '}
              <Link href="/contact" className="text-black underline">
                Contact Us
              </Link>
            </p>
            <Link
              href="/signup"
              className="inline-block mt-6 px-6 py-3 bg-black text-white rounded-full hover:bg-black/90 transition-colors"
            >
              Get Started →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 border-t border-gray-100">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center space-x-2">
                <span className="font-bold text-xl">Konnecter</span>
              </Link>
              <p className="mt-2 text-sm text-gray-600">
                © 2025 Konnecter, Irvine, CA
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Company</h3>
              <ul className="space-y-3">
                <li><Link href="/careers" className="text-gray-600 hover:text-black">Careers</Link></li>
                <li><Link href="/ethos" className="text-gray-600 hover:text-black">Ethos</Link></li>
                <li><Link href="/help" className="text-gray-600 hover:text-black">Help</Link></li>
                <li><Link href="/status" className="text-gray-600 hover:text-black">Status</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Contact</h3>
              <ul className="space-y-3">
                <li><Link href="/contact" className="text-gray-600 hover:text-black">Contact Us</Link></li>
                <li><Link href="/signup" className="text-gray-600 hover:text-black">Sign Up</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><Link href="/terms" className="text-gray-600 hover:text-black">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-gray-600 hover:text-black">Privacy Policy</Link></li>
                <li><Link href="/acts" className="text-gray-600 hover:text-black">Acts Notices</Link></li>
                <li><Link href="/labs" className="text-gray-600 hover:text-black">Labs</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      <SignUpPopup
        isOpen={isSignUpOpen}
        onClose={() => {
          setIsSignUpOpen(false);
          setUserType(null);
        }}
        userType={userType}
      />
      <SignInPopup
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
      />

      {/* Add smooth scrolling behavior to html */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default HomePage; 