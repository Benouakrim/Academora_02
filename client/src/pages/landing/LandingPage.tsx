import HeroSection from './HeroSection'
import FeatureShowcase from './FeatureShowcase'
import SocialProofSection from './SocialProofSection'
import BenefitsSection from './BenefitsSection'
import ProblemSolutionSection from './ProblemSolutionSection'
import ProductDemoSection from './ProductDemoSection'
import InteractiveCalculatorSection from './InteractiveCalculatorSection'
import SecondaryCTASection from './SecondaryCTASection'
import FAQSection from './FAQSection'
import RiskReversalSection from './RiskReversalSection'
import FooterSection from './FooterSection'

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section - Above the fold */}
      <HeroSection />

      {/* Core Features - What we offer */}
      <FeatureShowcase />

      {/* Social Proof - Trust & validation */}
      <SocialProofSection />

      {/* Benefits - Why choose us */}
      <BenefitsSection />

      {/* Problem & Solution - Pain points addressed */}
      <ProblemSolutionSection />

      {/* Product Demo - How it works */}
      <ProductDemoSection />

      {/* Interactive Calculator - Engagement & ROI demonstration */}
      <InteractiveCalculatorSection />

      {/* Secondary CTA - Additional conversion points */}
      <SecondaryCTASection />

      {/* FAQ - Objection handling */}
      <FAQSection />

      {/* Risk Reversal - Guarantees & trust */}
      <RiskReversalSection />

      {/* Footer - Trust reinforcers & legal */}
      <FooterSection />
    </div>
  )
}
