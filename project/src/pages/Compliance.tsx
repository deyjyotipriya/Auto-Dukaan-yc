import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  FileText, 
  DollarSign, 
  Database, 
  BookOpen, 
  Download, 
  Calculator, 
  Upload, 
  CheckSquare,
  FileBarChart,
  Check
} from 'lucide-react';
import { useAppSelector } from '../hooks/redux';
import { selectAllOrders } from '../store/slices/ordersSlice';
import { formatCurrency, formatDate } from '../utils/helpers';

const Compliance: React.FC = () => {
  const { t } = useTranslation();
  const orders = useAppSelector(selectAllOrders);
  
  const [activeTab, setActiveTab] = useState<'invoices' | 'taxes' | 'records' | 'regulations'>('invoices');
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };
  
  const tabs = [
    { id: 'invoices', label: t('compliance.invoices'), icon: FileText },
    { id: 'taxes', label: t('compliance.taxes'), icon: DollarSign },
    { id: 'records', label: t('compliance.records'), icon: Database },
    { id: 'regulations', label: t('compliance.regulations'), icon: BookOpen },
  ];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.h1 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-gray-900"
      >
        {t('compliance.title')}
      </motion.h1>
      
      {/* Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white shadow-card rounded-lg overflow-hidden"
      >
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 py-4 px-1 text-center transition-colors ${
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <div className="flex flex-col items-center justify-center">
                <tab.icon size={20} className="mb-1" />
                <span className="text-sm font-medium">{tab.label}</span>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
      
      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {activeTab === 'invoices' && (
          <>
            <motion.div variants={itemVariants} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-medium mb-1">{t('compliance.generateInvoice')}</h2>
                  <p className="text-gray-500 text-sm mb-4">
                    Generate GST-compliant invoices for your orders
                  </p>
                </div>
                <button className="btn-primary">
                  <FileText size={18} className="mr-2" />
                  {t('compliance.generateInvoice')}
                </button>
              </div>
              
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h3 className="text-md font-medium mb-3">Recent Invoices</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.slice(0, 3).map((order, index) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">INV-{100 + index}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-500">{order.id}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{order.customerName}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{formatCurrency(order.totalAmount)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-primary-600 hover:text-primary-900 mr-2">
                              <Download size={16} />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <FileBarChart size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="card">
              <h2 className="text-lg font-medium mb-4">Invoice Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer">
                  <div className="h-40 bg-gray-100 rounded-md mb-3 flex items-center justify-center">
                    <FileText size={32} className="text-gray-400" />
                  </div>
                  <h3 className="font-medium">Standard Invoice</h3>
                  <p className="text-xs text-gray-500 mt-1">Basic GST invoice template</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer">
                  <div className="h-40 bg-gray-100 rounded-md mb-3 flex items-center justify-center">
                    <FileText size={32} className="text-gray-400" />
                  </div>
                  <h3 className="font-medium">Detailed Invoice</h3>
                  <p className="text-xs text-gray-500 mt-1">Comprehensive invoice with all details</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer">
                  <div className="h-40 bg-gray-100 rounded-md mb-3 flex items-center justify-center">
                    <FileText size={32} className="text-gray-400" />
                  </div>
                  <h3 className="font-medium">Custom Template</h3>
                  <p className="text-xs text-gray-500 mt-1">Create your own custom invoice template</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
        
        {activeTab === 'taxes' && (
          <motion.div variants={itemVariants} className="card">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium mb-1">{t('compliance.calculateTax')}</h2>
                <p className="text-gray-500 text-sm mb-4">
                  Calculate GST and other taxes for your business
                </p>
              </div>
              <button className="btn-primary">
                <Calculator size={18} className="mr-2" />
                {t('compliance.calculateTax')}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-1">Total Tax Collected</h3>
                <p className="text-2xl font-bold text-green-900">₹2,456.00</p>
                <div className="mt-2 text-sm text-green-700">
                  <span className="font-medium">GST (18%)</span>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-1">Current Month</h3>
                <p className="text-2xl font-bold text-blue-900">₹986.00</p>
                <div className="mt-2 text-sm text-blue-700">
                  <span className="font-medium">Due on 20th Apr, 2023</span>
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                <h3 className="font-medium text-purple-800 mb-1">Tax Filing Status</h3>
                <p className="text-xl font-bold text-purple-900">Pending</p>
                <div className="mt-2 text-sm text-purple-700">
                  <span className="font-medium">Next filing: Q1, 2023</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-md font-medium mb-3">Recent Tax Calculations</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tax Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Taxable Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tax Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">Mar 2023</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">GST</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">18%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">₹5,600.00</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">₹1,008.00</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Paid
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">Feb 2023</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">GST</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">18%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">₹4,200.00</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">₹756.00</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Paid
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">Jan 2023</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">GST</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">18%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">₹3,840.00</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">₹691.20</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Paid
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
        
        {activeTab === 'records' && (
          <motion.div variants={itemVariants} className="card">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium mb-1">{t('compliance.exportRecords')}</h2>
                <p className="text-gray-500 text-sm mb-4">
                  Export and manage your business records
                </p>
              </div>
              <div className="flex gap-2">
                <button className="btn-outline flex-1">
                  <Upload size={18} className="mr-2" />
                  Import
                </button>
                <button className="btn-primary flex-1">
                  <Download size={18} className="mr-2" />
                  {t('compliance.exportRecords')}
                </button>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-md font-medium mb-3">Business Records</h3>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <FileText size={24} className="text-primary-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Orders Record</h4>
                        <p className="text-sm text-gray-500">Complete order history and details</p>
                      </div>
                    </div>
                    <button className="btn-sm btn-outline">
                      <Download size={16} className="mr-1" />
                      Export
                    </button>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <FileText size={24} className="text-primary-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Customer Database</h4>
                        <p className="text-sm text-gray-500">Customer information and purchase history</p>
                      </div>
                    </div>
                    <button className="btn-sm btn-outline">
                      <Download size={16} className="mr-1" />
                      Export
                    </button>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <FileText size={24} className="text-primary-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Financial Reports</h4>
                        <p className="text-sm text-gray-500">Sales, revenue, and transaction records</p>
                      </div>
                    </div>
                    <button className="btn-sm btn-outline">
                      <Download size={16} className="mr-1" />
                      Export
                    </button>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <FileText size={24} className="text-primary-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Product Inventory</h4>
                        <p className="text-sm text-gray-500">Complete inventory and stock history</p>
                      </div>
                    </div>
                    <button className="btn-sm btn-outline">
                      <Download size={16} className="mr-1" />
                      Export
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-md font-medium mb-3">Recent Exports</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">orders_march_2023.csv</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">Orders</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">Apr 1, 2023</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">1.2 MB</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900">
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">customers_q1_2023.csv</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">Customers</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">Mar 31, 2023</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">0.8 MB</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900">
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">financial_report_q1_2023.xlsx</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">Financial</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">Mar 31, 2023</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">2.1 MB</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900">
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
        
        {activeTab === 'regulations' && (
          <motion.div variants={itemVariants} className="card">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium mb-1">{t('compliance.complianceChecklist')}</h2>
                <p className="text-gray-500 text-sm mb-4">
                  Regulatory requirements and compliance status
                </p>
              </div>
              <button className="btn-primary">
                <CheckSquare size={18} className="mr-2" />
                {t('compliance.complianceChecklist')}
              </button>
            </div>
            
            <div className="mt-6">
              <h3 className="text-md font-medium mb-3">Compliance Status</h3>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg bg-green-50">
                  <div className="flex items-start">
                    <div className="rounded-full bg-green-100 p-2 mr-3">
                      <Check size={18} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">GST Registration</h4>
                      <p className="text-sm text-gray-600 mb-2">Your business is registered for GST</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-green-700">GSTIN: 27AADCB2230M1ZV</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Valid
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg bg-green-50">
                  <div className="flex items-start">
                    <div className="rounded-full bg-green-100 p-2 mr-3">
                      <Check size={18} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Business Registration</h4>
                      <p className="text-sm text-gray-600 mb-2">Your business is registered as a Proprietorship</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-green-700">Registration #: UDYAM-MH-33-0012345</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Valid
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="rounded-full bg-yellow-100 p-2 mr-3">
                      <CheckSquare size={18} className="text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Tax Returns</h4>
                      <p className="text-sm text-gray-600 mb-2">Quarterly GST returns for Q1 2023 due</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-yellow-700">Due on: Apr 20, 2023</span>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Pending
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg bg-green-50">
                  <div className="flex items-start">
                    <div className="rounded-full bg-green-100 p-2 mr-3">
                      <Check size={18} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Invoice Compliance</h4>
                      <p className="text-sm text-gray-600 mb-2">Your invoices meet GST requirements</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-green-700">Last check: Apr 1, 2023</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Compliant
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="rounded-full bg-yellow-100 p-2 mr-3">
                      <CheckSquare size={18} className="text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">E-Commerce Regulations</h4>
                      <p className="text-sm text-gray-600 mb-2">Consumer Protection (E-Commerce) Rules compliance</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-yellow-700">Policy updates needed</span>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Partial
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-md font-medium mb-3">Regulatory Updates</h3>
              <div className="space-y-3">
                <div className="p-3 border border-blue-100 rounded-lg bg-blue-50">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">GST Rate Update:</span> New GST rates effective from April 1, 2023 for textile products.
                  </p>
                </div>
                <div className="p-3 border border-blue-100 rounded-lg bg-blue-50">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">E-Commerce Rules:</span> New consumer protection guidelines for e-commerce businesses to be implemented by June 2023.
                  </p>
                </div>
                <div className="p-3 border border-blue-100 rounded-lg bg-blue-50">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Digital Payments:</span> New RBI guidelines for recurring payments processing effective from May 1, 2023.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Compliance;