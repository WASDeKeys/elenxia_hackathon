import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/apiClient";
import { useAuth } from "./useAuth";
import { useToast } from "@/components/ui/use-toast";

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  type: string;
  remaining_count: number;
  refill_threshold: number;
  instructions?: string;
  side_effects?: string;
  schedules?: MedicineSchedule[];
  next_dose?: string;
  taken?: boolean;
}

export interface MedicineSchedule {
  id: string;
  medicine_id: string;
  time_of_day: string;
  days_of_week: number[];
  is_active: boolean;
}

export interface NewMedicine {
  name: string;
  dosage: string;
  type: string;
  times: string[];
  remaining: number;
}

export const useMedicines = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMedicines = async () => {
    if (!user) {
      setMedicines([]);
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch('/medicines/');

      const processedMedicines = (data || []).map((medicine: any) => ({
        ...medicine,
        schedules: medicine.schedules || [],
        next_dose: getNextDose(medicine.schedules || []),
        taken: false, // This would be calculated from today's intakes
      })) || [];

      setMedicines(processedMedicines);
    } catch (error: any) {
      toast({
        title: "Error fetching medicines",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addMedicine = async (newMedicine: NewMedicine) => {
    if (!user) return;

    try {
      const medicine = await apiFetch('/medicines/', {
        method: 'POST',
        body: JSON.stringify({
          name: newMedicine.name,
          dosage: newMedicine.dosage,
          type: newMedicine.type,
          remaining_count: newMedicine.remaining,
          refill_threshold: 0,
        })
      });

      const scheduleInserts = (newMedicine.times || []).map((time) => ({
        medicine: medicine.id,
        time_of_day: time,
        days_of_week: [1,2,3,4,5,6,7],
        is_active: true,
      }));
      if (scheduleInserts.length > 0) {
        for (const s of scheduleInserts) {
          await apiFetch('/schedules/', { method: 'POST', body: JSON.stringify(s) });
        }
      }

      toast({
        title: "Medicine added successfully",
        description: `${newMedicine.name} has been added to your medication list.`,
      });

      // Refresh the medicines list
      await fetchMedicines();
    } catch (error: any) {
      toast({
        title: "Error adding medicine",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getNextDose = (schedules: MedicineSchedule[]): string => {
    if (!schedules || schedules.length === 0) return "No schedule";
    
    const now = new Date();
    const today = now.getDay() === 0 ? 7 : now.getDay(); // Convert Sunday from 0 to 7
    const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    // Find next dose today or next day
    for (const schedule of schedules) {
      if (!schedule.is_active || !schedule.days_of_week.includes(today)) continue;
      
      if (schedule.time_of_day > currentTime) {
        return schedule.time_of_day;
      }
    }

    // If no more doses today, find first dose tomorrow
    const tomorrow = today === 7 ? 1 : today + 1;
    const tomorrowSchedule = schedules.find(s => 
      s.is_active && s.days_of_week.includes(tomorrow)
    );

    return tomorrowSchedule 
      ? `${tomorrowSchedule.time_of_day} Tomorrow`
      : "No upcoming dose";
  };

  useEffect(() => {
    fetchMedicines();
  }, [user]);

  return {
    medicines,
    loading,
    addMedicine,
    refetchMedicines: fetchMedicines,
  };
};