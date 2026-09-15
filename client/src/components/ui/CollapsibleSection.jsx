import { useState } from 'react'
import PropTypes from 'prop-types'

/**
 * Shared expand/collapse wrapper. Originally built for the Services page
 * (Report Overdue Payer, Credit Management, Partners Credit Overdue
 * Report, Finalization Steps) and now reused on Solutions so both pages
 * follow the same click-to-expand interaction pattern.
 */
export default function CollapsibleSection({ id, icon, title, defaultOpen = false, bg = 'bg-white', children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section id={id} className={`py-8 px-4 ${bg} border-b border-gray-200`}>
      <div className="max-w-5xl mx-auto">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="w-full flex items-center justify-between gap-3 text-left"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>{title}</h2>
              <div style={{ width: '48px', height: '3px', backgroundColor: '#F59E0B', marginTop: '4px' }}></div>
            </div>
          </div>
          <span className="text-2xl font-bold text-blue-600 flex-shrink-0">{open ? '−' : '+'}</span>
        </button>
        {open && <div className="mt-6">{children}</div>}
      </div>
    </section>
  )
}

CollapsibleSection.propTypes = {
  id: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  defaultOpen: PropTypes.bool,
  bg: PropTypes.string,
  children: PropTypes.node.isRequired
}
