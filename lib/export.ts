import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'

export interface ExportData {
  type: 'contributions' | 'loans' | 'groups' | 'activities'
  data: any[]
  title: string
  dateRange?: string
}

export class DataExporter {
  // Export to PDF
  static async exportToPDF(elementId: string, filename: string): Promise<void> {
    try {
      const element = document.getElementById(elementId)
      if (!element) {
        throw new Error('Element not found')
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(filename)
    } catch (error) {
      console.error('PDF export failed:', error)
      throw new Error('Failed to export PDF')
    }
  }

  // Export to Excel
  static exportToExcel(exportData: ExportData, filename: string): void {
    try {
      const wb = XLSX.utils.book_new()

      // Prepare data based on type
      let worksheetData: any[] = []

      switch (exportData.type) {
        case 'contributions':
          worksheetData = exportData.data.map(contrib => ({
            'Date': new Date(contrib.createdAt).toLocaleDateString(),
            'Group': contrib.group?.name || 'Unknown',
            'Amount': Number(contrib.amount),
            'Payment Method': contrib.paymentMethod,
            'Status': contrib.status,
            'Transaction Ref': contrib.transactionRef || 'N/A',
            'Month': contrib.month,
            'Year': contrib.year
          }))
          break

        case 'loans':
          worksheetData = exportData.data.map(loan => ({
            'Date Applied': new Date(loan.createdAt).toLocaleDateString(),
            'Group': loan.group?.name || 'Unknown',
            'Amount Requested': Number(loan.amountRequested),
            'Amount Approved': loan.amountApproved ? Number(loan.amountApproved) : 'N/A',
            'Status': loan.status,
            'Purpose': loan.purpose || 'N/A',
            'Repayment Period': `${loan.repaymentPeriodMonths} months`,
            'Interest Rate': `${loan.interestRate}%`
          }))
          break

        case 'groups':
          worksheetData = exportData.data.map(group => ({
            'Name': group.name,
            'Description': group.description || 'N/A',
            'Region': group.region,
            'Monthly Contribution': Number(group.monthlyContribution),
            'Max Loan Multiplier': group.maxLoanMultiplier,
            'Interest Rate': `${group.interestRate}%`,
            'Members': group._count?.members || 0,
            'Created': new Date(group.createdAt).toLocaleDateString()
          }))
          break

        case 'activities':
          worksheetData = exportData.data.map(activity => ({
            'Date': new Date(activity.createdAt).toLocaleDateString(),
            'Type': activity.actionType,
            'Description': activity.description,
            'Group': activity.group?.name || 'N/A'
          }))
          break
      }

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(worksheetData)

      // Auto-size columns
      const colWidths = Object.keys(worksheetData[0] || {}).map(() => ({ wch: 15 }))
      ws['!cols'] = colWidths

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, exportData.title)

      // Save file
      XLSX.writeFile(wb, filename)
    } catch (error) {
      console.error('Excel export failed:', error)
      throw new Error('Failed to export Excel')
    }
  }

  // Export to CSV
  static exportToCSV(exportData: ExportData, filename: string): void {
    try {
      let csvContent = ''

      switch (exportData.type) {
        case 'contributions':
          csvContent = 'Date,Group,Amount,Payment Method,Status,Transaction Ref,Month,Year\n'
          exportData.data.forEach(contrib => {
            csvContent += `${new Date(contrib.createdAt).toLocaleDateString()},`
            csvContent += `"${contrib.group?.name || 'Unknown'}",`
            csvContent += `${Number(contrib.amount)},`
            csvContent += `${contrib.paymentMethod},`
            csvContent += `${contrib.status},`
            csvContent += `"${contrib.transactionRef || 'N/A'}",`
            csvContent += `${contrib.month},`
            csvContent += `${contrib.year}\n`
          })
          break

        case 'loans':
          csvContent = 'Date Applied,Group,Amount Requested,Amount Approved,Status,Purpose,Repayment Period,Interest Rate\n'
          exportData.data.forEach(loan => {
            csvContent += `${new Date(loan.createdAt).toLocaleDateString()},`
            csvContent += `"${loan.group?.name || 'Unknown'}",`
            csvContent += `${Number(loan.amountRequested)},`
            csvContent += `${loan.amountApproved ? Number(loan.amountApproved) : 'N/A'},`
            csvContent += `${loan.status},`
            csvContent += `"${loan.purpose || 'N/A'}",`
            csvContent += `"${loan.repaymentPeriodMonths} months",`
            csvContent += `${loan.interestRate}%\n`
          })
          break

        case 'groups':
          csvContent = 'Name,Description,Region,Monthly Contribution,Max Loan Multiplier,Interest Rate,Members,Created\n'
          exportData.data.forEach(group => {
            csvContent += `"${group.name}",`
            csvContent += `"${group.description || 'N/A'}",`
            csvContent += `${group.region},`
            csvContent += `${Number(group.monthlyContribution)},`
            csvContent += `${group.maxLoanMultiplier},`
            csvContent += `${group.interestRate}%,`
            csvContent += `${group._count?.members || 0},`
            csvContent += `${new Date(group.createdAt).toLocaleDateString()}\n`
          })
          break

        case 'activities':
          csvContent = 'Date,Type,Description,Group\n'
          exportData.data.forEach(activity => {
            csvContent += `${new Date(activity.createdAt).toLocaleDateString()},`
            csvContent += `${activity.actionType},`
            csvContent += `"${activity.description}",`
            csvContent += `"${activity.group?.name || 'N/A'}"\n`
          })
          break
      }

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('CSV export failed:', error)
      throw new Error('Failed to export CSV')
    }
  }

  // Generate summary statistics
  static generateSummaryStats(data: any[], type: string): any {
    switch (type) {
      case 'contributions':
        const totalContributions = data.reduce((sum, c) => sum + Number(c.amount), 0)
        const avgContribution = totalContributions / data.length
        const completedContributions = data.filter(c => c.status === 'COMPLETED').length
        const pendingContributions = data.filter(c => c.status === 'PENDING').length

        return {
          total: data.length,
          totalAmount: totalContributions,
          averageAmount: avgContribution,
          completed: completedContributions,
          pending: pendingContributions,
          completionRate: (completedContributions / data.length * 100).toFixed(1)
        }

      case 'loans':
        const totalLoans = data.length
        const totalRequested = data.reduce((sum, l) => sum + Number(l.amountRequested), 0)
        const totalApproved = data.reduce((sum, l) => sum + (Number(l.amountApproved) || 0), 0)
        const approvedLoans = data.filter(l => l.status === 'APPROVED').length
        const pendingLoans = data.filter(l => l.status === 'PENDING').length

        return {
          total: totalLoans,
          totalRequested,
          totalApproved,
          averageLoan: totalRequested / totalLoans,
          approved: approvedLoans,
          pending: pendingLoans,
          approvalRate: (approvedLoans / totalLoans * 100).toFixed(1)
        }

      default:
        return { total: data.length }
    }
  }
}
