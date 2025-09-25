import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/apiClient";
import { useToast } from "@/components/ui/use-toast";

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  time: string;
  // Add other fields as needed
}

const useMedicines = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/medicines/");
      setMedicines(data);
    } catch (error) {
      toast({
        title: "Error fetching medicines",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const addMedicine = async (medicine: Omit<Medicine, "id">) => {
    setLoading(true);
    try {
      const newMed = await apiFetch("/medicines/", {
        method: "POST",
        body: JSON.stringify(medicine),
      });
      setMedicines((prev) => [...prev, newMed]);
      toast({ title: "Medicine added" });
    } catch (error) {
      toast({
        title: "Error adding medicine",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteMedicine = async (medicineId: string) => {
    setLoading(true);
    try {
      await apiFetch(`/medicines/${medicineId}/`, { method: "DELETE" });
      setMedicines((prev) => prev.filter((m) => m.id !== medicineId));
      toast({ title: "Medicine deleted" });
    } catch (error) {
      toast({
        title: "Error deleting medicine",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { medicines, loading, addMedicine, deleteMedicine };
};

export default useMedicines;