import { v4 as uuidv4 } from "uuid";
import { StableBTreeMap, ic } from "azle";
import express from "express";
import rateLimit from 'express-rate-limit';

/**
 * @title Maternal Health Tracking System
 * @description A comprehensive system for tracking maternal health data and managing prenatal care
 * @version 1.1.0
 */

// Enums with comprehensive documentation
export enum RiskLevel {
    LOW = "LOW",       // Regular monitoring needed
    MEDIUM = "MEDIUM", // Increased monitoring required
    HIGH = "HIGH",     // Immediate medical attention needed
}

export enum Trimester {
    FIRST = "FIRST",   // Weeks 1-12
    SECOND = "SECOND", // Weeks 13-26
    THIRD = "THIRD",   // Weeks 27-40
}

// Interfaces with validation constraints
interface HealthcareProvider {
    id: string;
    name: string;
    specialization: string;
    licenseNumber: string;
    contactInfo: string;
    facilityId: string;
    isActive: boolean;       // Track active status of provider
    role: string;            // Added for RBAC (e.g., "admin", "provider")
    lastUpdated: bigint;
}

interface MaternalProfile {
    id: string;
    name: string;
    age: number;
    bloodType: string;
    emergencyContact: string;
    dueDate: bigint;
    currentTrimester: Trimester;
    riskLevel: RiskLevel;
    primaryCareProviderId: string;
    createdAt: bigint;
    lastUpdated: bigint;
    medicalHistory: string[];    // Track medical history
    allergies: string[];         // Allergy tracking
    isHighRiskPregnancy: boolean;
}

interface HealthMetrics {
    id: string;
    maternalProfileId: string;
    recordedAt: bigint;
    weight: number;
    bloodPressureSystolic: number;
    bloodPressureDiastolic: number;
    bloodSugar: number;
    hemoglobinLevels: number;
    fetalHeartRate: number | null;
    notes: string;
    recordedById: string;    // ID of healthcare provider who recorded metrics
    isFlaggedForReview: boolean;
}

interface PrenatalVisit {
    id: string;
    maternalProfileId: string;
    providerId: string;
    scheduledDate: bigint;
    completed: boolean;
    visitType: string;
    findings: string;
    recommendations: string;
    nextVisitDate: bigint | null;
    prescriptions: string[];     // Track medications
    followUpRequired: boolean;
    cancellationReason?: string;
}

interface HealthAlert {
    id: string;
    maternalProfileId: string;
    createdAt: bigint;
    severity: RiskLevel;
    description: string;
    recommendedAction: string;
    resolved: boolean;
    resolvedAt: bigint | null;
    providerId: string;
    resolutionNotes?: string;
    escalationLevel: number;     // 1-3 for alert escalation tracking
}

// Initialize storage with proper error handling
const maternalProfileStorage = StableBTreeMap<string, MaternalProfile>(0);
const providerStorage = StableBTreeMap<string, HealthcareProvider>(1);
const metricsStorage = StableBTreeMap<string, HealthMetrics>(2);
const visitStorage = StableBTreeMap<string, PrenatalVisit>(3);
const alertStorage = StableBTreeMap<string, HealthAlert>(4);

// Time conversion constant
const NANOS_PER_MILLISECOND = 1_000_000n;

// Input sanitization and validation
function sanitizeString(input: string): string {
    return input.replace(/[<>]/g, ''); // Basic XSS prevention
}

function parseDateToBigInt(dateString: string): bigint | null {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : BigInt(date.getTime()) * NANOS_PER_MILLISECOND;
}

function validateProfile(profile: Partial<MaternalProfile>): string | null {
    if (!profile.name || profile.name.trim().length < 2 || profile.name.length > 100) {
        return "Name must be between 2 and 100 characters";
    }
    if (!profile.age || profile.age < 16 || profile.age > 60) {
        return "Age must be between 16 and 60";
    }
    if (!profile.bloodType || !["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].includes(profile.bloodType)) {
        return "Invalid blood type";
    }
    return null;
}

function validateHealthMetrics(metrics: Partial<HealthMetrics>): string | null {
    if (metrics.bloodPressureSystolic && (metrics.bloodPressureSystolic < 70 || metrics.bloodPressureSystolic > 190)) {
        return "Invalid systolic blood pressure range";
    }
    if (metrics.bloodPressureDiastolic && (metrics.bloodPressureDiastolic < 40 || metrics.bloodPressureDiastolic > 120)) {
        return "Invalid diastolic blood pressure range";
    }
    return null;
}

// Authorization Middleware
function authorize(requiredRole: string) {
    return (req, res, next) => {
        const userRole = req.headers['x-role']; // Example: pass role in headers
        if (userRole !== requiredRole) {
            return res.status(403).json({ error: "Forbidden" });
        }
        next();
    };
}

// Express app setup
const app = express();
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Enhanced route handlers
app.post("/maternal-profiles", authorize('admin'), (req, res) => {
    try {
        if (req.body.name) req.body.name = sanitizeString(req.body.name);

        const validationError = validateProfile(req.body);
        if (validationError) return res.status(400).json({ error: validationError });

        const dueDate = parseDateToBigInt(req.body.dueDate);
        if (!dueDate) return res.status(400).json({ error: "Invalid date format for dueDate" });

        const profile: MaternalProfile = {
            id: uuidv4(),
            createdAt: BigInt(ic.time()),
            lastUpdated: BigInt(ic.time()),
            medicalHistory: [],
            allergies: [],
            isHighRiskPregnancy: false,
            ...req.body,
            dueDate
        };

        maternalProfileStorage.insert(profile.id, profile);
        res.json(profile);
    } catch (error) {
        console.error('Error creating maternal profile:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/health-metrics", authorize('provider'), (req, res) => {
    try {
        const profileOpt = maternalProfileStorage.get(req.body.maternalProfileId);
        if (!profileOpt || "None" in profileOpt) {
            return res.status(404).json({ error: "Maternal profile not found" });
        }

        const validationError = validateHealthMetrics(req.body);
        if (validationError) return res.status(400).json({ error: validationError });

        const metrics: HealthMetrics = {
            id: uuidv4(),
            recordedAt: BigInt(ic.time()),
            isFlaggedForReview: false,
            ...req.body
        };

        metricsStorage.insert(metrics.id, metrics);
        res.json(metrics);
    } catch (error) {
        console.error('Error recording health metrics:', error);
        res.status(500).json({ error: "Failed to record health metrics" });
    }
});

// Additional routes (GET, PUT, DELETE) can follow a similar pattern with appropriate role checks.

app.listen();
export default app;
