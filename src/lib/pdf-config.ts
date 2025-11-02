import { pdfjs } from 'react-pdf'

// Configure PDF.js worker - this needs to be done once in the app
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`
}

export { pdfjs }