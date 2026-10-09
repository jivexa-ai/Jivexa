-- ====================================================================
-- JIVEXA HEALTH OS — SUPABASE POSTGRESQL PRODUCTION SCHEMA MIGRATION
-- Compatible with PostgreSQL 15+ / Supabase
-- ====================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------
-- 1. USERS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    role_id TEXT UNIQUE,
    name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    health_id TEXT DEFAULT '',
    age INTEGER CHECK (age IS NULL OR (age >= 1 AND age <= 120)),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'PATIENT' CHECK (role IN ('PATIENT', 'DOCTOR', 'PHARMACY', 'AMBULANCE_PARTNER', 'ADMIN')),
    email_verified BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    account_status TEXT DEFAULT 'PENDING_EMAIL_VERIFICATION' CHECK (account_status IN (
        'PENDING_EMAIL_VERIFICATION',
        'PENDING_DOCUMENT_REVIEW',
        'PENDING_PROFESSIONAL_VERIFICATION',
        'PENDING_VEHICLE_VERIFICATION',
        'PENDING_LICENSE_VERIFICATION',
        'VERIFIED',
        'ACTIVE',
        'REJECTED',
        'SUSPENDED'
    )),
    otp_details JSONB DEFAULT NULL,
    failed_login_attempts INTEGER DEFAULT 0,
    lock_until TIMESTAMPTZ DEFAULT NULL,
    professional_details JSONB DEFAULT NULL,
    vehicle_details JSONB DEFAULT NULL,
    license_details JSONB DEFAULT NULL,
    usage JSONB DEFAULT '{"tokenUsed": 0, "tokenLimit": 10000, "totalTokenUsed": 0}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON public.users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_health_id ON public.users(health_id);

-- --------------------------------------------------------------------
-- 2. DIGITAL HEALTH IDS (JHID) TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.health_ids (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    health_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    full_name TEXT NOT NULL,
    date_of_birth TEXT DEFAULT '2000-01-01',
    gender TEXT DEFAULT 'Unspecified',
    phone_number TEXT DEFAULT '',
    email TEXT DEFAULT '',
    blood_group TEXT DEFAULT 'Not Set',
    emergency_contact JSONB DEFAULT '{}'::jsonb,
    address TEXT DEFAULT '',
    health_profile JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_health_ids_health_id ON public.health_ids(health_id);
CREATE INDEX IF NOT EXISTS idx_health_ids_user_id ON public.health_ids(user_id);

-- --------------------------------------------------------------------
-- 3. APPOINTMENTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    doctor_specialty TEXT DEFAULT 'General Medicine',
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    consultation_type TEXT DEFAULT 'Video',
    status TEXT DEFAULT 'Upcoming',
    notes TEXT DEFAULT '',
    consultation_summary TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date DESC);

-- --------------------------------------------------------------------
-- 4. DIGITAL PRESCRIPTIONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    appointment_id TEXT DEFAULT NULL,
    date TEXT NOT NULL,
    medications JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT DEFAULT '',
    status TEXT DEFAULT 'Issued',
    follow_up_date TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON public.prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_date ON public.prescriptions(date DESC);

-- --------------------------------------------------------------------
-- 5. PHARMACY ORDERS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pharmacy_orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    pharmacy_id TEXT NOT NULL,
    pharmacy_name TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'Pending',
    delivery_address TEXT DEFAULT '',
    payment_status TEXT DEFAULT 'Pending',
    prescription_id TEXT DEFAULT '',
    date TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_patient_id ON public.pharmacy_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_pharmacy_id ON public.pharmacy_orders(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_created_at ON public.pharmacy_orders(created_at DESC);

-- --------------------------------------------------------------------
-- 6. AMBULANCE EMERGENCY DISPATCH TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ambulance_requests (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    patient_phone TEXT DEFAULT '',
    jivexa_health_id TEXT DEFAULT '',
    ambulance_id TEXT DEFAULT '',
    ambulance_type TEXT DEFAULT 'ICU',
    vehicle_number TEXT DEFAULT '',
    driver_name TEXT DEFAULT '',
    driver_phone TEXT DEFAULT '',
    pickup_address TEXT NOT NULL,
    destination_address TEXT NOT NULL,
    pickup_lat NUMERIC(10, 6) DEFAULT 12.9716,
    pickup_lng NUMERIC(10, 6) DEFAULT 77.5946,
    dest_lat NUMERIC(10, 6) DEFAULT 12.9780,
    dest_lng NUMERIC(10, 6) DEFAULT 77.6010,
    emergency_type TEXT DEFAULT 'General Emergency',
    status TEXT DEFAULT 'Pending',
    fare NUMERIC(10, 2) DEFAULT 0,
    accepted_at TIMESTAMPTZ DEFAULT NULL,
    completed_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_ambulance_requests_patient_id ON public.ambulance_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_ambulance_requests_ambulance_id ON public.ambulance_requests(ambulance_id);
CREATE INDEX IF NOT EXISTS idx_ambulance_requests_created_at ON public.ambulance_requests(created_at DESC);

-- ====================================================================
-- RLS (ROW LEVEL SECURITY) POLICIES
-- Service Role has full bypass for backend operations
-- ====================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulance_requests ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
DROP POLICY IF EXISTS "Service role bypass users" ON public.users;
CREATE POLICY "Service role bypass users" ON public.users USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role bypass health_ids" ON public.health_ids;
CREATE POLICY "Service role bypass health_ids" ON public.health_ids USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role bypass appointments" ON public.appointments;
CREATE POLICY "Service role bypass appointments" ON public.appointments USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role bypass prescriptions" ON public.prescriptions;
CREATE POLICY "Service role bypass prescriptions" ON public.prescriptions USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role bypass pharmacy_orders" ON public.pharmacy_orders;
CREATE POLICY "Service role bypass pharmacy_orders" ON public.pharmacy_orders USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role bypass ambulance_requests" ON public.ambulance_requests;
CREATE POLICY "Service role bypass ambulance_requests" ON public.ambulance_requests USING (true) WITH CHECK (true);

-- ====================================================================
-- SCHEMA AND TABLE PERMISSIONS FOR SUPABASE API ROLES
-- Grants SELECT, INSERT, UPDATE, DELETE to service_role, authenticated, and anon
-- ====================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- --------------------------------------------------------------------
-- 7. SUPABASE STORAGE: PROFILE PHOTOS BUCKET & POLICIES
-- --------------------------------------------------------------------
-- Optional avatar_url column for users table if desired in direct SQL
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;

-- Profile photos storage bucket (Max 5MB, JPG/PNG/WEBP only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-photos',
    'profile-photos',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- Storage RLS: Users can upload to their own user-scoped folder: profile-photos/{user_id}/*
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage RLS: Users can update their own avatar
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage RLS: Users can delete their own avatar
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage RLS: Public read for profile photos
DROP POLICY IF EXISTS "Public read for profile photos" ON storage.objects;
CREATE POLICY "Public read for profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

