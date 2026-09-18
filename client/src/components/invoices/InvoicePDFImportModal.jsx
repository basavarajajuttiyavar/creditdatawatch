import PropTypes from 'prop-types'
import { salesInvoices } from '../../services/api/apiClient'
import PDFImportModal from '../shared/PDFImportModal'

/**
 * Upload -> scan flow for filling the main Add Invoice form from a PDF.
 * Thin wrapper around the shared PDFImportModal — see that file for the
 * actual upload/scan behavior. Points it at the sales-invoice scan
 * endpoint and supplies this form's copy/labels.
 */
export default function InvoicePDFImportModal({ onClose, onScanned, initialFile }) {
  return (
    <PDFImportModal
      onClose={onClose}
      onScanned={onScanned}
      initialFile={initialFile}
      scanPdf={salesInvoices.scanPdf}
      title="Import Invoice from PDF"
      subtitle="Upload a Tax Invoice PDF — we'll read it and fill in the Add Invoice form for you to review."
      fieldId="invoice-scan-file"
      fieldLabel="Select Invoice PDF"
      dropText="Click or drag a PDF or photo to import"
    />
  )
}

InvoicePDFImportModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onScanned: PropTypes.func,
  initialFile: PropTypes.object,
}
