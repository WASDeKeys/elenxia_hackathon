from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Medicine, MedicineSchedule, Notification, MedicineIntake, Caregiver


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class MedicineScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicineSchedule
        fields = ["id", "time_of_day", "days_of_week", "is_active", "medicine"]


class MedicineSerializer(serializers.ModelSerializer):
    schedules = MedicineScheduleSerializer(many=True, read_only=True)

    class Meta:
        model = Medicine
        fields = [
            "id",
            "name",
            "dosage",
            "type",
            "remaining_count",
            "refill_threshold",
            "instructions",
            "side_effects",
            "schedules",
        ]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "title", "message", "type", "status", "scheduled_for", "created_at"]


class MedicineIntakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicineIntake
        fields = [
            "id",
            "medicine",
            "scheduled_time",
            "actual_time",
            "status",
            "notes",
            "created_at",
        ]


class CaregiverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Caregiver
        fields = [
            "id",
            "name",
            "relationship",
            "phone_number",
            "email",
            "notifications_enabled",
            "emergency_contact",
            "created_at",
        ]

