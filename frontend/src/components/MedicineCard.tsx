// ...existing code...
import React from "react";

interface MedicineCardProps {
		medicine: {
			id: string;
			name: string;
			dosage: string;
			time?: string;
			// Add other fields as needed
		};
	onEdit?: () => void;
	onDelete?: (id: string) => void;
}

const MedicineCard: React.FC<MedicineCardProps> = ({ medicine, onEdit, onDelete }) => {
	return (
		<div className="border rounded p-4 mb-2 bg-white shadow">
			<div className="flex justify-between items-center">
				<div>
					<h3 className="font-bold text-lg">{medicine.name}</h3>
					<p className="text-sm text-gray-600">Dosage: {medicine.dosage}</p>
					{medicine.time && <p className="text-sm text-gray-600">Time: {medicine.time}</p>}
				</div>
				<div className="flex gap-2">
					{onEdit && (
						<button className="text-blue-500" onClick={onEdit}>Edit</button>
					)}
					{onDelete && (
						<button className="text-red-500" onClick={() => onDelete(medicine.id)}>Delete</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default MedicineCard;