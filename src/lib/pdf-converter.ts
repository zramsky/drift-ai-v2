/**
 * PDF to Image Converter
 * Converts PDF pages to base64 images for OpenAI Vision API
 */

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
import { createCanvas } from 'canvas'

// Configure PDF.js for Node.js environment
// Disable worker in Node.js since it's not needed for server-side rendering
if (typeof window === 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = ''
}

export interface PDFConversionResult {
  success: boolean
  images: string[] // Base64 encoded images
  pageCount: number
  error?: string
}

/**
 * Convert PDF to images (base64)
 * @param pdfBuffer - PDF file as Buffer
 * @param maxPages - Maximum number of pages to convert (default: 5 for API limits)
 * @param scale - Rendering scale/quality (default: 2 for high quality)
 */
export async function convertPDFToImages(
  pdfBuffer: Buffer,
  maxPages: number = 5,
  scale: number = 2
): Promise<PDFConversionResult> {
  try {
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer)
    })

    const pdf = await loadingTask.promise
    const pageCount = pdf.numPages
    const pagesToConvert = Math.min(pageCount, maxPages)

    const images: string[] = []

    // Convert each page to image
    for (let pageNum = 1; pageNum <= pagesToConvert; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale })

      // Create canvas
      const canvas = createCanvas(viewport.width, viewport.height)
      const context = canvas.getContext('2d')

      // Render PDF page to canvas
      await page.render({
        canvasContext: context as any,
        viewport: viewport
      }).promise

      // Convert canvas to base64 image
      // Note: node-canvas uses toBuffer() instead of toDataURL()
      const buffer = canvas.toBuffer('image/png')
      const base64Data = buffer.toString('base64')
      images.push(base64Data)
    }

    return {
      success: true,
      images,
      pageCount,
    }
  } catch (error) {
    console.error('PDF conversion error:', error)
    return {
      success: false,
      images: [],
      pageCount: 0,
      error: error instanceof Error ? error.message : 'Failed to convert PDF to images'
    }
  }
}

/**
 * Convert PDF to single image (first page only)
 * Optimized for contract analysis
 */
export async function convertPDFToSingleImage(
  pdfBuffer: Buffer,
  scale: number = 2
): Promise<{ success: boolean; image?: string; error?: string }> {
  const result = await convertPDFToImages(pdfBuffer, 1, scale)

  if (result.success && result.images.length > 0) {
    return {
      success: true,
      image: result.images[0]
    }
  }

  return {
    success: false,
    error: result.error || 'Failed to convert PDF'
  }
}
