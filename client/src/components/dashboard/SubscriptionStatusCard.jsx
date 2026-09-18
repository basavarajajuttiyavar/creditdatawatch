import { Link } from 'react-router-dom'
import { getExpiryDisplay } from '../../utils/dashboardDisplay'

/**
 * Shared "Subscription Status" card used on both the Purchase Order
 * dashboard and the Invoice dashboard. Previously duplicated verbatim
 * in Dashboard.jsx and InvoiceDashboard.jsx.
 */
export default function SubscriptionStatusCard({ planLabel, planStatus, subscription }) {
  const expiry = getExpiryDisplay(subscription)

  return (
    <div className="bg-white rounded-[20px] border border-[#E2E8F0] p-6 shadow-[0_4px_24px_rgba(30,58,138,0.08)]">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#0F172A]">Subscription Status</h3>
          <p className="text-[#475569] text-xs">Your current platform plan</p>
        </div>
        <div className="bg-[#EFF6FF] p-2 rounded-lg">💎</div>
      </div>
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[#475569] font-semibold">{planLabel}</span>
          <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${planStatus === 'Active' ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#DC2626]'}`}>
            {planStatus}
          </span>
        </div>
        <div className="w-full h-3 bg-[#F0F4FF] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1E3A8A] rounded-full transition-all duration-500"
            style={{ width: `${expiry.percent}%` }}
          />
        </div>
        <p className={`text-[11px] mt-2 ${expiry.color}`}>
          {expiry.text}
        </p>
      </div>
      <Link to="/membership" className="mt-6 block text-center hover:opacity-90 py-3 rounded-[12px] text-[#0F172A] text-sm font-bold transition-all shadow-md" style={{background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'}}>
        Upgrade Plan
      </Link>
    </div>
  )
}
