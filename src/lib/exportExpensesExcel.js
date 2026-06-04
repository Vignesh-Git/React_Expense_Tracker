import ExcelJS from 'exceljs'
import { getCurrencyByCode } from './currency.js'

function formatExpenseDate(isoDate) {
  if (!isoDate) return ''
  try {
    return new Date(`${isoDate}T12:00:00`).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return isoDate
  }
}

function buildFileName() {
  const stamp = new Date().toISOString().slice(0, 10)
  return `spendwise-expenses-${stamp}.xlsx`
}

/**
 * Export expenses to a protected .xlsx workbook.
 * Columns: Name, Date, Category, Amount, Exported Date (locked).
 * Includes a TOTAL row for Amount.
 */
export async function exportExpensesToExcel(expenses, currencyCode) {
  if (!expenses?.length) {
    return { ok: false, error: 'No expenses to export.' }
  }

  const exportedAt = new Date()
  const currency = getCurrencyByCode(currencyCode)
  const exportedDateLabel = exportedAt.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const sorted = [...expenses].sort((a, b) => {
    const dateA = a.date ?? ''
    const dateB = b.date ?? ''
    if (dateA !== dateB) return dateB.localeCompare(dateA)
    return a.name.localeCompare(b.name)
  })

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'SpendWise'
  workbook.created = exportedAt

  const sheet = workbook.addWorksheet('Expenses', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  sheet.columns = [
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Date', key: 'date', width: 16 },
    { header: 'Category', key: 'category', width: 14 },
    { header: 'Amount', key: 'amount', width: 14 },
    { header: 'Exported Date', key: 'exportedDate', width: 24 },
  ]

  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFEEF2FF' },
  }

  sorted.forEach((expense) => {
    sheet.addRow({
      name: expense.name,
      date: formatExpenseDate(expense.date),
      category: expense.category,
      amount: expense.amount,
      exportedDate: exportedDateLabel,
    })
  })

  const totalAmount = sorted.reduce((sum, expense) => sum + expense.amount, 0)
  const totalRow = sheet.addRow({
    name: 'TOTAL',
    date: '',
    category: '',
    amount: totalAmount,
    exportedDate: exportedDateLabel,
  })
  totalRow.font = { bold: true }
  totalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF3F4F6' },
  }

  const exportedDateColIndex = 5
  const lastRow = sheet.rowCount

  sheet.eachRow((row, rowNumber) => {
    const amountCell = row.getCell(4)
    if (rowNumber > 1 && typeof amountCell.value === 'number') {
      amountCell.numFmt = `${currency.symbol}#,##0.00`
    }

    for (let col = 1; col <= exportedDateColIndex; col += 1) {
      const cell = row.getCell(col)
      cell.protection = { locked: col === exportedDateColIndex }
    }
  })

  await sheet.protect('', {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: false,
    formatColumns: false,
    formatRows: false,
    insertColumns: false,
    insertRows: false,
    insertHyperlinks: false,
    deleteColumns: false,
    deleteRows: false,
    sort: false,
    autoFilter: false,
    pivotTables: false,
  })

  sheet.getCell(lastRow, 4).protection = { locked: true }

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = buildFileName()
  link.click()
  URL.revokeObjectURL(url)

  return { ok: true }
}
