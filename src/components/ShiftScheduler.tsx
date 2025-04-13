import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CalendarDays, Clock, Users, AlertTriangle, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Database } from '../types/supabase';

type Shift = Database['public']['Tables']['shifts']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];

interface ShiftSchedulerProps {
  volunteerId: string;
  onShiftSaved?: () => void;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
}

export default function ShiftScheduler({ volunteerId, onShiftSaved }: ShiftSchedulerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [upcomingShifts, setUpcomingShifts] = useState<(Shift & { task?: Task })[]>([]);

  // Generate available dates (next 7 days)
  useEffect(() => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    setAvailableDates(dates);
    
    if (!selectedDate) {
      setSelectedDate(dates[0]);
    }
    
    // Generate time slots
    const slots: TimeSlot[] = [
      { id: 'morning', startTime: '08:00', endTime: '12:00', label: 'Morning (8am - 12pm)' },
      { id: 'afternoon', startTime: '12:00', endTime: '16:00', label: 'Afternoon (12pm - 4pm)' },
      { id: 'evening', startTime: '16:00', endTime: '20:00', label: 'Evening (4pm - 8pm)' },
    ];
    
    setTimeSlots(slots);
  }, []);

  // Fetch tasks and volunteer's existing shifts
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch active tasks
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select('*')
          .eq('status', 'open')
          .order('priority');
        
        if (taskError) throw taskError;
        
        setTasks(taskData || []);
        
        // Fetch volunteer's existing shifts
        const { data: shiftData, error: shiftError } = await supabase
          .from('shifts')
          .select('*')
          .eq('volunteer_id', volunteerId)
          .gte('start_time', new Date().toISOString())
          .order('start_time');
        
        if (shiftError) throw shiftError;
        
        setShifts(shiftData || []);
        
        // Fetch upcoming shifts with task details
        const { data: upcomingData, error: upcomingError } = await supabase
          .from('shifts')
          .select(`
            *,
            task:task_id(id, title, description, location, priority)
          `)
          .eq('volunteer_id', volunteerId)
          .gte('start_time', new Date().toISOString())
          .order('start_time')
          .limit(5);
        
        if (upcomingError) throw upcomingError;
        
        setUpcomingShifts(upcomingData || []);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load scheduling data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [volunteerId]);

  const isSlotAvailable = (date: string, slotId: string): boolean => {
    const slot = timeSlots.find(s => s.id === slotId);
    if (!slot) return false;
    
    // Convert to full ISO datetime for comparison
    const startDateTime = `${date}T${slot.startTime}:00Z`;
    const endDateTime = `${date}T${slot.endTime}:00Z`;
    
    // Check if there's a shift that overlaps with this slot
    return !shifts.some(shift => {
      return (shift.start_time <= endDateTime && shift.end_time >= startDateTime);
    });
  };

  const handleSaveShift = async () => {
    if (!selectedDate || !selectedTask || !selectedTimeSlot) {
      toast.error('Please select a date, task, and time slot');
      return;
    }
    
    try {
      setSaving(true);
      
      const slot = timeSlots.find(s => s.id === selectedTimeSlot);
      if (!slot) {
        toast.error('Invalid time slot selected');
        return;
      }
      
      // Convert to full ISO datetime
      const startDateTime = `${selectedDate}T${slot.startTime}:00Z`;
      const endDateTime = `${selectedDate}T${slot.endTime}:00Z`;
      
      // Create the shift
      const { data, error } = await supabase
        .from('shifts')
        .insert([{
          volunteer_id: volunteerId,
          task_id: selectedTask,
          start_time: startDateTime,
          end_time: endDateTime,
          status: 'scheduled'
        }]);
      
      if (error) throw error;
      
      toast.success('Shift scheduled successfully!');
      
      // Reset selection
      setSelectedTask('');
      setSelectedTimeSlot('');
      
      // Refresh data
      if (onShiftSaved) {
        onShiftSaved();
      }
      
      // Refresh shifts
      const { data: refreshedShifts, error: refreshError } = await supabase
        .from('shifts')
        .select('*')
        .eq('volunteer_id', volunteerId)
        .gte('start_time', new Date().toISOString())
        .order('start_time');
      
      if (!refreshError) {
        setShifts(refreshedShifts || []);
      }
      
      // Refresh upcoming shifts with task details
      const { data: upcomingData, error: upcomingError } = await supabase
        .from('shifts')
        .select(`
          *,
          task:task_id(id, title, description, location, priority)
        `)
        .eq('volunteer_id', volunteerId)
        .gte('start_time', new Date().toISOString())
        .order('start_time')
        .limit(5);
      
      if (!upcomingError) {
        setUpcomingShifts(upcomingData || []);
      }
      
    } catch (error) {
      console.error('Error scheduling shift:', error);
      toast.error('Failed to schedule shift');
    } finally {
      setSaving(false);
    }
  };

  const formatShiftDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatShiftTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <CalendarDays className="h-5 w-5 mr-2 text-primary-500" />
          Schedule Your Shifts
        </h2>
        <p className="text-sm text-gray-600">
          Select available times to volunteer for tasks
        </p>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Date
          </label>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
            {availableDates.slice(0, 7).map(date => (
              <button
                key={date}
                type="button"
                onClick={() => setSelectedDate(date)}
                className={`py-2 px-1 text-sm rounded-md ${
                  selectedDate === date 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {new Date(date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
              </button>
            ))}
          </div>
        </div>
        
        {selectedDate && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Task
              </label>
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">-- Select a task --</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title} - {task.priority.toUpperCase()} Priority
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Time Slot
              </label>
              <div className="space-y-2">
                {timeSlots.map(slot => {
                  const available = isSlotAvailable(selectedDate, slot.id);
                  
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={!available}
                      onClick={() => available && setSelectedTimeSlot(slot.id)}
                      className={`w-full py-2 px-3 rounded-md text-left ${
                        !available
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : selectedTimeSlot === slot.id
                            ? 'bg-primary-50 text-primary-700 border border-primary-200'
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{slot.label}</span>
                        </div>
                        {!available ? (
                          <span className="text-xs text-red-500">Not Available</span>
                        ) : selectedTimeSlot === slot.id ? (
                          <Check className="h-4 w-4 text-primary-500" />
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="button"
                disabled={!selectedDate || !selectedTask || !selectedTimeSlot || saving}
                onClick={handleSaveShift}
                className="w-full py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Scheduling...' : 'Schedule Shift'}
              </button>
            </div>
          </>
        )}
      </div>
      
      {upcomingShifts.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-b-lg border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Users className="h-4 w-4 mr-1 text-primary-500" />
            Your Upcoming Shifts
          </h3>
          
          <div className="space-y-3">
            {upcomingShifts.map(shift => (
              <div key={shift.id} className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm">
                      {shift.task?.title || 'Untitled Task'}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {formatShiftDate(shift.start_time)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatShiftTime(shift.start_time)} - {formatShiftTime(shift.end_time)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    shift.status === 'scheduled' 
                      ? 'bg-blue-100 text-blue-800' 
                      : shift.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {shift.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 