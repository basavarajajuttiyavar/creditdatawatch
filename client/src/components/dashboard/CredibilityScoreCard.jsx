import { Link } from 'react-router-dom'

/**
 * Shared "Company Credibility Score" card used on both the Purchase
 * Order dashboard and the Invoice dashboard. Previously duplicated
 * verbatim (aside from the link target and subtitle) in Dashboard.jsx
 * and InvoiceDashboard.jsx.
 */
export default function CredibilityScoreCard({ to, subtitle }) {
  return (
    <div style={{background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #3B82F6 100%)'}} className="rounded-[20px] p-6 text-white shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Company Credibility Score</h3>
          <p className="text-blue-200 text-xs">{subtitle}</p>
        </div>
        <div className="bg-white/20 p-2 rounded-lg">📊</div>
      </div>
      <div className="flex items-center gap-6 mt-6">
        <div className="text-6xl font-black text-white">82</div>
        <div>
          <div className="bg-[#F59E0B] text-[#0F172A] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">A Grade</div>
          <div className="text-sm mt-2 text-blue-200">Risk Level: <span className="text-white font-bold">Low</span></div>
        </div>
      </div>
      <Link to={to} className="mt-6 block text-center bg-white text-[#1E3A8A] hover:bg-[#EFF6FF] py-3 rounded-xl text-sm font-bold transition-all">
        View Full Analysis →
      </Link>
    </div>
  )
}
