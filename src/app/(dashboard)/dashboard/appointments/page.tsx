'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, Clock, Plus, User, Scissors, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/shared/button'

interface Appointment {
  id: string
  clientName: string
  garment: string
  type: 'First Fitting' | 'Second Fitting' | 'Final Inspection' | 'Pickup & Delivery'
  time: string
  date: string
  status: 'Scheduled' | 'Completed' | 'Cancelled'
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    clientName: 'Phavour Okoro',
    garment: 'Bespoke Senator Set',
    type: 'First Fitting',
    time: '10:30 AM',
    date: '2026-09-05',
    status: 'Scheduled'
  },
  {
    id: 'apt-2',
    clientName: 'Sarah Jenkins',
    garment: 'Velvet Evening Gown',
    type: 'Final Inspection',
    time: '02:00 PM',
    date: '2026-09-05',
    status: 'Scheduled'
  },
  {
    id: 'apt-3',
    clientName: 'Chief Emeka',
    garment: 'Silk Agbada Set',
    type: 'Pickup & Delivery',
    time: '04:30 PM',
    date: '2026-09-06',
    status: 'Scheduled'
  }
]

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS)
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-05')
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [newClient, setNewClient] = useState('')
  const [newGarment, setNewGarment] = useState('')
  const [newType, setNewType] = useState<Appointment['type']>('First Fitting')
  const [newTime, setNewTime] = useState('11:00 AM')

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClient.trim() || !newGarment.trim()) return

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      clientName: newClient.trim(),
      garment: newGarment.trim(),
      type: newType,
      time: newTime,
      date: selectedDate,
      status: 'Scheduled'
    }

    setAppointments([newApt, ...appointments])
    setNewClient('')
    setNewGarment('')
    setShowScheduleModal(false)
  }

  const toggleStatus = (id: string) => {
    setAppointments(appointments.map(a => 
      a.id === id ? { ...a, status: a.status === 'Completed' ? 'Scheduled' : 'Completed' } : a
    ))
  }

  const filteredAppointments = appointments.filter(a => a.date === selectedDate)

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* HEADER BANNER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-br from-[#18131d] to-[#2c1b26] p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#4a1525]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 uppercase tracking-widest">
            <CalendarIcon className="w-4 h-4 text-rose-400" />
            <span>Studio Calendar & Fitting Schedule</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white">
            Fitting Schedule
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-xl font-light">
            Book client fitting sessions, track measurement adjustments, and manage final garment pickups.
          </p>
        </div>
        <div className="relative z-10 w-full sm:w-auto shrink-0">
          <Button 
            variant="primary" 
            icon={<Plus className="w-5 h-5" />} 
            onClick={() => setShowScheduleModal(true)}
            className="w-full sm:w-auto"
          >
            Book Fitting
          </Button>
        </div>
      </div>

      {/* DATE SELECTOR BAR */}
      <div className="flex items-center justify-between bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-[#4a1525]" />
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Selected Date</p>
            <p className="font-serif text-lg font-bold text-stone-900">
              {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSelectedDate('2026-09-05')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              selectedDate === '2026-09-05' 
                ? 'bg-[#18131d] text-white border-[#18131d]' 
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            Today
          </button>
          <button 
            onClick={() => setSelectedDate('2026-09-06')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              selectedDate === '2026-09-06' 
                ? 'bg-[#18131d] text-white border-[#18131d]' 
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            Tomorrow
          </button>
        </div>
      </div>

      {/* APPOINTMENTS LIST */}
      <div className="space-y-4">
        <h2 className="text-lg font-serif font-bold text-stone-900">
          Agenda ({filteredAppointments.length} sessions)
        </h2>

        {filteredAppointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAppointments.map((apt) => (
              <div 
                key={apt.id} 
                className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all hover:shadow-md ${
                  apt.status === 'Completed' ? 'border-emerald-200 bg-emerald-50/20 opacity-75' : 'border-stone-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-rose-50 text-[#4a1525]">
                      {apt.type}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-stone-900 mt-1">
                      {apt.clientName}
                    </h3>
                    <p className="text-xs text-stone-500 font-medium flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-stone-400" />
                      <span>{apt.garment}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-stone-900 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-[#4a1525]" />
                      {apt.time}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className={`text-xs font-semibold ${
                    apt.status === 'Completed' ? 'text-emerald-700' : 'text-stone-500'
                  }`}>
                    Status: {apt.status}
                  </span>

                  <button
                    onClick={() => toggleStatus(apt.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      apt.status === 'Completed'
                        ? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{apt.status === 'Completed' ? 'Mark Scheduled' : 'Mark Completed'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-white border border-dashed border-stone-200 rounded-3xl space-y-4">
            <div className="w-14 h-14 bg-[#FAF8F5] rounded-2xl flex items-center justify-center mx-auto text-stone-400">
              <CalendarIcon className="w-7 h-7 text-[#4a1525]" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <p className="text-stone-900 font-serif font-bold text-base">No fittings scheduled for this date</p>
              <p className="text-stone-500 text-xs">Book a fitting session or measurement appointment with your client.</p>
            </div>
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setShowScheduleModal(true)}>
              Schedule Fitting
            </Button>
          </div>
        )}
      </div>

      {/* SCHEDULE MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-stone-100 pb-4">
              <h3 className="font-serif text-xl font-bold text-stone-900">Book Fitting Appointment</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-stone-400 hover:text-stone-600 text-xl font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAppointment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest block mb-1">Client Name</label>
                <input
                  type="text"
                  required
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  placeholder="e.g. Phavour Okoro"
                  className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl p-3 text-stone-900 text-sm focus:outline-none focus:border-[#4a1525]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest block mb-1">Garment Item</label>
                <input
                  type="text"
                  required
                  value={newGarment}
                  onChange={(e) => setNewGarment(e.target.value)}
                  placeholder="e.g. Evening Dress / Senator Wear"
                  className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl p-3 text-stone-900 text-sm focus:outline-none focus:border-[#4a1525]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest block mb-1">Session Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl p-3 text-stone-900 text-xs font-semibold focus:outline-none focus:border-[#4a1525]"
                  >
                    <option value="First Fitting">First Fitting</option>
                    <option value="Second Fitting">Second Fitting</option>
                    <option value="Final Inspection">Final Inspection</option>
                    <option value="Pickup & Delivery">Pickup & Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest block mb-1">Time</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl p-3 text-stone-900 text-xs font-semibold focus:outline-none focus:border-[#4a1525]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <Button type="button" variant="ghost" onClick={() => setShowScheduleModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Confirm Session</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

