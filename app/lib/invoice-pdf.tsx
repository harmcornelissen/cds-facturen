'use client'

import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Client, CompanyProfile, Invoice } from './data'
import InvoicePDF, { type InvoicePDFType } from '@/app/components/InvoiceDocument'

type DownloadInvoicePdfArgs = {
  company?: CompanyProfile
  client?: Client
  invoice: Invoice
  type?: InvoicePDFType
  recurringInterval?: string
}

const POWERED_BY_TEXT = 'Powered by CDS Facturen'
const POWERED_BY_URL = 'https://cdsfacturen.nl/'
const MOLLIE_CONNECTED_STORAGE_KEY = 'cds_mollie_connected'

export async function downloadInvoicePdf({ company, client, invoice, type = 'factuur', recurringInterval }: DownloadInvoicePdfArgs) {
  if (typeof document === 'undefined') return

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')])
  const mollieConnected = readMollieConnected()
  const idealPaymentUrl = mollieConnected ? resolveIdealPaymentUrl(invoice) : ''
  const wrapper = document.createElement('div')
  wrapper.setAttribute('aria-hidden', 'true')
  wrapper.style.position = 'fixed'
  wrapper.style.left = '-10000px'
  wrapper.style.top = '0'
  wrapper.style.width = '210mm'
  wrapper.style.height = '297mm'
  wrapper.style.background = '#ffffff'
  wrapper.style.pointerEvents = 'none'
  wrapper.style.overflow = 'hidden'
  wrapper.style.zIndex = '-1'
  document.body.appendChild(wrapper)

  const root = createRoot(wrapper)
  const element = createElement(InvoicePDF, {
    company,
    client,
    type,
    recurringInterval,
    invoice: {
      number: invoice.number,
      date: invoice.date,
      dueDate: invoice.dueDate,
      reference: invoice.reference,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      lines: invoice.lines,
      priceInputMode: invoice.priceInputMode,
      paymentMethods: invoice.paymentMethods,
      mollieConnected,
      idealPaymentUrl,
      notes: invoice.notes,
      clientAddress: client?.address,
      clientPostalCode: client?.postalCode,
      clientCity: client?.city,
      clientCountry: client?.country,
    },
    hidePoweredByFooter: true,
  })

  try {
    root.render(element)
    await waitForRender(wrapper)
    await ensureImagesLoaded(wrapper)

    const sheet = wrapper.firstElementChild as HTMLElement | null
    if (!sheet) throw new Error('PDF layout kon niet worden opgebouwd.')

    const canvas = await html2canvas(sheet, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: 794,
      windowHeight: 1123,
    })

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    })

    const imageData = canvas.toDataURL('image/png')
    pdf.addImage(imageData, 'PNG', 0, 0, 210, 297, undefined, 'FAST')
    addPoweredByFooterLink(pdf)
    const filePrefix = type === 'offerte' ? 'Offerte' : 'Factuur'
    pdf.save(`${filePrefix}-${sanitizeFileName(invoice.number)}.pdf`)
  } finally {
    root.unmount()
    wrapper.remove()
  }
}

async function waitForRender(wrapper: HTMLElement) {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
  const sheet = wrapper.firstElementChild as HTMLElement | null
  if (!sheet) return
  await document.fonts.ready
  await Promise.resolve(sheet.getBoundingClientRect())
}

async function ensureImagesLoaded(wrapper: HTMLElement) {
  const images = Array.from(wrapper.querySelectorAll('img'))
  await Promise.all(
    images.map(async (image) => {
      if (image.complete) return
      await new Promise<void>((resolve) => {
        image.onload = () => resolve()
        image.onerror = () => resolve()
      })
    }),
  )
}

function sanitizeFileName(value: string) {
  return value.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '-').trim() || 'factuur'
}

function readMollieConnected() {
  if (typeof window === 'undefined') return false

  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(MOLLIE_CONNECTED_STORAGE_KEY)
  } catch {
    return false
  }
  if (!raw) return false

  try {
    return JSON.parse(raw) === true
  } catch {
    return raw === 'true'
  }
}

function resolveIdealPaymentUrl(invoice: Invoice) {
  const source = invoice as Invoice & {
    idealPaymentUrl?: string
    molliePaymentUrl?: string
    paymentUrl?: string
  }

  return [source.idealPaymentUrl, source.molliePaymentUrl, source.paymentUrl]
    .find((value) => typeof value === 'string' && value.trim().length > 0)
    ?.trim() || ''
}

function addPoweredByFooterLink(pdf: {
  setFillColor: (r: number, g: number, b: number) => unknown
  rect: (x: number, y: number, w: number, h: number, style: string) => unknown
  setFont: (fontName: string, fontStyle?: string) => unknown
  setFontSize: (size: number) => unknown
  setTextColor: (r: number, g: number, b: number) => unknown
  textWithLink: (text: string, x: number, y: number, options: { url: string; align: 'center' }) => unknown
}) {
  pdf.setFillColor(255, 255, 255)
  pdf.rect(0, 286, 210, 11, 'F')
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(107, 114, 128)
  pdf.textWithLink(POWERED_BY_TEXT, 105, 292.5, { url: POWERED_BY_URL, align: 'center' })
}
