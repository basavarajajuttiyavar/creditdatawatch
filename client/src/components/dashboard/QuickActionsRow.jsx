import QuickActions from './QuickActions'

/**
 * Shared "Quick Actions" block used on both the Purchase Order dashboard
 * and the Invoice dashboard. Previously duplicated verbatim in
 * Dashboard.jsx and InvoiceDashboard.jsx.
 */
export default function QuickActionsRow({ context, onCheckSafety, onSupportRequest }) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-bold text-[#0F172A] uppercase tracking-wide mb-3">Quick Actions</h2>
      <div className="flex flex-wrap gap-4">
        <QuickActions context={context} />
        <button
          onClick={onCheckSafety}
          className="flex items-center gap-3 px-5 py-4 rounded-[12px] border border-[#E2E8F0] bg-white hover:bg-[#EFF6FF] hover:border-[#3B82F6] transition-all duration-200 group"
        >
          <span className="text-2xl group-hover:text-[#3B82F6] transition-colors">🔍</span>
          <span className="text-base font-semibold text-[#0F172A] group-hover:text-[#1E3A8A]">Check Company Safety</span>
        </button>
        <button
          onClick={onSupportRequest}
          className="flex items-center gap-3 px-5 py-4 rounded-[12px] border border-[#E2E8F0] bg-white hover:bg-[#EFF6FF] hover:border-[#3B82F6] transition-all duration-200 group"
        >
          <span className="text-2xl group-hover:text-[#3B82F6] transition-colors">📋</span>
          <span className="text-base font-semibold text-[#0F172A] group-hover:text-[#1E3A8A]">Support Request</span>
        </button>
      </div>
    </div>
  )
}
