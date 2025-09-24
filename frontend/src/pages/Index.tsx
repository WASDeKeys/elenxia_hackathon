import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Clock, MapPin, Users, Activity, Plus, Pill, Heart, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMedicines, Medicine } from "@/hooks/useMedicines";
import { useMedicineIntakes } from "@/hooks/useMedicineIntakes";
import MedicineCard from "@/components/MedicineCard";
import AddMedicineDialog from "@/components/AddMedicineDialog";
import CaregiverPanel from "@/components/CaregiverPanel";
import PharmacyLocator from "@/components/PharmacyLocator";
import ComplianceDashboard from "@/components/ComplianceDashboard";
import NotificationCenter from "@/components/NotificationCenter";
// Removed legacy Lovable icon

const Index = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const { user, loading: authLoading, signOut } = useAuth();
  const { medicines, loading: medicinesLoading, addMedicine } = useMedicines();
  const { intakes } = useMedicineIntakes();
  const navigate = useNavigate();
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <h1 className="text-3xl font-bold text-foreground">PillPall</h1>
          </div>
          <p className="text-muted-foreground">Loading your health data...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleEditMedicine = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setShowAddDialog(true);
  };

  // Calculate stats from real data
  const totalDosesToday = medicines.reduce((acc, med) => acc + (med.schedules?.length || 0), 0);
  const takenToday = medicines.filter(med => med.taken).length;
  const needRefill = medicines.filter(med => 
    med.remaining_count <= med.refill_threshold
  ).length;
  const nextDose = medicines
    .filter(med => med.schedules && med.schedules.length > 0)
    .map(med => ({ name: med.name, time: med.next_dose }))
    .find(dose => dose.time && !dose.time.includes("Tomorrow"));

  if (medicinesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Pill className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading your medicines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border pill-card rounded-none shadow-[var(--shadow-card)]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground">PillPall</h1>
                <p className="text-muted-foreground">Your health companion</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                <Clock className="h-3 w-3 mr-1" />
                {currentTime}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="relative accessibility-focus"
              >
                <Bell className="h-4 w-4" />
                {needRefill > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="accessibility-focus"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="medicines" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[500px]">
            <TabsTrigger value="medicines" className="accessibility-focus">
              <Pill className="h-4 w-4 mr-2" />
              Medicines
            </TabsTrigger>
            <TabsTrigger value="compliance" className="accessibility-focus">
              <Activity className="h-4 w-4 mr-2" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="caregivers" className="accessibility-focus">
              <Users className="h-4 w-4 mr-2" />
              Caregivers
            </TabsTrigger>
            <TabsTrigger value="pharmacy" className="accessibility-focus">
              <MapPin className="h-4 w-4 mr-2" />
              Pharmacy
            </TabsTrigger>
            <TabsTrigger value="notifications" className="accessibility-focus">
              <Bell className="h-4 w-4 mr-2" />
              Alerts
            </TabsTrigger>
          </TabsList>

          {/* Medicine Management Tab */}
          <TabsContent value="medicines" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Today's Medicines</h2>
                <p className="text-muted-foreground">Manage your medication schedule</p>
              </div>
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="medicine-button bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="pill-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Today's Doses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{takenToday} of {totalDosesToday}</div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </CardContent>
              </Card>

              <Card className="pill-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Next Dose</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">
                    {nextDose?.time || "None"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {nextDose?.name || "No upcoming doses"}
                  </p>
                </CardContent>
              </Card>

              <Card className="pill-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Refill Needed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{needRefill}</div>
                  <p className="text-xs text-muted-foreground">Medicines</p>
                </CardContent>
              </Card>
            </div>

            {/* Medicine Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {medicines.map((medicine) => (
                <MedicineCard key={medicine.id} medicine={medicine} onEdit={handleEditMedicine} />
              ))}
            </div>
          </TabsContent>

          {/* Compliance Dashboard Tab */}
          <TabsContent value="compliance">
            <ComplianceDashboard />
          </TabsContent>

          {/* Caregiver Panel Tab */}
          <TabsContent value="caregivers">
            <CaregiverPanel />
          </TabsContent>

          {/* Pharmacy Locator Tab */}
          <TabsContent value="pharmacy">
            <PharmacyLocator />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <NotificationCenter />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Medicine Dialog */}
      <AddMedicineDialog 
        open={showAddDialog} 
        onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) setEditingMedicine(null);
        }}
        onAddMedicine={async (medicine) => {
          await addMedicine(medicine);
          setShowAddDialog(false);
          setEditingMedicine(null);
        }}
        editingMedicine={editingMedicine}
      />
    </div>
  );
};

export default Index;