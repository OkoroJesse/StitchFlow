import React from 'react'
import { getCustomers } from '@/actions/customers'
import { Plus, Search, User, Phone, MapPin, MoreVertical } from 'lucide-react'
import Link from 'next/link'

export default async function CustomersPage() {
  const customers = await getCustomers()

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Customers</h1>
          <p className="text-gray-500">Manage your fashion clients and their job history.</p>
        </div>
        <Link 
          href="/dashboard/customers/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1e1b2e] hover:bg-indigo-500 text-gray-900 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add New Customer
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="relative group max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-pink-600 transition-colors" />
        <input 
          type="text" 
          placeholder="Search by name or phone..." 
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
        />
      </div>

      {/* Customers List */}
      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-200 rounded-3xl space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-gray-500" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">No customers found</p>
            <p className="text-gray-500">Add your first client to start tracking their jobs.</p>
          </div>
          <Link 
            href="/dashboard/customers/new"
            className="text-pink-600 hover:text-pink-500 font-medium"
          >
            Create my first customer →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <div 
              key={customer.id} 
              className="bg-white border border-gray-200 p-6 rounded-2xl hover:border-gray-300 transition-all group relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600 font-bold text-xl uppercase">
                  {customer.full_name.charAt(0)}
                </div>
                <button className="text-gray-500 hover:text-gray-900 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                  {customer.full_name}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Phone className="w-4 h-4" />
                    <span>{customer.phone_number || 'No phone'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{customer.address || 'No address added'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added {new Date(customer.created_at).toLocaleDateString()}
                </span>
                <Link 
                  href={`/dashboard/customers/${customer.id}`}
                  className="text-sm font-semibold text-gray-900 bg-gray-50 px-4 py-2 rounded-lg hover:bg-slate-700 transition-all"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
