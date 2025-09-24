import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Pill, AlertTriangle, CheckCircle2, Calendar, CheckCircle, AlertCircle, Edit3 } from "lucide-react";
import { Medicine } from "@/hooks/useMedicines";
import { useMedicineIntakes } from "@/hooks/useMedicineIntakes";

interface MedicineCardProps {
  medicine: Medicine;
  onEdit?: (medicine: Medicine) => void;
}

const MedicineCard = ({ medicine, onEdit }: MedicineCardProps) => {
  const { recordIntake } = useMedicineIntakes();
  const isLowStock = medicine.remaining_count <= medicine.refill_threshold;
  const scheduleString = medicine.schedules?.map(s => s.time_of_day).join(", ") || "No schedule";
  
  return (
    <Card className="pill-card hover:shadow-[var(--shadow-pill)] transition-[var(--transition-gentle)]">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${medicine.type === 'tablet' ? 'bg-primary-light' : 'bg-secondary-light'}`}>
              <Pill className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{medicine.name}</CardTitle>
              <CardDescription className="text-base">{medicine.dosage}</CardDescription>
            </div>
          </div>
          <Badge 
            variant={medicine.taken ? "default" : "secondary"}
            className={`alert-badge ${medicine.taken ? 'bg-secondary text-secondary-foreground' : 'bg-warning text-warning-foreground'}`}
          >
            {medicine.taken ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
            {medicine.taken ? 'Taken' : 'Pending'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Schedule */}
        <div>
          <h4 className="font-medium text-foreground mb-2">Daily Schedule</h4>
          <div className="flex flex-wrap gap-2">
            {medicine.schedules?.map((schedule, index) => (
              <Badge key={index} variant="outline" className="text-sm">
                {schedule.time_of_day}
              </Badge>
            )) || <Badge variant="outline" className="text-sm">No schedule</Badge>}
          </div>
        </div>

        {/* Next Dose */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Next Dose</span>
          </div>
          <span className="text-sm text-primary font-medium">{medicine.next_dose}</span>
        </div>

        {/* Remaining Pills */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Pills remaining:</span>
            <Badge 
              variant={isLowStock ? "destructive" : "outline"}
              className={isLowStock ? "alert-badge" : ""}
            >
              {isLowStock && <AlertTriangle className="h-3 w-3 mr-1" />}
              {medicine.remaining_count}
            </Badge>
          </div>
          
          {isLowStock && (
            <Button variant="outline" size="sm" className="accessibility-focus">
              Order Refill
            </Button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm"
              className="accessibility-focus"
              onClick={() => onEdit(medicine)}
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          {!medicine.taken && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                className="accessibility-focus"
                onClick={() => recordIntake(medicine.id, 'skipped')}
              >
                <Clock className="h-4 w-4 mr-1" />
                Skip
              </Button>
              <Button 
                size="sm"
                className="medicine-button bg-gradient-to-r from-secondary to-primary hover:opacity-90"
                onClick={() => recordIntake(medicine.id, 'taken')}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Take Medicine
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicineCard;