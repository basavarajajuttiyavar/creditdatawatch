import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PricingTable from '../components/common/PricingTable'
import { subscriptions } from '../services/api/apiClient'

// Fallback only — used if the API call fails or briefly while loading,
// so the page never shows blank. Once a Master Admin edits plans via
// /admin/manage-plans, the real data below (fetched at render time)
// takes over and this hardcoded copy is never actually shown for a
// working page load.
const DEFAULT_CONTENT = {
  title: "Our Offerings",
  subtitle: "Scalable solutions for every stage of growth",
  plans: [
    {
      name: "Base",
      price: "₹500",
      description: "Entry-level plan for small businesses.",
      features: [
        "Validity: 1 Month",
        "Legal Assistance: NO",
        "Reminder Follow-ups: Yes",
        "CIR Generation Fee: Included"
      ]
    },
    {
      name: "Royal",
      price: "₹1,000",
      description: "For growing businesses.",
      features: [
        "Validity: 6 Months",
        "Legal Assistance: 5 Incidents",
        "Reminder Follow-ups: Yes",
        "CIR Generation Fee: Included"
      ]
    },
    {
      name: "Groups",
      price: "₹2,000",
      description: "For organizations with multiple entities.",
      features: [
        "Validity: 1 Year",
        "Legal Assistance: 20 Incidents",
        "Reminder Follow-ups: Yes",
        "CIR Generation Fee: Included"
      ]
    },
    {
      name: "Enterprise",
      price: "₹1,00,000",
      description: "Maximum protection and support.",
      featured: true,
      features: [
        "Validity: 1 Year",
        "Legal Assistance: 100 Incidents",
        "Reminder Follow-ups: Yes",
        "CIR Generation Fee: Included"
      ]
    }
  ]
}

// Plans can have any validity_days a Master Admin sets now (not just
// the original fixed 30/180/365), so this picks whichever unit reads
// most naturally instead of assuming one of three fixed values.
function formatValidity(days) {
  if (days % 365 === 0) {
    const years = days / 365
    return `Validity: ${years} Year${years > 1 ? 's' : ''}`
  }
  if (days % 30 === 0) {
    const months = days / 30
    return `Validity: ${months} Month${months > 1 ? 's' : ''}`
  }
  return `Validity: ${days} Day${days > 1 ? 's' : ''}`
}

function apiPlansToContent(apiPlans) {
  return {
    title: DEFAULT_CONTENT.title,
    subtitle: DEFAULT_CONTENT.subtitle,
    plans: apiPlans.map((p, idx) => ({
      name: p.display_name,
      price: `₹${Number(p.price).toLocaleString('en-IN')}`,
      description: p.description || '',
      // Backend already returns plans price-ascending — mark the most
      // expensive one as the highlighted card, matching how Enterprise
      // was the one hardcoded as featured before.
      featured: idx === apiPlans.length - 1 && apiPlans.length > 1,
      features: [
        formatValidity(p.validity_days),
        p.features?.legal_assistance_limit > 0
          ? `Legal Assistance: ${p.features.legal_assistance_limit} Incidents`
          : 'Legal Assistance: NO',
        p.features?.follow_up_limit > 0 ? 'Reminder Follow-ups: Yes' : 'Reminder Follow-ups: NO',
        'CIR Generation Fee: Included',
      ],
    })),
  }
}

export default function Offerings() {
  const [content, setContent] = useState(DEFAULT_CONTENT)

  useEffect(() => {
    let cancelled = false
    subscriptions.getPlans().then((res) => {
      if (cancelled) return
      const apiPlans = res.ok ? (res.data?.data || res.data || []) : []
      if (apiPlans.length > 0) {
        setContent(apiPlansToContent(apiPlans))
      }
      // else: keep showing DEFAULT_CONTENT rather than an empty page
    }).catch(() => {
      // Network error — keep showing DEFAULT_CONTENT
    })
    return () => { cancelled = true }
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#F0F4FF]">
      {/* Navy Gradient Header */}
      <section 
        className="py-20 px-4 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #1D4ED8 100%)'
        }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Our Offerings
        </h1>
        {/* Gold Underline */}
        <div 
          className="mx-auto mb-4"
          style={{ width: '48px', height: '3px', backgroundColor: '#F59E0B' }}
        ></div>
        <p className="text-[#93C5FD] text-lg max-w-3xl mx-auto">
          Scalable solutions for every stage of growth
        </p>
      </section>

      {/* Offerings Hero */}
      <section className="py-12 px-4 bg-[#EFF6FF] relative overflow-hidden">
        {/* Dot Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, #1E3A8A 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#0F172A] mb-4">
            Choose the right plan for your business
          </h2>
          <p className="text-[#475569] text-lg">
            From small businesses to large enterprises, we have the perfect plan for you
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4">
        <PricingTable content={content} />
      </section>

      {/* Note: this page used to have its own bottom CTA ("Ready to protect
          your business?" -> Get Started Now) here. It was removed because
          MainLayout already renders a global CTASection right after every
          page's content, which was producing two near-identical CTA blocks
          stacked back to back on this page. */}
    </motion.div>
  )
}
