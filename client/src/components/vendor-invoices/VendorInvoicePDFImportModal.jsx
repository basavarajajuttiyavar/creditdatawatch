import PropTypes from 'prop-types'
import { vendorInvoices } from '../../services/api/apiClient'
import PDFImportModal from '../shared/PDFImportModal'

/**
 * Upload -> scan flow for filling the Add Vendor Invoice form from a
 * vendor's own PDF. Thin wrapper around the shared PDFImportModal —
 * mirrors InvoicePDFImportModal.jsx exactly, pointed at the
 * vendor-invoices scan endpoint instead.
 */
export default function VendorInvoicePDFImportModal({ onClose, onScanned, initialFile }) {
  return (
    <PDFImportModal
      onClose={onClose}
      onScanned={onScanned}
      initialFile={initialFile}
      scanPdf={vendorInvoices.scanPdf}
      title="Import Vendor Bill from PDF"
      subtitle="Upload the invoice your vendor sent you — we'll read it and fill in the Add Vendor Invoice form for you to review."
      fieldId="vendor-invoice-scan-file"
      fieldLabel="Select the Vendor's Invoice PDF"
      dropText="Click or drag the vendor's PDF or photo to import"
    />
  )
}

VendorInvoicePDFImportModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onScanned: PropTypes.func,
  initialFile: PropTypes.object,
}
