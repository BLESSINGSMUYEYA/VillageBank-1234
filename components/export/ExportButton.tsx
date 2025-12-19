'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, Table, FileSpreadsheet, Loader2 } from 'lucide-react'
import { DataExporter, ExportData } from '@/lib/export'

interface ExportButtonProps {
  data: any[]
  type: 'contributions' | 'loans' | 'groups' | 'activities'
  title: string
  dateRange?: string
  disabled?: boolean
  elementId?: string // For PDF export
}

export function ExportButton({ 
  data, 
  type, 
  title, 
  dateRange, 
  disabled = false,
  elementId 
}: ExportButtonProps) {
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'pdf'>('excel')
  const [isExporting, setIsExporting] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)

  const handleExport = async () => {
    if (!data || data.length === 0) {
      alert('No data available to export')
      return
    }

    setIsExporting(true)
    try {
      const exportData: ExportData = {
        type,
        data,
        title: title.replace(/\s+/g, '_'),
        dateRange
      }

      const timestamp = new Date().toISOString().split('T')[0]
      let filename = `${exportData.title}_${timestamp}`

      switch (exportFormat) {
        case 'excel':
          filename += '.xlsx'
          DataExporter.exportToExcel(exportData, filename)
          break
        case 'csv':
          filename += '.csv'
          DataExporter.exportToCSV(exportData, filename)
          break
        case 'pdf':
          if (!elementId) {
            alert('PDF export requires an element ID')
            return
          }
          filename += '.pdf'
          await DataExporter.exportToPDF(elementId, filename)
          break
      }

      setShowExportDialog(false)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const getExportIcon = (format: string) => {
    switch (format) {
      case 'excel':
        return <FileSpreadsheet className="w-4 h-4" />
      case 'csv':
        return <Table className="w-4 h-4" />
      case 'pdf':
        return <FileText className="w-4 h-4" />
      default:
        return <Download className="w-4 h-4" />
    }
  }

  const getFormatDescription = (format: string) => {
    switch (format) {
      case 'excel':
        return 'Microsoft Excel format with full data and formatting'
      case 'csv':
        return 'Comma-separated values format for data analysis'
      case 'pdf':
        return 'PDF document for printing and sharing'
      default:
        return ''
    }
  }

  const summaryStats = DataExporter.generateSummaryStats(data, type)

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowExportDialog(true)}
        disabled={disabled || !data || data.length === 0}
      >
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>

      {showExportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>
                Choose the format for exporting {data.length} {type}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary Stats */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Summary Statistics</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(summaryStats).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="font-medium">
                        {typeof value === 'number' && value > 1000 
                          ? value.toLocaleString() 
                          : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Format Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Export Format</label>
                <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excel">
                      <div className="flex items-center space-x-2">
                        <FileSpreadsheet className="w-4 h-4" />
                        <div>
                          <div className="font-medium">Excel</div>
                          <div className="text-xs text-gray-500">Full data with formatting</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="csv">
                      <div className="flex items-center space-x-2">
                        <Table className="w-4 h-4" />
                        <div>
                          <div className="font-medium">CSV</div>
                          <div className="text-xs text-gray-500">Data analysis ready</div>
                        </div>
                      </div>
                    </SelectItem>
                    {elementId && (
                      <SelectItem value="pdf">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4" />
                          <div>
                            <div className="font-medium">PDF</div>
                            <div className="text-xs text-gray-500">Printable document</div>
                          </div>
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Format Description */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-800">
                  {getFormatDescription(exportFormat)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowExportDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex-1"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      {getExportIcon(exportFormat)}
                      <span className="ml-2">Export {exportFormat.toUpperCase()}</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
