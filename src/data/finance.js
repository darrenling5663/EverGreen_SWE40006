export const paymentMethods = ['Cash', 'Debit Card', 'Credit Card', 'Touch ‘n Go eWallet', 'Bank Transfer', 'Others']
export const accountTypes = ['Savings', 'Fixed Deposit', 'Investment']
export const initialBills = [
  { id: 'bill-phone', name: 'Mobile data plan', amount: 79, category: 'Bills & Utilities', dueDay: 22, paymentMethod: 'Debit Card', paidMonths: [] },
  { id: 'bill-spotify', name: 'Music subscription', amount: 15.9, category: 'Entertainment', dueDay: 9, paymentMethod: 'Credit Card', paidMonths: [] },
  { id: 'bill-electricity', name: 'Electricity', amount: 62, category: 'Bills & Utilities', dueDay: 28, paymentMethod: 'Bank Transfer', paidMonths: [] },
]
export const initialAssets = [
  { id: 'asset-emergency', name: 'Emergency fund', type: 'Savings', balance: 1500, target: 5000, notes: 'Demo amount — replace with your own', movements: [] },
  { id: 'asset-fixed', name: 'Fixed deposit', type: 'Fixed Deposit', balance: 3000, target: 6000, notes: 'Manual balance, not bank-connected', movements: [] },
  { id: 'asset-invest', name: 'Long-term investments', type: 'Investment', balance: 850, target: 3000, notes: 'Enter current estimated value manually', movements: [] },
]
export const paymentColors = {
  'Cash': '#E6A33A', 'Debit Card': '#3986E5', 'Credit Card': '#8259DC',
  'Touch ‘n Go eWallet': '#18A8A4', 'Bank Transfer': '#229767', Others: '#8A99A7'
}
