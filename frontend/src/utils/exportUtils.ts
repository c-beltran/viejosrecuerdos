import * as XLSX from 'xlsx'
import { InventoryItem } from '@/types'

export interface ExportableInventoryItem {
  'Friendly ID': string
  'Item Name': string
  'Description': string
  'Category': string
  'Initial Quantity': number
  'Current Quantity': number
  'Unit Price': number
  'Total Price': number
  'Status': string
  'Internal Notes': string
}

/**
 * Converts an InventoryItem to an exportable format (excluding images)
 */
export function convertToExportableFormat(item: InventoryItem): ExportableInventoryItem {
  return {
    'Friendly ID': item.friendlyId,
    'Item Name': item.itemName,
    'Description': item.descripcionArticulo || '',
    'Category': item.category,
    'Initial Quantity': item.initialQuantity,
    'Current Quantity': item.currentQuantity,
    'Unit Price': item.unitPrice,
    'Total Price': item.totalPrice,
    'Status': item.status,
    'Internal Notes': item.internalNotes || ''
  }
}

/**
 * Exports inventory data to Excel file
 */
export function exportInventoryToExcel(
  items: InventoryItem[], 
  filename: string = 'inventory-export'
): void {
  try {
    // Convert items to exportable format
    const exportableData = items.map(convertToExportableFormat)
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(exportableData)
    
    // Auto-size columns
    const columnWidths = [
      { wch: 12 }, // Friendly ID
      { wch: 30 }, // Item Name
      { wch: 40 }, // Description
      { wch: 15 }, // Category
      { wch: 15 }, // Initial Quantity
      { wch: 15 }, // Current Quantity
      { wch: 12 }, // Unit Price
      { wch: 12 }, // Total Price
      { wch: 12 }, // Status
      { wch: 40 }  // Internal Notes
    ]
    
    worksheet['!cols'] = columnWidths
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory')
    
    // Generate filename with timestamp
    const currentDate = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const fullFilename = `${filename}-${currentDate}.xlsx`
    
    // Save file
    XLSX.writeFile(workbook, fullFilename)
    
    console.log(`Inventory exported successfully to ${fullFilename}`)
  } catch (error) {
    console.error('Error exporting inventory to Excel:', error)
    throw new Error('Failed to export inventory data')
  }
}

/**
 * Exports filtered inventory data to Excel file
 */
export function exportFilteredInventoryToExcel(
  items: InventoryItem[],
  filters: any,
  filename: string = 'inventory-filtered-export'
): void {
  try {
    // Convert items to exportable format
    const exportableData = items.map(convertToExportableFormat)
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(exportableData)
    
    // Auto-size columns
    const columnWidths = [
      { wch: 12 }, // Friendly ID
      { wch: 30 }, // Item Name
      { wch: 40 }, // Description
      { wch: 15 }, // Category
      { wch: 15 }, // Initial Quantity
      { wch: 15 }, // Current Quantity
      { wch: 12 }, // Unit Price
      { wch: 12 }, // Total Price
      { wch: 12 }, // Status
      { wch: 40 }  // Internal Notes
    ]
    
    worksheet['!cols'] = columnWidths
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Filtered Inventory')
    
    // Generate filename with timestamp and filter info
    const currentDate = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
    let filterSuffix = ''
    
    if (filters.category) filterSuffix += `-${filters.category}`
    if (filters.status) filterSuffix += `-${filters.status}`
    if (filters.search) filterSuffix += `-search`
    
    const fullFilename = `${filename}${filterSuffix}-${currentDate}.xlsx`
    
    // Save file
    XLSX.writeFile(workbook, fullFilename)
    
    console.log(`Filtered inventory exported successfully to ${fullFilename}`)
  } catch (error) {
    console.error('Error exporting filtered inventory to Excel:', error)
    throw new Error('Failed to export filtered inventory data')
  }
} 