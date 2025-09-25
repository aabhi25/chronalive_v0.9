--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (63f4182)
-- Dumped by pg_dump version 16.9

-- Started on 2025-09-25 13:43:24 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS neondb;
--
-- TOC entry 3682 (class 1262 OID 16391)
-- Name: neondb; Type: DATABASE; Schema: -; Owner: neondb_owner
--

CREATE DATABASE neondb WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C.UTF-8';


ALTER DATABASE neondb OWNER TO neondb_owner;

\connect neondb

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 24576)
-- Name: public; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO neondb_owner;

--
-- TOC entry 3684 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: neondb_owner
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 24577)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    school_id uuid NOT NULL,
    user_id character varying NOT NULL,
    action character varying(100) NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id character varying(36) NOT NULL,
    previous_values jsonb,
    new_values jsonb,
    description text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.audit_logs OWNER TO neondb_owner;

--
-- TOC entry 216 (class 1259 OID 24584)
-- Name: class_subject_assignments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.class_subject_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    weekly_frequency integer NOT NULL,
    assigned_teacher_id uuid,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.class_subject_assignments OWNER TO neondb_owner;

--
-- TOC entry 217 (class 1259 OID 24590)
-- Name: class_teacher_assignments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.class_teacher_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    role character varying NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    privileges jsonb DEFAULT '{"attendance": true, "leaveApproval": true, "classFeedPosting": true, "parentCommunication": true}'::jsonb NOT NULL,
    assigned_by character varying NOT NULL,
    school_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.class_teacher_assignments OWNER TO neondb_owner;

--
-- TOC entry 218 (class 1259 OID 24601)
-- Name: classes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.classes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    grade character varying(50) NOT NULL,
    section character varying(10) NOT NULL,
    student_count integer DEFAULT 0 NOT NULL,
    required_subjects jsonb DEFAULT '[]'::jsonb NOT NULL,
    school_id uuid NOT NULL,
    room character varying(100),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.classes OWNER TO neondb_owner;

--
-- TOC entry 219 (class 1259 OID 24611)
-- Name: manual_assignment_audits; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.manual_assignment_audits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    timetable_entry_id uuid NOT NULL,
    class_id uuid NOT NULL,
    day character varying NOT NULL,
    period integer NOT NULL,
    old_teacher_id uuid,
    new_teacher_id uuid,
    subject_id uuid,
    change_reason text DEFAULT 'Manual assignment by admin'::text,
    assigned_by character varying NOT NULL,
    assigned_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.manual_assignment_audits OWNER TO neondb_owner;

--
-- TOC entry 220 (class 1259 OID 24621)
-- Name: parents; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.parents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    email character varying(255),
    contact_number character varying(15) NOT NULL,
    alternate_contact character varying(15),
    address text NOT NULL,
    occupation character varying(255),
    relation_to_student character varying NOT NULL,
    school_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.parents OWNER TO neondb_owner;

--
-- TOC entry 221 (class 1259 OID 24630)
-- Name: posts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content text NOT NULL,
    attachments jsonb DEFAULT '[]'::jsonb NOT NULL,
    posted_by_id character varying NOT NULL,
    feed_scope character varying NOT NULL,
    class_id uuid,
    school_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.posts OWNER TO neondb_owner;

--
-- TOC entry 222 (class 1259 OID 24640)
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.role_permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    school_id uuid NOT NULL,
    role character varying NOT NULL,
    module_id uuid NOT NULL,
    permissions jsonb DEFAULT '{"read": true, "write": false, "delete": false, "export": false}'::jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    assigned_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.role_permissions OWNER TO neondb_owner;

--
-- TOC entry 223 (class 1259 OID 24650)
-- Name: schools; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.schools (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    address text,
    contact_phone character varying(15),
    admin_name character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    timetable_frozen boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.schools OWNER TO neondb_owner;

--
-- TOC entry 224 (class 1259 OID 24660)
-- Name: student_attendance; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.student_attendance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    school_id uuid NOT NULL,
    class_id uuid NOT NULL,
    attendance_date date NOT NULL,
    status character varying DEFAULT 'present'::character varying NOT NULL,
    reason text,
    marked_by character varying,
    marked_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.student_attendance OWNER TO neondb_owner;

--
-- TOC entry 225 (class 1259 OID 24670)
-- Name: student_parents; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.student_parents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    parent_id uuid NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.student_parents OWNER TO neondb_owner;

--
-- TOC entry 226 (class 1259 OID 24676)
-- Name: students; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.students (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    admission_number character varying(50) NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    email character varying(255),
    contact_number character varying(15),
    date_of_birth date,
    gender character varying,
    address text,
    class_id uuid,
    school_id uuid NOT NULL,
    roll_number character varying(20),
    blood_group character varying(5),
    guardian_name character varying(255),
    guardian_relation character varying(50),
    guardian_contact character varying(15),
    emergency_contact character varying(15),
    medical_info text,
    is_active boolean DEFAULT true NOT NULL,
    status character varying DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    profile_picture_url character varying(500)
);


ALTER TABLE public.students OWNER TO neondb_owner;

--
-- TOC entry 227 (class 1259 OID 24686)
-- Name: subjects; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.subjects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(50) NOT NULL,
    periods_per_week integer NOT NULL,
    color character varying(7) DEFAULT '#3B82F6'::character varying NOT NULL,
    school_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.subjects OWNER TO neondb_owner;

--
-- TOC entry 228 (class 1259 OID 24693)
-- Name: substitutions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.substitutions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    original_teacher_id uuid NOT NULL,
    substitute_teacher_id uuid,
    timetable_entry_id uuid NOT NULL,
    date timestamp without time zone NOT NULL,
    reason text,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    is_auto_generated boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.substitutions OWNER TO neondb_owner;

--
-- TOC entry 229 (class 1259 OID 24703)
-- Name: system_modules; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.system_modules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    display_name character varying(255) NOT NULL,
    description text,
    route_path character varying(500),
    category character varying(100),
    icon character varying(100),
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.system_modules OWNER TO neondb_owner;

--
-- TOC entry 230 (class 1259 OID 24713)
-- Name: teacher_attendance; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.teacher_attendance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    teacher_id uuid NOT NULL,
    school_id uuid NOT NULL,
    attendance_date date NOT NULL,
    status character varying DEFAULT 'present'::character varying NOT NULL,
    reason text,
    leave_start_date date,
    leave_end_date date,
    is_full_day boolean DEFAULT true NOT NULL,
    marked_by character varying,
    marked_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.teacher_attendance OWNER TO neondb_owner;

--
-- TOC entry 231 (class 1259 OID 24724)
-- Name: teacher_replacements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.teacher_replacements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    original_teacher_id uuid NOT NULL,
    replacement_teacher_id uuid NOT NULL,
    school_id uuid NOT NULL,
    replacement_date timestamp without time zone NOT NULL,
    reason text NOT NULL,
    affected_timetable_entries integer DEFAULT 0 NOT NULL,
    conflict_details jsonb DEFAULT '{"hasConflicts": false}'::jsonb NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    replaced_by character varying NOT NULL,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.teacher_replacements OWNER TO neondb_owner;

--
-- TOC entry 232 (class 1259 OID 24735)
-- Name: teachers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.teachers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255),
    contact_number character varying(15),
    school_id_number character varying(50),
    subjects jsonb DEFAULT '[]'::jsonb NOT NULL,
    classes jsonb DEFAULT '[]'::jsonb NOT NULL,
    availability jsonb DEFAULT '{"friday": [], "monday": [], "tuesday": [], "saturday": [], "thursday": [], "wednesday": []}'::jsonb NOT NULL,
    max_load integer DEFAULT 30 NOT NULL,
    max_daily_periods integer DEFAULT 6 NOT NULL,
    school_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    status character varying DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    aadhar character varying(12),
    gender character varying,
    blood_group character varying(5),
    designation character varying(100),
    date_of_birth date,
    father_husband_name character varying(255),
    address text,
    category character varying(50),
    religion character varying(50),
    profile_picture_url character varying(500)
);


ALTER TABLE public.teachers OWNER TO neondb_owner;

--
-- TOC entry 233 (class 1259 OID 24750)
-- Name: timetable_changes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.timetable_changes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    timetable_entry_id uuid NOT NULL,
    change_type character varying NOT NULL,
    change_date date NOT NULL,
    original_teacher_id uuid,
    new_teacher_id uuid,
    original_room character varying(100),
    new_room character varying(100),
    reason text NOT NULL,
    change_source character varying NOT NULL,
    approved_by character varying,
    approved_at timestamp without time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.timetable_changes OWNER TO neondb_owner;

--
-- TOC entry 234 (class 1259 OID 24759)
-- Name: timetable_entries; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.timetable_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    day character varying NOT NULL,
    period integer NOT NULL,
    start_time character varying(5) NOT NULL,
    end_time character varying(5) NOT NULL,
    room character varying(100),
    version_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.timetable_entries OWNER TO neondb_owner;

--
-- TOC entry 235 (class 1259 OID 24768)
-- Name: timetable_structures; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.timetable_structures (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    school_id uuid NOT NULL,
    periods_per_day integer DEFAULT 8 NOT NULL,
    working_days jsonb DEFAULT '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]'::jsonb NOT NULL,
    time_slots jsonb DEFAULT '[{"period": 1, "endTime": "08:15", "startTime": "07:30"}, {"period": 2, "endTime": "09:00", "startTime": "08:15"}, {"period": 3, "endTime": "09:45", "startTime": "09:00"}, {"period": 4, "endTime": "10:15", "startTime": "09:45"}, {"period": 5, "endTime": "11:00", "isBreak": true, "startTime": "10:15"}, {"period": 6, "endTime": "11:45", "startTime": "11:00"}, {"period": 7, "endTime": "12:30", "startTime": "11:45"}, {"period": 8, "endTime": "13:15", "startTime": "12:30"}]'::jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.timetable_structures OWNER TO neondb_owner;

--
-- TOC entry 236 (class 1259 OID 24780)
-- Name: timetable_validity_periods; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.timetable_validity_periods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id uuid NOT NULL,
    valid_from date NOT NULL,
    valid_to date NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.timetable_validity_periods OWNER TO neondb_owner;

--
-- TOC entry 237 (class 1259 OID 24787)
-- Name: timetable_versions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.timetable_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id uuid NOT NULL,
    version character varying(10) NOT NULL,
    week_start date NOT NULL,
    week_end date NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.timetable_versions OWNER TO neondb_owner;

--
-- TOC entry 238 (class 1259 OID 24794)
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255),
    login_id character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    temporary_password character varying(255),
    temporary_password_expires_at timestamp without time zone,
    role character varying DEFAULT 'teacher'::character varying NOT NULL,
    is_first_login boolean DEFAULT true NOT NULL,
    school_id uuid,
    teacher_id uuid,
    student_id uuid,
    parent_id uuid,
    first_name character varying(255),
    last_name character varying(255),
    password_changed_at timestamp without time zone,
    last_login_at timestamp without time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_by character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    temporary_password_plain_text character varying(255)
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- TOC entry 239 (class 1259 OID 24805)
-- Name: weekly_timetables; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.weekly_timetables (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id uuid NOT NULL,
    week_start date NOT NULL,
    week_end date NOT NULL,
    timetable_data jsonb DEFAULT '[]'::jsonb NOT NULL,
    modified_by character varying NOT NULL,
    modification_count integer DEFAULT 1 NOT NULL,
    based_on_global_version character varying,
    school_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.weekly_timetables OWNER TO neondb_owner;

--
-- TOC entry 3652 (class 0 OID 24577)
-- Dependencies: 215
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.audit_logs (id, school_id, user_id, action, entity_type, entity_id, previous_values, new_values, description, created_at) FROM stdin;
2875ce9c-953c-4f01-82bd-3e091e18abe4	56619539-d75e-40ac-b263-9f25f8e3f46e	83772c0e-031f-4fa2-bd88-3c53d942cca4	auto_absence_detection	teacher_attendance	c35d7c98-31f7-4ae6-9fc6-9ef2382304b2	\N	\N	Automatic absence detection: 2025-09-25, No reason provided, 0 classes affected	2025-09-25 05:35:32.615424
\.


--
-- TOC entry 3653 (class 0 OID 24584)
-- Dependencies: 216
-- Data for Name: class_subject_assignments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.class_subject_assignments (id, class_id, subject_id, weekly_frequency, assigned_teacher_id, created_at, updated_at) FROM stdin;
5430b784-1cfd-486e-a02e-91df0b17aa86	409e8f2d-385c-4936-9f9d-2b9f36d78c44	63d6df33-624b-4f1e-bce0-f0c9b69be127	5	\N	2025-09-25 11:04:12.395935	2025-09-25 11:04:12.395935
8b788e31-179e-46c2-a5d9-f4068a9799d0	409e8f2d-385c-4936-9f9d-2b9f36d78c44	19c8a0a8-43f2-40a8-8175-238d5a72183e	5	\N	2025-09-25 11:04:12.625253	2025-09-25 11:04:12.625253
e5512f2a-dc9f-4096-9729-3c612d646a41	409e8f2d-385c-4936-9f9d-2b9f36d78c44	8471703a-7781-47f6-b9d2-a6b1c5cd26b8	5	\N	2025-09-25 11:04:12.855571	2025-09-25 11:04:12.855571
6c457bcb-eb0e-4ec7-80bc-83005dc8c44c	409e8f2d-385c-4936-9f9d-2b9f36d78c44	59c29aa2-7e48-4bab-bb6c-b74d713ce060	5	\N	2025-09-25 11:04:13.084872	2025-09-25 11:04:13.084872
49b56a4e-a671-4dda-9633-81bddce75af2	9edab9e8-d974-4475-9c30-857add11b6cf	e6127135-9fe0-448e-93f5-a59884bc0467	5	\N	2025-09-25 11:04:18.377459	2025-09-25 11:04:18.377459
2770cfba-1803-43fb-a5d7-e0fa1fd89b3f	9edab9e8-d974-4475-9c30-857add11b6cf	f341e58c-b8b1-40b9-bc44-4e0b126f1fda	5	\N	2025-09-25 11:04:18.606566	2025-09-25 11:04:18.606566
f0423bd8-e89a-482e-b39c-0ad102b9d904	9edab9e8-d974-4475-9c30-857add11b6cf	6db4659a-ea6a-4974-9610-8fee1377daa6	5	\N	2025-09-25 11:04:18.834639	2025-09-25 11:04:18.834639
6d8557e3-94d1-4ccf-ba96-9c42f69aeb41	9edab9e8-d974-4475-9c30-857add11b6cf	72f45b27-48f5-4015-9495-106239d50059	5	\N	2025-09-25 11:04:19.064075	2025-09-25 11:04:19.064075
4f969106-456e-4a74-ab62-9c85b7529956	9edab9e8-d974-4475-9c30-857add11b6cf	3ff8832b-3d37-4f61-a257-44d9915c2657	5	\N	2025-09-25 11:04:19.29359	2025-09-25 11:04:19.29359
\.


--
-- TOC entry 3654 (class 0 OID 24590)
-- Dependencies: 217
-- Data for Name: class_teacher_assignments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.class_teacher_assignments (id, class_id, teacher_id, role, is_primary, privileges, assigned_by, school_id, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3655 (class 0 OID 24601)
-- Dependencies: 218
-- Data for Name: classes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.classes (id, grade, section, student_count, required_subjects, school_id, room, created_at, updated_at) FROM stdin;
2f80a12e-1a86-4ede-9960-6ea27ed42255	5		0	[]	56619539-d75e-40ac-b263-9f25f8e3f46e	\N	2025-09-10 11:32:16.341	2025-09-10 11:32:16.341
8720feb3-bc9a-4b88-aa6b-fdf1c4a0b434	7		0	[]	56619539-d75e-40ac-b263-9f25f8e3f46e	\N	2025-09-10 11:32:26.884	2025-09-10 11:32:26.884
ee384b92-7966-47c9-84b7-fbc220e1b0c2	8		0	[]	56619539-d75e-40ac-b263-9f25f8e3f46e	\N	2025-09-10 11:32:31.777	2025-09-10 11:32:31.777
b94edb8f-987c-4588-8c88-a5be7475bba4	9		0	[]	56619539-d75e-40ac-b263-9f25f8e3f46e	\N	2025-09-10 11:32:37.408	2025-09-10 11:32:37.408
fe8a340b-0540-4ab6-83d0-8fd5b86eef47	10		0	[]	56619539-d75e-40ac-b263-9f25f8e3f46e	\N	2025-09-10 11:32:43.016	2025-09-10 11:32:43.016
1d6a1b90-1d0d-468b-8923-63204ffed12b	11	A 	0	[]	56619539-d75e-40ac-b263-9f25f8e3f46e	\N	2025-09-10 11:32:47.905	2025-09-10 11:32:47.905
0ec36da5-7d3d-4c3c-b655-cbca29e4b56a	11	B 	0	[]	56619539-d75e-40ac-b263-9f25f8e3f46e	\N	2025-09-10 11:32:52.813	2025-09-10 11:32:52.813
819ce02a-e464-4195-ac41-05d50581823e	11	C 	0	[]	56619539-d75e-40ac-b263-9f25f8e3f46e	\N	2025-09-10 11:32:54.035	2025-09-10 11:32:54.035
9b1407a4-659f-4c32-8bed-f81de1df460c	12	A	0	[]	56619539-d75e-40ac-b263-9f25f8e3f46e	\N	2025-09-10 11:32:59.392	2025-09-10 11:32:59.392
2d91fcab-434c-4fa7-88be-3638184065a8	12	B	0	[]	56619539-d75e-40ac-b263-9f25f8e3f46e	\N	2025-09-10 11:33:04.997	2025-09-10 11:33:04.997
3601c722-00eb-47fc-8d98-42926bb82f09	12	C	0	[]	56619539-d75e-40ac-b263-9f25f8e3f46e	\N	2025-09-10 11:33:05.484	2025-09-10 11:33:05.484
0ce93d17-efa8-4673-8967-e3a12424a0bc	12	D	0	[]	56619539-d75e-40ac-b263-9f25f8e3f46e	\N	2025-09-10 11:33:08.892	2025-09-10 11:33:08.892
409e8f2d-385c-4936-9f9d-2b9f36d78c44	14	B	0	"[\\"63d6df33-624b-4f1e-bce0-f0c9b69be127\\",\\"19c8a0a8-43f2-40a8-8175-238d5a72183e\\",\\"8471703a-7781-47f6-b9d2-a6b1c5cd26b8\\",\\"59c29aa2-7e48-4bab-bb6c-b74d713ce060\\"]"	56619539-d75e-40ac-b263-9f25f8e3f46e	\N	2025-09-25 11:04:12.16683	2025-09-25 11:04:12.16683
9edab9e8-d974-4475-9c30-857add11b6cf	15		0	"[\\"e6127135-9fe0-448e-93f5-a59884bc0467\\",\\"f341e58c-b8b1-40b9-bc44-4e0b126f1fda\\",\\"6db4659a-ea6a-4974-9610-8fee1377daa6\\",\\"72f45b27-48f5-4015-9495-106239d50059\\",\\"3ff8832b-3d37-4f61-a257-44d9915c2657\\"]"	56619539-d75e-40ac-b263-9f25f8e3f46e	\N	2025-09-25 11:04:18.148029	2025-09-25 11:04:18.148029
8fe95a2c-09d7-48d5-938a-7c0674fc0f96	2	A	2	[]	56619539-d75e-40ac-b263-9f25f8e3f46e		2025-09-10 11:31:54.951	2025-09-25 12:04:28.018
e342338b-6dfa-433d-9f06-1424184853ea	1		1	"[]"	56619539-d75e-40ac-b263-9f25f8e3f46e		2025-09-25 12:12:24.098864	2025-09-25 12:31:06.491
de0da21d-119e-4f55-a8fd-a486bc47ec15	3	A	1	[]	56619539-d75e-40ac-b263-9f25f8e3f46e		2025-09-10 11:32:02.811	2025-09-25 11:55:56.68
d69451ff-b641-4400-9437-97f8441c9fd2	2	B	0	"[]"	56619539-d75e-40ac-b263-9f25f8e3f46e		2025-09-25 12:04:28.627292	2025-09-25 12:04:28.627292
21eaca18-e6cf-4a5f-bea8-6b1d0948a96e	4		0	[]	56619539-d75e-40ac-b263-9f25f8e3f46e		2025-09-10 11:32:09.955	2025-09-25 12:04:41.321
\.


--
-- TOC entry 3656 (class 0 OID 24611)
-- Dependencies: 219
-- Data for Name: manual_assignment_audits; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.manual_assignment_audits (id, timetable_entry_id, class_id, day, period, old_teacher_id, new_teacher_id, subject_id, change_reason, assigned_by, assigned_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3657 (class 0 OID 24621)
-- Dependencies: 220
-- Data for Name: parents; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.parents (id, first_name, last_name, email, contact_number, alternate_contact, address, occupation, relation_to_student, school_id, is_active, created_at, updated_at) FROM stdin;
27587139-ecb9-4a17-bb1a-92588c861c29	Amit	Kumar		7389309292	\N	ww	www	father	56619539-d75e-40ac-b263-9f25f8e3f46e	t	2025-09-21 16:01:25.337	2025-09-21 16:01:25.337
e96288e0-4923-478c-b6aa-c76c6d05e6d7	Amit	Sharma		9821039494		se		father	56619539-d75e-40ac-b263-9f25f8e3f46e	t	2025-09-21 17:23:32.129	2025-09-21 17:23:32.129
042b3872-df07-4932-9a3f-9fc7e3f507fc	Rani	Sharma		9810939082		e34r		mother	56619539-d75e-40ac-b263-9f25f8e3f46e	t	2025-09-21 17:24:04.074	2025-09-21 17:24:04.074
\.


--
-- TOC entry 3658 (class 0 OID 24630)
-- Dependencies: 221
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.posts (id, content, attachments, posted_by_id, feed_scope, class_id, school_id, is_active, created_at, updated_at) FROM stdin;
2bee20c3-dbff-4100-af00-7e1b7ecdab79	Hey man bg	[]	83772c0e-031f-4fa2-bd88-3c53d942cca4	school	\N	56619539-d75e-40ac-b263-9f25f8e3f46e	t	2025-09-20 19:31:05.378	2025-09-20 19:50:23.203
1c5a9071-a65b-420e-be4d-9a62ce13b3fc	free	["9c001778-e07a-430e-b444-9ec53c7f1245"]	83772c0e-031f-4fa2-bd88-3c53d942cca4	school	\N	56619539-d75e-40ac-b263-9f25f8e3f46e	t	2025-09-20 20:09:32.076	2025-09-20 20:09:32.076
333df269-f861-4c61-aa6d-2afaa437eadb		["6bd031aa-2148-4d02-896d-d04e07cd25ff"]	83772c0e-031f-4fa2-bd88-3c53d942cca4	school	\N	56619539-d75e-40ac-b263-9f25f8e3f46e	t	2025-09-20 20:18:12.909	2025-09-20 20:18:12.909
dd35605b-dcdd-4133-860f-b5f75fb890de	Resume	["7df689cf-1ed8-444e-b90b-c12c2ef2afe9"]	83772c0e-031f-4fa2-bd88-3c53d942cca4	school	\N	56619539-d75e-40ac-b263-9f25f8e3f46e	t	2025-09-20 20:41:04.85	2025-09-20 20:41:04.85
8ca7cbdf-be16-4612-9f0e-d743a3041b6b		[{"fileId": "1cc7e3ab-9900-4ca1-bfa4-5111fb069780", "filename": "Satyarth Shukla.pdf", "mimetype": "application/pdf"}]	83772c0e-031f-4fa2-bd88-3c53d942cca4	school	\N	56619539-d75e-40ac-b263-9f25f8e3f46e	t	2025-09-20 21:08:33.602	2025-09-20 21:08:33.602
e6682cf2-7917-47af-abf8-ee5a7e9868c7	Hi	[{"fileId": "06079ec8-2065-4d59-82a6-f00644a7966f", "filename": "A.png", "mimetype": "image/png"}, {"fileId": "3952418c-5083-4e62-a59b-cd4ed467b6b6", "filename": "1_org_zoom.webp", "mimetype": "image/webp"}]	83772c0e-031f-4fa2-bd88-3c53d942cca4	school	\N	56619539-d75e-40ac-b263-9f25f8e3f46e	t	2025-09-23 10:15:34.99	2025-09-23 10:15:34.99
80c62ec7-b768-4dd8-b52a-ffc2435a4980	This is from some bla event	[{"fileId": "50272a72-c761-421f-8bfa-a57843fb17dd", "filename": "chronaa logo.png", "mimetype": "image/png"}, {"fileId": "18f8cd20-3831-498c-8a80-2d22481309e3", "filename": "aichrona.png", "mimetype": "image/png"}, {"fileId": "65f95404-c8ea-4c31-b9d0-91519e4c345f", "filename": "A.png", "mimetype": "image/png"}]	83772c0e-031f-4fa2-bd88-3c53d942cca4	school	\N	56619539-d75e-40ac-b263-9f25f8e3f46e	t	2025-09-23 10:50:52.29	2025-09-23 10:50:52.29
\.


--
-- TOC entry 3659 (class 0 OID 24640)
-- Dependencies: 222
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.role_permissions (id, school_id, role, module_id, permissions, is_active, assigned_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3660 (class 0 OID 24650)
-- Dependencies: 223
-- Data for Name: schools; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.schools (id, name, address, contact_phone, admin_name, is_active, timetable_frozen, created_at, updated_at) FROM stdin;
56619539-d75e-40ac-b263-9f25f8e3f46e	DPS	Delhi	9810560800	Aabhi	t	f	2025-09-10 11:28:32.569	2025-09-10 17:46:27.31
\.


--
-- TOC entry 3661 (class 0 OID 24660)
-- Dependencies: 224
-- Data for Name: student_attendance; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.student_attendance (id, student_id, school_id, class_id, attendance_date, status, reason, marked_by, marked_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3662 (class 0 OID 24670)
-- Dependencies: 225
-- Data for Name: student_parents; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.student_parents (id, student_id, parent_id, is_primary, created_at) FROM stdin;
\.


--
-- TOC entry 3663 (class 0 OID 24676)
-- Dependencies: 226
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.students (id, admission_number, first_name, last_name, email, contact_number, date_of_birth, gender, address, class_id, school_id, roll_number, blood_group, guardian_name, guardian_relation, guardian_contact, emergency_contact, medical_info, is_active, status, created_at, updated_at, profile_picture_url) FROM stdin;
16bae4cf-981d-43c4-88fe-609cc70844aa	12345	Kallu	Doe	john.doe@student.com	9876543218	2008-05-15	male	123 Main Street, City	de0da21d-119e-4f55-a8fd-a486bc47ec15	56619539-d75e-40ac-b263-9f25f8e3f46e	1	O+	\N	\N	\N	9876543211	\N	t	active	2025-09-25 09:04:14.166853	2025-09-25 09:04:14.166853	\N
fd66e9e5-f8ba-4cd3-8335-7b0b834e2b64	123	Abhishek	Sharma	abhi@gmail.com	9810560800	1993-07-25	male	Jaypee Aman	\N	56619539-d75e-40ac-b263-9f25f8e3f46e	0	A+					\N	t	active	2025-09-21 15:59:46.007	2025-09-25 12:43:34.849124	\N
b2c25ad1-1851-4989-b985-4f4a1c9dfbd2	ADM001	John	Doe	john.doe@example.com	9876543210	2010-05-15	male	123 Main Street, City	\N	56619539-d75e-40ac-b263-9f25f8e3f46e	0	A+	\N	\N	\N	9876543210	\N	t	active	2025-09-22 09:19:10.428	2025-09-25 12:43:34.849124	\N
e8b818bd-983e-425c-aa02-c695fd0e0eb3	STU0016	Kallu	Doe	john.doe1@student.com	9876543219	2008-05-15	male	123 Main Street, City	\N	56619539-d75e-40ac-b263-9f25f8e3f46e	0	O+	\N	\N	\N	9876543211	\N	t	active	2025-09-25 09:04:13.405285	2025-09-25 12:43:34.849124	\N
94413985-c424-4c51-92f7-b36b78b7c5bd	ADM002	Aabhi	Doe	john.doe@example.com	9876543211	2010-05-15	male	123 Main Street, City	8fe95a2c-09d7-48d5-938a-7c0674fc0f96	56619539-d75e-40ac-b263-9f25f8e3f46e	2	A+	\N	\N	\N		\N	t	active	2025-09-22 09:19:10.727	2025-09-25 13:24:09.071	/api/students/94413985-c424-4c51-92f7-b36b78b7c5bd/profile-picture/22237e70-fbde-430e-9892-0981d83196eb.jpg
3c77c9ef-d49d-4527-ad95-80d6ff48aa09	ADM003	Sur	Doe	john.doe@example.com	9876543212	2010-05-15	male	123 Main Street, City	8fe95a2c-09d7-48d5-938a-7c0674fc0f96	56619539-d75e-40ac-b263-9f25f8e3f46e	4	A+	\N	\N	\N		\N	t	active	2025-09-22 09:19:11.02	2025-09-25 13:32:31.516	/api/students/3c77c9ef-d49d-4527-ad95-80d6ff48aa09/profile-picture/5b395a65-f4d2-4cfb-a900-3958808d54f0.png
f471bad1-2f07-417d-a949-25830a1d3a33	ADM004	Lucky	Doe	john.doe@example.com	9876543213	2010-05-15	female	123 Main Street, City	e342338b-6dfa-433d-9f06-1424184853ea	56619539-d75e-40ac-b263-9f25f8e3f46e	0	A+	\N	\N	\N		\N	t	active	2025-09-22 09:19:11.313	2025-09-25 13:41:57.598	/api/students/f471bad1-2f07-417d-a949-25830a1d3a33/profile-picture/aee9b0bb-bfbe-45e9-b620-c2b74f721a7f.JPG
\.


--
-- TOC entry 3664 (class 0 OID 24686)
-- Dependencies: 227
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.subjects (id, name, code, periods_per_week, color, school_id, created_at, updated_at) FROM stdin;
828a440e-b788-4eed-a47a-7b78ece6dd76	EVS	EVS1	5	#84CC16	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:31:47.581	2025-09-10 11:31:47.581
ec21e691-ec6f-4ea4-8012-2eaf8a67a33b	Games	GAM1	5	#10B981	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:31:48.323	2025-09-10 11:31:48.323
c1598350-46ff-4be5-aee9-bb705e4e39cc	Art & Craft	ART1	5	#14B8A6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:31:49.06	2025-09-10 11:31:49.06
d3db7e57-ff69-4e8a-a629-eefffdb059db	Music/Dance	MUS1	5	#D97706	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:31:49.795	2025-09-10 11:31:49.795
7c74838b-65aa-4ac1-a4d9-e475feb3ddfa	English	ENG1	5	#84CC16	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:31:50.532	2025-09-10 11:31:50.532
6aeab6a4-3ec3-4840-b4b3-e05887e68ba1	Hindi	HIN1	5	#7C3AED	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:31:51.267	2025-09-10 11:31:51.267
9dd8dcc6-25ad-4a73-b28e-3c5fda344a59	GK	GK1	5	#06B6D4	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:31:52.003	2025-09-10 11:31:52.003
f3225b24-3710-43c8-87d1-6e428b7f39b6	Reading	REA1	5	#2563EB	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:31:52.739	2025-09-10 11:31:52.739
c0c5b224-9483-44c3-b65e-b6a7db1fec23	SSC	SSC1	5	#10B981	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:31:53.475	2025-09-10 11:31:53.475
5ecbfc2a-e224-41b5-b3ef-54259ff4f196	Science	SCI1	5	#7C3AED	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:31:54.214	2025-09-10 11:31:54.214
8a5c8e7f-0a09-4346-90b5-72e1480ec1d7	Maths	MAT2	5	#F97316	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:31:55.442	2025-09-10 11:31:55.442
8888cac9-78bb-4856-b17b-f30e99e0f324	Games	GAM2	5	#F59E0B	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:31:56.179	2025-09-10 11:31:56.179
52bf58c7-e6e5-49b2-a2b0-3400be2e876a	Art & Craft	ART2	5	#DC2626	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:31:56.916	2025-09-10 11:31:56.916
16a6679f-3705-462b-b22a-7d5d13428026	EVS	EVS2	5	#EC4899	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:31:57.654	2025-09-10 11:31:57.654
c436a3db-a897-41e7-a2bf-94ad98044bc0	Hindi	HIN2	5	#059669	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:31:58.391	2025-09-10 11:31:58.391
93dcecad-5e6d-4c55-a8bb-2395e5cd7f86	GK	GK2	5	#F97316	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:31:59.128	2025-09-10 11:31:59.128
5b56620d-571c-4e2a-9f5b-e0c59988b4f4	English	ENG2	5	#EC4899	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:31:59.865	2025-09-10 11:31:59.865
c661b7f8-45bb-4e38-80e7-c17df0da5de4	Sanskrit	SAN2	5	#F97316	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:00.602	2025-09-10 11:32:00.602
2ba95ea2-f130-4035-9cfb-a86573b03c7e	SSC	SSC2	5	#F59E0B	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:01.338	2025-09-10 11:32:01.338
bf6f3a03-eb45-4867-8675-5ece5b01752d	Computer	COM2	5	#059669	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:02.075	2025-09-10 11:32:02.075
fd5f6dd9-7628-4954-a011-25c8f131e335	Music/Dance	MUS3	5	#BE123C	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:03.327	2025-09-10 11:32:03.327
19ecbebb-8a82-4562-be80-f9931758faf8	Games	GAM3	5	#8B5CF6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:04.063	2025-09-10 11:32:04.063
f5589e32-4395-4f0d-a521-d3e454d8b5fd	Maths	MAT3	5	#84CC16	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:04.799	2025-09-10 11:32:04.799
450ad356-5a06-47af-9c6d-c8c76dcb447f	EVS	EVS3	5	#6366F1	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:05.535	2025-09-10 11:32:05.535
f1aef8f2-418a-48fa-b16f-1c1fe5b3c08f	Hindi	HIN3	5	#D97706	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:06.272	2025-09-10 11:32:06.272
917d310a-f997-4c26-8c18-095a6a28bf92	GK	GK3	5	#84CC16	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:07.013	2025-09-10 11:32:07.013
06166c59-8068-41fb-8df1-6ebf8c043a60	SSC	SSC3	5	#8B5CF6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:07.749	2025-09-10 11:32:07.749
40334db2-4456-49c8-9ba7-02cdeff4d160	Science	SCI3	5	#D97706	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:08.484	2025-09-10 11:32:08.484
8532cae6-0176-458e-8819-b598fd162cf8	English	ENG3	5	#6366F1	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:09.22	2025-09-10 11:32:09.22
bb31ad53-f699-41b4-a7a5-7c9db34855c6	English	ENG4	5	#14B8A6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:10.447	2025-09-10 11:32:10.447
4c9cc83d-3a4e-4f8c-b725-cbfce1015e48	Hindi	HIN4	5	#2563EB	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:11.184	2025-09-10 11:32:11.184
2b146be9-48b8-4ab7-a886-dca27744c852	Art & Craft	ART4	5	#059669	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:11.921	2025-09-10 11:32:11.921
1b0221d1-c308-4d8b-a6fe-22c817c3f089	GK	GK4	5	#EC4899	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:12.656	2025-09-10 11:32:12.656
9d3daa8a-4b13-47fc-97cb-3d9560fc7bc0	Computer	COM4	5	#2563EB	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:13.393	2025-09-10 11:32:13.393
8fb87beb-0c7a-4e7d-92d7-7f231fdf29d0	Reading	REA4	5	#CA8A04	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:14.138	2025-09-10 11:32:14.138
caffae49-2e45-49ef-83b4-bbaf3a324c87	SSC	SSC4	5	#06B6D4	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:14.873	2025-09-10 11:32:14.873
0a118017-ccd6-4cef-8b44-990f868febc5	Sanskrit	SAN4	5	#EC4899	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:15.607	2025-09-10 11:32:15.607
c5b08eee-5566-44b5-bbeb-a168180dded8	Computer	COM5	5	#BE123C	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:16.835	2025-09-10 11:32:16.835
f34bcc8f-72cb-45d7-a61d-9235d100bff7	Reading	REA5	5	#9333EA	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:17.57	2025-09-10 11:32:17.57
761cee2e-4a27-4685-957a-cbfbff65eb36	GK	GK5	5	#6366F1	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:18.308	2025-09-10 11:32:18.308
325ad67c-4952-45c0-b42e-01c03b479488	Hindi	HIN5	5	#BE123C	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:19.042	2025-09-10 11:32:19.042
59453374-f088-4afa-8ab3-1d0305401268	Music/Dance	MUS5	5	#CA8A04	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:19.777	2025-09-10 11:32:19.777
f62b19cb-eeff-40a6-9243-4e4154571dce	SSC	SSC5	5	#F97316	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:20.512	2025-09-10 11:32:20.512
43788e8f-4a3f-4a31-b696-fe9989131215	Maths	MAT5	5	#6366F1	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:21.247	2025-09-10 11:32:21.247
77af0dc4-a83f-4e42-9a9a-43f9bd99cc8a	Music/Dance	MUS6	5	#9333EA	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:22.472	2025-09-10 11:32:22.472
75112528-3cac-4031-895c-1333e0a120fe	SSC	SSC6	5	#84CC16	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:23.206	2025-09-10 11:32:23.206
7c56e0cd-ed2b-4a15-a6e2-827d20f803ab	English	ENG6	5	#7C3AED	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:23.943	2025-09-10 11:32:23.943
80f8c37e-d420-4885-9124-374511450884	Games	GAM6	5	#84CC16	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:24.678	2025-09-10 11:32:24.678
edb2b1ca-0fa1-48ef-86f7-03a2df569890	Science	SCI6	5	#0891B2	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:25.413	2025-09-10 11:32:25.413
0b785e05-ed14-462f-9896-c3aeb924e207	Maths	MAT6	5	#14B8A6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:26.148	2025-09-10 11:32:26.148
ed5ce3fb-4dda-45ce-ac52-118e05dda0e1	Art & Craft	ART7	5	#BE123C	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:27.374	2025-09-10 11:32:27.374
9c80e3a1-aeb1-411a-8411-cbe0388e370d	English	ENG7	5	#059669	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:28.108	2025-09-10 11:32:28.108
e11dda60-c2d6-49bc-8fbb-d0aeecafba17	Science	SCI7	5	#CA8A04	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:28.843	2025-09-10 11:32:28.843
86494ce3-d2d1-430b-a0ed-d4d71dcc367f	Computer	COM7	5	#CA8A04	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:29.578	2025-09-10 11:32:29.578
a2feeaa0-fac7-4c0a-aa0b-accff1660000	Hindi	HIN7	5	#CA8A04	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:30.313	2025-09-10 11:32:30.313
4f68fa8f-282c-4b81-9ee0-3249bbb890b4	SSC	SSC7	5	#EC4899	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:31.046	2025-09-10 11:32:31.046
0f452033-cb28-4b2e-a2c7-b35f00e3c1a4	Maths	MAT8	5	#7C3AED	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:32.267	2025-09-10 11:32:32.267
add57017-f045-4925-9cb6-be0a2b08becb	Hindi	HIN8	5	#9333EA	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:32.999	2025-09-10 11:32:32.999
9f104e2a-3936-4d7e-b0d8-f0b1b83cf7c3	English	ENG8	5	#D97706	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:33.73	2025-09-10 11:32:33.73
7955ddfb-5860-41a3-beb6-8142ba8561dd	Sanskrit	SAN8	5	#7C3AED	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:34.465	2025-09-10 11:32:34.465
38d6e9f3-bfdc-4996-8713-465a9dc8eb8b	SSC	SSC8	5	#6366F1	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:35.196	2025-09-10 11:32:35.196
e13b779b-f7f4-4d7f-b530-5ddee88ef565	Science	SCI8	5	#9333EA	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:35.927	2025-09-10 11:32:35.927
8d1d3a8a-aa8d-4e20-9a6f-ebebed2bf44f	Art & Craft	ART8	5	#0891B2	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:36.677	2025-09-10 11:32:36.677
a1006a15-cd41-4136-844b-52fd6bd37498	Hindi	HIN9	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:37.896	2025-09-10 11:32:37.896
df29eb8a-15a9-4987-b5df-b2f066186dd4	IT	IT9	5	#D97706	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:38.627	2025-09-10 11:32:38.627
20254722-860f-418e-94cf-df1cf2a6e080	SSC	SSC9	5	#14B8A6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:39.359	2025-09-10 11:32:39.359
b08fb629-7be9-48d1-8427-55157d74177a	Physics	PHY9	5	#EC4899	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:40.09	2025-09-10 11:32:40.09
69987bd0-4f25-43de-99bf-8cf2a592ffa9	Biology	BIO9	5	#06B6D4	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:40.822	2025-09-10 11:32:40.822
19c50891-0b8f-4a17-ba97-0a397c1b2e89	Mathematics	MAT9	5	#059669	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:41.554	2025-09-10 11:32:41.554
93feaf33-a905-4311-9a44-03a094386e2a	English	ENG9	5	#2563EB	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:42.284	2025-09-10 11:32:42.284
985dd99f-96e7-472c-b047-95741daeb36b	Mathematics	MAT10	5	#F59E0B	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:43.502	2025-09-10 11:32:43.502
355e7dcf-4fdc-4a9d-9371-8c617fec3ee0	SSC	SSC10	5	#14B8A6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:44.233	2025-09-10 11:32:44.233
05d57726-277f-4660-b237-26c6c6706123	IT	IT10	5	#D97706	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:44.964	2025-09-10 11:32:44.964
b8c5eff9-447d-4a33-9eb7-7793722dec07	Biology	BIO10	5	#2563EB	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:45.702	2025-09-10 11:32:45.702
fe6cd18a-7d67-4edb-95b3-1b2e113edbe2	English	ENG10	5	#06B6D4	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:46.445	2025-09-10 11:32:46.445
5a595289-bdb0-4f69-bfd6-4076aecac57b	Economics	ECO10	5	#7C3AED	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:47.175	2025-09-10 11:32:47.175
e12c8e97-9930-4869-b5e6-7d981832e3ff	English	ENG11	5	#F97316	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:48.392	2025-09-10 11:32:48.392
a3b5a247-578c-40d2-a2c2-2048df62d3c1	Physical Education	PHY11	5	#6366F1	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:49.123	2025-09-10 11:32:49.123
097aec94-90e3-4f00-91a1-cb7b981ffaa9	BST	BST11	5	#DC2626	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:49.854	2025-09-10 11:32:49.854
bceadf52-73f8-43b6-ad58-f38089bef91d	Accounts	ACC11	5	#0891B2	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:50.587	2025-09-10 11:32:50.587
37022d2a-eac2-4e6c-a53e-f834a53655b0	IT	IT11	5	#2563EB	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:51.344	2025-09-10 11:32:51.344
f0ca85c0-e054-453a-89ac-86a5c1138236	Economics	ECO11	5	#059669	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:52.08	2025-09-10 11:32:52.08
f5850846-0f24-4d04-8303-84a020b80050	Political Science	POL11	5	#059669	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:53.303	2025-09-10 11:32:53.303
0e835d9a-da8c-48bd-82eb-0702cba170db	Mathematics	MAT11	5	#8B5CF6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:54.522	2025-09-10 11:32:54.522
32a2242a-3712-4944-99eb-f286a4af79b5	Physics	PHY11_1	5	#DC2626	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:55.496	2025-09-10 11:32:55.496
40f8582c-aee3-4d9f-8552-39fa87764942	Chemistry	CHE11	5	#BE123C	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:56.228	2025-09-10 11:32:56.228
07f2c00b-6e0b-47f9-b20a-8c2414486a43	Phy Practical	PHY11_2	5	#7C3AED	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:57.444	2025-09-10 11:32:57.444
2e080406-1d7e-4c84-97d3-4c28314316a1	Biology	BIO11	5	#BE123C	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:58.662	2025-09-10 11:32:58.662
bef16307-aaa7-493d-a86c-26ebfc32cd4c	Economics	ECO12	5	#D97706	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:32:59.879	2025-09-10 11:32:59.879
88993248-fa38-4691-9dcf-ff00affc15aa	Accounts	ACC12	5	#CA8A04	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:33:00.611	2025-09-10 11:33:00.611
1bceaa7b-e0c7-4e3f-a29c-3824abb9764b	English	ENG12	5	#84CC16	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:33:01.341	2025-09-10 11:33:01.341
000e26e1-8556-4aa7-aab4-c4a26d44bb28	IT	IT12	5	#BE123C	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:33:02.072	2025-09-10 11:33:02.072
ed6b039c-9bc9-42a5-ac86-97a29ff53f95	BST	BST12	5	#7C3AED	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:33:02.804	2025-09-10 11:33:02.804
ce2663ea-f235-4f5f-a4cd-e5a67ea43156	Physical Education	PHY12	5	#14B8A6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:33:03.535	2025-09-10 11:33:03.535
7eacbb3d-7f70-4f13-9eaf-76beab1b1251	Music/Dance	MUS12	5	#8B5CF6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:33:04.266	2025-09-10 11:33:04.266
29ac008f-a8c1-48b7-ad52-da26789f9539	Physics	PHY12_1	5	#7C3AED	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:33:06.214	2025-09-10 11:33:06.214
648a83d9-0b75-400d-8ceb-4710068efa96	Chemistry	CHE12	5	#0891B2	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:33:06.944	2025-09-10 11:33:06.944
a70ecc67-e2b9-4b64-8efb-eada18e2b2cf	Phy Practical	PHY12_2	5	#059669	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:33:08.162	2025-09-10 11:33:08.162
a1e876f0-f3ca-4a07-be80-83cc4597847a	Biology	BIO12	5	#0891B2	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:33:09.379	2025-09-10 11:33:09.379
5f58402d-c16d-4af2-b20e-afc597fe9ad8	Chemistry Practical	CHE12_1	5	#84CC16	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-10 11:33:10.353	2025-09-10 11:33:10.353
195306a2-6dc8-4125-bca8-6a64b9023d22	Hindi	HINDI	4	#D97706	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-21 13:30:29.977	2025-09-21 13:30:29.977
786d2ef2-7281-4aea-bbe8-0cce3ffd529d	Science	SCIENCE	4	#7C3AED	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:20:43.602861	2025-09-25 10:20:43.602861
6fe3b965-9d50-4184-87fd-924ec2d497e6	Science Practical	SCIENCEP	4	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:21:01.056971	2025-09-25 10:21:01.056971
54c0813f-61ee-45c2-aa0c-e26fbd7ce923	History	HIST547	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:28:54.861584	2025-09-25 10:28:54.861584
a58da588-cc37-46b8-ad1d-b3df2485c699	Geography	GEOG619	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:28:55.528197	2025-09-25 10:28:55.528197
ac4aabd4-1983-48d6-a565-c897f736647e	GK	GK	4	#BE123C	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:40:08.649252	2025-09-25 10:40:08.649252
87760aaf-a625-4946-a70b-8d5a6faa32be	GK Prac	GKPRAC	4	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:40:19.227019	2025-09-25 10:40:19.227019
52f24241-ac94-4364-940e-923bea8d27cc	GK	GK6	4	#14B8A6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:40:33.308287	2025-09-25 10:40:33.308287
f7035644-0e83-4acf-898a-f3c2a7341d49	Mathematics	MATH293	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:47:10.377132	2025-09-25 10:47:10.377132
b7c5581d-5b5b-4663-ad2a-c8d0eefbe989	Science	SCIE856	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:47:10.610157	2025-09-25 10:47:10.610157
8658f6c5-161e-435b-bbb7-348b5aa75a9d	English	ENGL238	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:47:10.826051	2025-09-25 10:47:10.826051
79fe2011-9263-4ac1-adca-d388ed7f4f28	History	HIST755	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:47:11.042333	2025-09-25 10:47:11.042333
7f3df275-9027-4b3c-b0a4-d630d26fb445	Mathematics	MATH717	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:47:12.346582	2025-09-25 10:47:12.346582
11064233-87cc-4a35-9bcc-fd3bf1a028da	Science	SCIE583	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:47:12.562376	2025-09-25 10:47:12.562376
a4989d85-8cb0-4c4e-b885-8ec31f577b79	English	ENGL681	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:47:12.779243	2025-09-25 10:47:12.779243
b9dc1d0f-ca76-4239-881f-55165136f63e	History	HIST348	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:47:12.994855	2025-09-25 10:47:12.994855
54aa4a21-6e70-4483-a016-7c5f3df0824a	Mathematics	MATH785	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:47:14.291127	2025-09-25 10:47:14.291127
988343d1-3b7b-4547-a6ab-605cba846a69	Science	SCIE620	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:47:14.506288	2025-09-25 10:47:14.506288
51e7a2d3-509c-477b-b567-d7033cdea7c3	English	ENGL860	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:47:14.722061	2025-09-25 10:47:14.722061
3113394d-a882-4b94-90c7-81d494eac7b6	History	HIST925	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:47:14.9385	2025-09-25 10:47:14.9385
064f4545-ef39-4c15-94cd-ed0d2cdf00ec	Geography	GEOG915	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:47:15.154972	2025-09-25 10:47:15.154972
742be221-0832-49d4-aace-f5fafa2e0b1e	Mathematics	MATH309	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:47:16.66598	2025-09-25 10:47:16.66598
ade5f0c3-8378-450a-8984-df632dd01643	Science	SCIE767	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:47:16.881571	2025-09-25 10:47:16.881571
5f68161b-6a22-4b2a-82bf-46ac006b5e9a	English	ENGL825	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:47:17.097335	2025-09-25 10:47:17.097335
875d4b47-d6e0-4974-b80c-b14bd2ef5030	History	HIST220	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:47:17.313087	2025-09-25 10:47:17.313087
e413d2cc-d756-43c6-8759-26b38e47c216	Geography	GEOG646	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:47:17.529106	2025-09-25 10:47:17.529106
da19336d-70c5-4c02-b7f7-ff84bc923b3e	GK	GK7	4	#DC2626	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 10:48:32.247815	2025-09-25 10:48:32.247815
32337684-41e9-4a0c-99fe-34e02d82540e	Mathematics	MATH441	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 11:04:08.92793	2025-09-25 11:04:08.92793
ef5b407f-cf78-4dfe-8b71-3ff97182c69e	History	HIST133	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 11:04:09.860062	2025-09-25 11:04:09.860062
63d6df33-624b-4f1e-bce0-f0c9b69be127	Mathematics	MATH981	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 11:04:11.246414	2025-09-25 11:04:11.246414
19c8a0a8-43f2-40a8-8175-238d5a72183e	Science	SCIE704	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 11:04:11.475949	2025-09-25 11:04:11.475949
8471703a-7781-47f6-b9d2-a6b1c5cd26b8	English	ENGL239	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 11:04:11.705313	2025-09-25 11:04:11.705313
59c29aa2-7e48-4bab-bb6c-b74d713ce060	History	HIST530	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 11:04:11.93615	2025-09-25 11:04:11.93615
eafbe20f-c7f6-4160-b3e7-e9b297814420	Mathematics	MATH593	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 11:04:13.549158	2025-09-25 11:04:13.549158
57e09745-ce6b-4ee2-8bce-c4a27ea20c2b	Science	SCIE617	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 11:04:14.007018	2025-09-25 11:04:14.007018
d18cbbb9-8aa6-4c96-ada5-d0ace6a2d3eb	English	ENGL600	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 11:04:14.469247	2025-09-25 11:04:14.469247
e3975890-c05a-456d-a3c7-020f230adcad	History	HIST418	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 11:04:14.926848	2025-09-25 11:04:14.926848
c8e20a9f-25f7-4f39-bc4d-96ac7f91bad9	Geography	GEOG236	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 11:04:15.39078	2025-09-25 11:04:15.39078
e6127135-9fe0-448e-93f5-a59884bc0467	Mathematics	MATH369	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 11:04:17.000316	2025-09-25 11:04:17.000316
f341e58c-b8b1-40b9-bc44-4e0b126f1fda	Science	SCIE348	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 11:04:17.230116	2025-09-25 11:04:17.230116
6db4659a-ea6a-4974-9610-8fee1377daa6	English	ENGL100	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 11:04:17.459308	2025-09-25 11:04:17.459308
72f45b27-48f5-4015-9495-106239d50059	History	HIST550	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 11:04:17.688455	2025-09-25 11:04:17.688455
3ff8832b-3d37-4f61-a257-44d9915c2657	Geography	GEOG948	5	#3B82F6	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25 11:04:17.917855	2025-09-25 11:04:17.917855
\.


--
-- TOC entry 3665 (class 0 OID 24693)
-- Dependencies: 228
-- Data for Name: substitutions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.substitutions (id, original_teacher_id, substitute_teacher_id, timetable_entry_id, date, reason, status, is_auto_generated, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3666 (class 0 OID 24703)
-- Dependencies: 229
-- Data for Name: system_modules; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.system_modules (id, name, display_name, description, route_path, category, icon, is_active, sort_order, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3667 (class 0 OID 24713)
-- Dependencies: 230
-- Data for Name: teacher_attendance; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.teacher_attendance (id, teacher_id, school_id, attendance_date, status, reason, leave_start_date, leave_end_date, is_full_day, marked_by, marked_at, created_at, updated_at) FROM stdin;
96c2fc18-6c0a-4d7b-88f4-b9a6902033be	f5863835-43b8-4752-9680-5ff4c324a77d	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-22	absent	\N	\N	\N	t	83772c0e-031f-4fa2-bd88-3c53d942cca4	2025-09-22 14:22:07	2025-09-22 14:22:00.467	2025-09-22 14:22:00.467
e42bf6da-7e6f-482c-a4fb-62ffd0c592c2	e16bc629-5fb9-41aa-948c-a36495b39978	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-22	late	\N	\N	\N	t	83772c0e-031f-4fa2-bd88-3c53d942cca4	2025-09-22 14:47:58	2025-09-22 14:47:00.644	2025-09-22 14:47:00.644
b5e78c2e-7e96-4d08-a1f3-783c2ecdf1e6	c35d7c98-31f7-4ae6-9fc6-9ef2382304b2	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-22	late	\N	\N	\N	t	83772c0e-031f-4fa2-bd88-3c53d942cca4	2025-09-22 14:48:54	2025-09-22 14:22:23.538	2025-09-22 14:22:23.538
69480933-3a48-43ee-8b3c-eae371a86480	db0fb0b8-83bb-40af-a1a1-4dee6a07195e	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-22	present	\N	\N	\N	t	83772c0e-031f-4fa2-bd88-3c53d942cca4	2025-09-22 14:49:02	2025-09-22 14:48:21.891	2025-09-22 14:48:21.891
76fa2866-b08f-485b-a705-3cf3a7bad326	e16bc629-5fb9-41aa-948c-a36495b39978	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-21	present	\N	\N	\N	t	83772c0e-031f-4fa2-bd88-3c53d942cca4	2025-09-22 14:50:00.325	2025-09-22 14:50:00.325	2025-09-22 14:50:00.325
3538760a-63b6-4e3a-b905-0972772dad76	e16bc629-5fb9-41aa-948c-a36495b39978	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25	present	\N	\N	\N	t	83772c0e-031f-4fa2-bd88-3c53d942cca4	2025-09-22 14:50:14.228	2025-09-22 14:50:14.228	2025-09-22 14:50:14.228
c1439e54-9364-4356-b047-f25573564b4b	f5863835-43b8-4752-9680-5ff4c324a77d	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-21	late	\N	\N	\N	t	83772c0e-031f-4fa2-bd88-3c53d942cca4	2025-09-22 14:50:31.568	2025-09-22 14:50:31.568	2025-09-22 14:50:31.568
99596a11-b8ec-43dd-98fd-f7a6af1b5065	e16bc629-5fb9-41aa-948c-a36495b39978	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-24	present	\N	\N	\N	t	83772c0e-031f-4fa2-bd88-3c53d942cca4	2025-09-22 14:51:11.399	2025-09-22 14:51:11.399	2025-09-22 14:51:11.399
c8bae2a0-ec7e-48d5-9cb0-97fbd71229f6	291d030e-b3b6-4f87-9e24-8def83a641a9	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-18	present	\N	\N	\N	t	83772c0e-031f-4fa2-bd88-3c53d942cca4	2025-09-22 15:06:44.79	2025-09-22 15:06:44.79	2025-09-22 15:06:44.79
a8b3fb33-a358-46db-91f6-25a002f46ec3	291d030e-b3b6-4f87-9e24-8def83a641a9	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-21	absent	\N	\N	\N	t	83772c0e-031f-4fa2-bd88-3c53d942cca4	2025-09-22 15:13:55.366	2025-09-22 15:13:55.366	2025-09-22 15:13:55.366
e61b785f-3e63-4f8b-a5fd-25181c611897	db0fb0b8-83bb-40af-a1a1-4dee6a07195e	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-21	present	\N	\N	\N	t	83772c0e-031f-4fa2-bd88-3c53d942cca4	2025-09-22 15:14:14	2025-09-22 15:14:04.187	2025-09-22 15:14:04.187
f0e52386-66a1-4f8b-a575-c4e2076d31ac	c35d7c98-31f7-4ae6-9fc6-9ef2382304b2	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-21	present	\N	\N	\N	t	83772c0e-031f-4fa2-bd88-3c53d942cca4	2025-09-22 15:18:43.657	2025-09-22 15:18:43.657	2025-09-22 15:18:43.657
0d186442-eb9e-44d9-b834-5944aeca0ffa	e16bc629-5fb9-41aa-948c-a36495b39978	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-20	present	\N	\N	\N	t	83772c0e-031f-4fa2-bd88-3c53d942cca4	2025-09-22 15:18:55.322	2025-09-22 15:18:55.322	2025-09-22 15:18:55.322
f546f712-0207-4b28-8143-eea797c6d681	f5863835-43b8-4752-9680-5ff4c324a77d	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-20	present	\N	\N	\N	t	83772c0e-031f-4fa2-bd88-3c53d942cca4	2025-09-22 15:18:55.755	2025-09-22 15:18:55.755	2025-09-22 15:18:55.755
224ee6bb-885b-4152-9232-9faba630f269	c35d7c98-31f7-4ae6-9fc6-9ef2382304b2	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-20	present	\N	\N	\N	t	83772c0e-031f-4fa2-bd88-3c53d942cca4	2025-09-22 15:18:56.629	2025-09-22 15:18:56.629	2025-09-22 15:18:56.629
a8066fea-4294-42c9-8f32-df8c36d0190b	291d030e-b3b6-4f87-9e24-8def83a641a9	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-20	absent	\N	\N	\N	t	83772c0e-031f-4fa2-bd88-3c53d942cca4	2025-09-22 15:19:15	2025-09-22 15:18:54.888	2025-09-22 15:18:54.888
ab25859d-de81-44bd-ab1a-f6cd70cce03f	db0fb0b8-83bb-40af-a1a1-4dee6a07195e	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-20	late	\N	\N	\N	t	83772c0e-031f-4fa2-bd88-3c53d942cca4	2025-09-22 15:19:25	2025-09-22 15:18:56.187	2025-09-22 15:18:56.187
112b388c-58e4-4717-bbf8-08ae67290945	291d030e-b3b6-4f87-9e24-8def83a641a9	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-22	present	\N	\N	\N	t	83772c0e-031f-4fa2-bd88-3c53d942cca4	2025-09-22 15:41:30	2025-09-22 14:47:26.599	2025-09-22 14:47:26.599
6d019dcd-6c7e-488d-aa50-e7aef315bc41	291d030e-b3b6-4f87-9e24-8def83a641a9	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-23	absent	\N	\N	\N	t	83772c0e-031f-4fa2-bd88-3c53d942cca4	2025-09-23 10:49:07	2025-09-22 14:50:07.849	2025-09-22 14:50:07.849
d63c7447-1598-4cfa-ad2b-4bc3a5bf4438	c35d7c98-31f7-4ae6-9fc6-9ef2382304b2	56619539-d75e-40ac-b263-9f25f8e3f46e	2025-09-25	absent	\N	\N	\N	t	83772c0e-031f-4fa2-bd88-3c53d942cca4	2025-09-25 05:35:23.950388	2025-09-25 05:35:23.950388	2025-09-25 05:35:23.950388
\.


--
-- TOC entry 3668 (class 0 OID 24724)
-- Dependencies: 231
-- Data for Name: teacher_replacements; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.teacher_replacements (id, original_teacher_id, replacement_teacher_id, school_id, replacement_date, reason, affected_timetable_entries, conflict_details, status, replaced_by, completed_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3669 (class 0 OID 24735)
-- Dependencies: 232
-- Data for Name: teachers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.teachers (id, employee_id, name, email, contact_number, school_id_number, subjects, classes, availability, max_load, max_daily_periods, school_id, is_active, status, created_at, updated_at, aadhar, gender, blood_group, designation, date_of_birth, father_husband_name, address, category, religion, profile_picture_url) FROM stdin;
291d030e-b3b6-4f87-9e24-8def83a641a9	T291d030e-b3b6-4f87-9e24-8def83a641a9	Surbhi	sur@gmail.com	12623872323	12323	["7c74838b-65aa-4ac1-a4d9-e475feb3ddfa", "6aeab6a4-3ec3-4840-b4b3-e05887e68ba1"]	["227b9189-2158-4acd-95d6-dcca359a7bcb"]	{"friday": [], "monday": [], "tuesday": [], "thursday": [], "wednesday": []}	30	6	56619539-d75e-40ac-b263-9f25f8e3f46e	t	active	2025-09-10 11:33:53.045	2025-09-10 11:33:53.045	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
c35d7c98-31f7-4ae6-9fc6-9ef2382304b2	Tc35d7c98-31f7-4ae6-9fc6-9ef2382304b2	Amit	abhi@gmail.com	8937373988	7888	["f1aef8f2-418a-48fa-b16f-1c1fe5b3c08f", "6aeab6a4-3ec3-4840-b4b3-e05887e68ba1"]	["227b9189-2158-4acd-95d6-dcca359a7bcb", "de0da21d-119e-4f55-a8fd-a486bc47ec15"]	{"friday": [], "monday": [], "tuesday": [], "thursday": [], "wednesday": []}	30	6	56619539-d75e-40ac-b263-9f25f8e3f46e	t	active	2025-09-11 07:38:16.476	2025-09-24 14:43:47.819	\N	\N	\N	\N	\N	\N	\N	\N	\N	/api/teachers/c35d7c98-31f7-4ae6-9fc6-9ef2382304b2/profile-picture/028dd613-03f8-4db6-aa77-f199a3b0e826.jpg
db0fb0b8-83bb-40af-a1a1-4dee6a07195e	Tdb0fb0b8-83bb-40af-a1a1-4dee6a07195e	Mona	mona@gmail.com	627987369	783728	["9dd8dcc6-25ad-4a73-b28e-3c5fda344a59"]	["227b9189-2158-4acd-95d6-dcca359a7bcb"]	{"friday": [], "monday": [], "tuesday": [], "thursday": [], "wednesday": []}	30	6	56619539-d75e-40ac-b263-9f25f8e3f46e	t	active	2025-09-10 11:35:10.943	2025-09-24 14:46:55.446	\N	\N	\N	\N	\N	\N	\N	\N	\N	/api/teachers/db0fb0b8-83bb-40af-a1a1-4dee6a07195e/profile-picture/5a0640b0-6e9f-45c8-b1ad-639e1f3ac459.png
a1133897-1ab2-4290-96b5-348a9040c6ff	EMP505697ZC5ZER	Kurt Cobain	\N	981045690333	\N	[]	[]	{"friday": [], "monday": [], "tuesday": [], "thursday": [], "wednesday": []}	30	6	56619539-d75e-40ac-b263-9f25f8e3f46e	t	active	2025-09-24 16:31:45.818	2025-09-24 16:32:31.68	\N	male	\N	\N	\N	\N	\N	\N	\N	/api/teachers/a1133897-1ab2-4290-96b5-348a9040c6ff/profile-picture/ae727862-785e-4c35-8426-15cf69e3900b.png
3073f98d-3ef3-4ac7-8fe2-071c6c58d62d	EMP6881697RIC46	Rohit KK	\N	89273920112	\N	[]	[]	{"friday": [], "monday": [], "tuesday": [], "thursday": [], "wednesday": []}	30	6	56619539-d75e-40ac-b263-9f25f8e3f46e	t	active	2025-09-24 16:34:48.288	2025-09-24 16:34:48.288	\N	male	\N	\N	\N	\N	\N	\N	\N	\N
e16bc629-5fb9-41aa-948c-a36495b39978	Te16bc629-5fb9-41aa-948c-a36495b39978	Anil	anil@gmail.com	732868423	1234	["ec21e691-ec6f-4ea4-8012-2eaf8a67a33b", "c1598350-46ff-4be5-aee9-bb705e4e39cc"]	["227b9189-2158-4acd-95d6-dcca359a7bcb"]	{"friday": [], "monday": [], "tuesday": [], "thursday": [], "wednesday": []}	30	6	56619539-d75e-40ac-b263-9f25f8e3f46e	t	active	2025-09-10 11:34:26.846	2025-09-24 16:43:58.502	\N	\N	\N	\N	\N	\N	\N	\N	\N	/api/teachers/e16bc629-5fb9-41aa-948c-a36495b39978/profile-picture/339af54a-1f90-4a39-b34a-63c97e8200b1.JPG
f5863835-43b8-4752-9680-5ff4c324a77d	Tf5863835-43b8-4752-9680-5ff4c324a77d	Rohit	rohit@gmail.com	682674387238	682763	["828a440e-b788-4eed-a47a-7b78ece6dd76", "5ecbfc2a-e224-41b5-b3ef-54259ff4f196"]	["227b9189-2158-4acd-95d6-dcca359a7bcb"]	{"friday": [], "monday": [], "tuesday": [], "thursday": [], "wednesday": []}	30	6	56619539-d75e-40ac-b263-9f25f8e3f46e	t	active	2025-09-10 11:34:47.383	2025-09-25 06:21:30.873	\N	\N	\N	\N	\N	\N	\N	\N	\N	/api/teachers/f5863835-43b8-4752-9680-5ff4c324a77d/profile-picture/69426b2f-e615-4fc4-bdc1-f9147c1c5fd0.JPG
f67f3558-de9c-4feb-b48d-3d368466c3d2	EMP17587869398410	Rocky	john.doe5@school.com	9876543210	T008	[]	[]	{"friday": true, "monday": true, "sunday": false, "tuesday": true, "saturday": false, "thursday": true, "wednesday": true}	6	6	56619539-d75e-40ac-b263-9f25f8e3f46e	t	active	2025-09-25 07:55:39.978768	2025-09-25 07:55:39.978768	123456789012	male	O+	Senior Teacher	1985-05-15	Mr. Doe Sr.	123 Main Street, City	General	Hindu	\N
dceed7af-e019-47c2-89a4-09164a42b771	EMP17587869403661	Suresh	john.doe1@school.com	9810560800	T009	[]	[]	{"friday": true, "monday": true, "sunday": false, "tuesday": true, "saturday": false, "thursday": true, "wednesday": true}	6	6	56619539-d75e-40ac-b263-9f25f8e3f46e	t	active	2025-09-25 07:55:40.536196	2025-09-25 07:55:40.536196	123456789012	male	O+	Senior Teacher	1985-05-15	Mr. Doe Sr.	123 Main Street, City	General	Hindu	\N
\.


--
-- TOC entry 3670 (class 0 OID 24750)
-- Dependencies: 233
-- Data for Name: timetable_changes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.timetable_changes (id, timetable_entry_id, change_type, change_date, original_teacher_id, new_teacher_id, original_room, new_room, reason, change_source, approved_by, approved_at, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3671 (class 0 OID 24759)
-- Dependencies: 234
-- Data for Name: timetable_entries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.timetable_entries (id, class_id, teacher_id, subject_id, day, period, start_time, end_time, room, version_id, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3672 (class 0 OID 24768)
-- Dependencies: 235
-- Data for Name: timetable_structures; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.timetable_structures (id, school_id, periods_per_day, working_days, time_slots, is_active, created_at, updated_at) FROM stdin;
8178387b-2994-48f1-a2c2-c066eb19c75d	56619539-d75e-40ac-b263-9f25f8e3f46e	8	["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]	[{"period": 1, "endTime": "08:15", "startTime": "07:30"}, {"period": 2, "endTime": "09:00", "startTime": "08:15"}, {"period": 3, "endTime": "09:45", "startTime": "09:00"}, {"period": 4, "endTime": "10:15", "startTime": "09:45"}, {"period": 5, "endTime": "11:00", "isBreak": true, "startTime": "10:15"}, {"period": 6, "endTime": "11:45", "startTime": "11:00"}, {"period": 7, "endTime": "12:30", "startTime": "11:45"}, {"period": 8, "endTime": "13:15", "startTime": "12:30"}]	t	2025-09-10 14:12:36.213	2025-09-10 14:12:36.213
\.


--
-- TOC entry 3673 (class 0 OID 24780)
-- Dependencies: 236
-- Data for Name: timetable_validity_periods; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.timetable_validity_periods (id, class_id, valid_from, valid_to, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3674 (class 0 OID 24787)
-- Dependencies: 237
-- Data for Name: timetable_versions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.timetable_versions (id, class_id, version, week_start, week_end, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3675 (class 0 OID 24794)
-- Dependencies: 238
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, login_id, password_hash, temporary_password, temporary_password_expires_at, role, is_first_login, school_id, teacher_id, student_id, parent_id, first_name, last_name, password_changed_at, last_login_at, is_active, created_by, created_at, updated_at, temporary_password_plain_text) FROM stdin;
45f5e06c-eb0e-49fb-b41d-63e229a1811a	abhi@gmail.com	123	$2b$12$2gAZRpq9U599Cp9uXs2n3O7NniEKITX2VWYVOTuJdk/aYxSNH3bvS	$2b$12$TpFjRHPNm3VQjlphOf3k7eAw9oqaAQw50lxYzy1xUVWxOSe6LoTaS	2025-09-23 18:53:55.97	student	t	56619539-d75e-40ac-b263-9f25f8e3f46e	\N	fd66e9e5-f8ba-4cd3-8335-7b0b834e2b64	\N	\N	\N	\N	\N	t	\N	2025-09-21 18:46:33.669	2025-09-21 18:53:56.007	7673XAPv6PD4
04b0e2c5-1f08-4995-9fe3-ea1b67c89ac5	\N	P123	$2b$12$fj/H9bzcyySg3zHuvRid4ePF/sCYujOus5YR4yUpJZBvKcWbBAz2e	$2b$12$ubDAkwo/tmfRPVS0f13Fgu1g415POCKj.gbhGiB/8UkC030.uL0Ny	2025-09-23 18:53:55.97	parent	t	56619539-d75e-40ac-b263-9f25f8e3f46e	\N	\N	\N	\N	\N	\N	\N	t	\N	2025-09-21 18:46:34.098	2025-09-21 18:53:56.084	4h3mEjUbV9Cx
eb86fed1-edb6-40e7-9c70-b848ce4fe4c3	admin@chrona.com	admin@chrona.com	$2b$12$38Sdygau7AiUGIcrewHhnOEjvAOd2OFZJbC10Gw/Zo0s0MuKxjv36	\N	\N	super_admin	f	\N	\N	\N	\N	Super	Admin	2025-09-10 11:21:17.163	2025-09-23 07:56:44.672	t	\N	2025-09-10 11:21:17.163	2025-09-23 07:56:44.672	\N
7608e756-7ede-4c95-b180-a9683d6b680a	john.doe@example.com	ADM004	$2b$12$tJZWvJilmPj.9ad5kKyVDe56hjw8NgHtPGiZoU7gr/4KuL064x45G	$2b$12$P77USHcnT95et6Ejlm34BOGpRGTixLbMF7VzFcmuDTe4RuM82d5pO	2025-09-25 10:46:32.936	student	t	56619539-d75e-40ac-b263-9f25f8e3f46e	\N	f471bad1-2f07-417d-a949-25830a1d3a33	\N	\N	\N	\N	\N	t	\N	2025-09-22 12:01:38.166	2025-09-23 10:46:32.942	sNEBeap7DkdJ
2819f659-6a84-4414-be3c-b0b77227095c	\N	PADM004	$2b$12$kwjwZ27EqvzVa1TSP8wBg.zAKWcIRxArEZJ3PbwYOXZYavbgQQNSq	$2b$12$/.F8.HoWiy9zFrHf5f7LT.cOFO0tdvcezqtNPXNt0cvhxdTzVr2Ku	2025-09-25 10:46:32.936	parent	t	56619539-d75e-40ac-b263-9f25f8e3f46e	\N	\N	\N	\N	\N	\N	\N	t	\N	2025-09-22 12:01:38.857	2025-09-23 10:46:32.973	rpWan4CEBec4
83772c0e-031f-4fa2-bd88-3c53d942cca4	admin@dps.com	admin@dps.com	$2b$12$ps0017Ohy9F5LTWJ7tBoyucpyNPrXZpnrDopTYUwKuLFB0UQiD8DW	\N	\N	admin	f	56619539-d75e-40ac-b263-9f25f8e3f46e	\N	\N	\N	Aabhi	\N	2025-09-10 11:28:33.158	2025-09-25 05:14:12.322	t	\N	2025-09-10 11:28:33.158	2025-09-25 07:58:24.626	\N
\.


--
-- TOC entry 3676 (class 0 OID 24805)
-- Dependencies: 239
-- Data for Name: weekly_timetables; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.weekly_timetables (id, class_id, week_start, week_end, timetable_data, modified_by, modification_count, based_on_global_version, school_id, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3400 (class 2606 OID 24819)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3402 (class 2606 OID 24821)
-- Name: class_subject_assignments class_subject_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.class_subject_assignments
    ADD CONSTRAINT class_subject_assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 3404 (class 2606 OID 24823)
-- Name: class_teacher_assignments class_teacher_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.class_teacher_assignments
    ADD CONSTRAINT class_teacher_assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 3406 (class 2606 OID 24825)
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- TOC entry 3408 (class 2606 OID 24827)
-- Name: manual_assignment_audits manual_assignment_audits_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.manual_assignment_audits
    ADD CONSTRAINT manual_assignment_audits_pkey PRIMARY KEY (id);


--
-- TOC entry 3410 (class 2606 OID 24829)
-- Name: parents parents_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parents
    ADD CONSTRAINT parents_pkey PRIMARY KEY (id);


--
-- TOC entry 3412 (class 2606 OID 24831)
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- TOC entry 3414 (class 2606 OID 24833)
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 3416 (class 2606 OID 24835)
-- Name: schools schools_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_pkey PRIMARY KEY (id);


--
-- TOC entry 3418 (class 2606 OID 24837)
-- Name: student_attendance student_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_attendance
    ADD CONSTRAINT student_attendance_pkey PRIMARY KEY (id);


--
-- TOC entry 3420 (class 2606 OID 24839)
-- Name: student_parents student_parents_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_parents
    ADD CONSTRAINT student_parents_pkey PRIMARY KEY (id);


--
-- TOC entry 3422 (class 2606 OID 24841)
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- TOC entry 3424 (class 2606 OID 24843)
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- TOC entry 3426 (class 2606 OID 24845)
-- Name: substitutions substitutions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.substitutions
    ADD CONSTRAINT substitutions_pkey PRIMARY KEY (id);


--
-- TOC entry 3428 (class 2606 OID 24847)
-- Name: system_modules system_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_modules
    ADD CONSTRAINT system_modules_pkey PRIMARY KEY (id);


--
-- TOC entry 3430 (class 2606 OID 24849)
-- Name: teacher_attendance teacher_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teacher_attendance
    ADD CONSTRAINT teacher_attendance_pkey PRIMARY KEY (id);


--
-- TOC entry 3432 (class 2606 OID 24851)
-- Name: teacher_replacements teacher_replacements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teacher_replacements
    ADD CONSTRAINT teacher_replacements_pkey PRIMARY KEY (id);


--
-- TOC entry 3434 (class 2606 OID 24853)
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (id);


--
-- TOC entry 3436 (class 2606 OID 24855)
-- Name: timetable_changes timetable_changes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timetable_changes
    ADD CONSTRAINT timetable_changes_pkey PRIMARY KEY (id);


--
-- TOC entry 3438 (class 2606 OID 24857)
-- Name: timetable_entries timetable_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timetable_entries
    ADD CONSTRAINT timetable_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 3440 (class 2606 OID 24859)
-- Name: timetable_structures timetable_structures_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timetable_structures
    ADD CONSTRAINT timetable_structures_pkey PRIMARY KEY (id);


--
-- TOC entry 3442 (class 2606 OID 24861)
-- Name: timetable_validity_periods timetable_validity_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timetable_validity_periods
    ADD CONSTRAINT timetable_validity_periods_pkey PRIMARY KEY (id);


--
-- TOC entry 3444 (class 2606 OID 24863)
-- Name: timetable_versions timetable_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timetable_versions
    ADD CONSTRAINT timetable_versions_pkey PRIMARY KEY (id);


--
-- TOC entry 3446 (class 2606 OID 24865)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3448 (class 2606 OID 24867)
-- Name: weekly_timetables weekly_timetables_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.weekly_timetables
    ADD CONSTRAINT weekly_timetables_pkey PRIMARY KEY (id);


--
-- TOC entry 3449 (class 2606 OID 24868)
-- Name: audit_logs audit_logs_school_id_schools_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_school_id_schools_id_fk FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- TOC entry 3450 (class 2606 OID 24873)
-- Name: audit_logs audit_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3451 (class 2606 OID 24878)
-- Name: class_subject_assignments class_subject_assignments_assigned_teacher_id_teachers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.class_subject_assignments
    ADD CONSTRAINT class_subject_assignments_assigned_teacher_id_teachers_id_fk FOREIGN KEY (assigned_teacher_id) REFERENCES public.teachers(id);


--
-- TOC entry 3452 (class 2606 OID 24883)
-- Name: class_subject_assignments class_subject_assignments_class_id_classes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.class_subject_assignments
    ADD CONSTRAINT class_subject_assignments_class_id_classes_id_fk FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- TOC entry 3453 (class 2606 OID 24888)
-- Name: class_subject_assignments class_subject_assignments_subject_id_subjects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.class_subject_assignments
    ADD CONSTRAINT class_subject_assignments_subject_id_subjects_id_fk FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- TOC entry 3454 (class 2606 OID 24893)
-- Name: class_teacher_assignments class_teacher_assignments_assigned_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.class_teacher_assignments
    ADD CONSTRAINT class_teacher_assignments_assigned_by_users_id_fk FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- TOC entry 3455 (class 2606 OID 24898)
-- Name: class_teacher_assignments class_teacher_assignments_class_id_classes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.class_teacher_assignments
    ADD CONSTRAINT class_teacher_assignments_class_id_classes_id_fk FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- TOC entry 3456 (class 2606 OID 24903)
-- Name: class_teacher_assignments class_teacher_assignments_school_id_schools_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.class_teacher_assignments
    ADD CONSTRAINT class_teacher_assignments_school_id_schools_id_fk FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- TOC entry 3457 (class 2606 OID 24908)
-- Name: class_teacher_assignments class_teacher_assignments_teacher_id_teachers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.class_teacher_assignments
    ADD CONSTRAINT class_teacher_assignments_teacher_id_teachers_id_fk FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);


--
-- TOC entry 3458 (class 2606 OID 24913)
-- Name: classes classes_school_id_schools_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_school_id_schools_id_fk FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- TOC entry 3459 (class 2606 OID 24918)
-- Name: manual_assignment_audits manual_assignment_audits_assigned_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.manual_assignment_audits
    ADD CONSTRAINT manual_assignment_audits_assigned_by_users_id_fk FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- TOC entry 3460 (class 2606 OID 24923)
-- Name: manual_assignment_audits manual_assignment_audits_class_id_classes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.manual_assignment_audits
    ADD CONSTRAINT manual_assignment_audits_class_id_classes_id_fk FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- TOC entry 3461 (class 2606 OID 24928)
-- Name: manual_assignment_audits manual_assignment_audits_new_teacher_id_teachers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.manual_assignment_audits
    ADD CONSTRAINT manual_assignment_audits_new_teacher_id_teachers_id_fk FOREIGN KEY (new_teacher_id) REFERENCES public.teachers(id);


--
-- TOC entry 3462 (class 2606 OID 24933)
-- Name: manual_assignment_audits manual_assignment_audits_old_teacher_id_teachers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.manual_assignment_audits
    ADD CONSTRAINT manual_assignment_audits_old_teacher_id_teachers_id_fk FOREIGN KEY (old_teacher_id) REFERENCES public.teachers(id);


--
-- TOC entry 3463 (class 2606 OID 24938)
-- Name: manual_assignment_audits manual_assignment_audits_subject_id_subjects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.manual_assignment_audits
    ADD CONSTRAINT manual_assignment_audits_subject_id_subjects_id_fk FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- TOC entry 3464 (class 2606 OID 24943)
-- Name: parents parents_school_id_schools_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parents
    ADD CONSTRAINT parents_school_id_schools_id_fk FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- TOC entry 3465 (class 2606 OID 24948)
-- Name: posts posts_class_id_classes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_class_id_classes_id_fk FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- TOC entry 3466 (class 2606 OID 24953)
-- Name: posts posts_posted_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_posted_by_id_users_id_fk FOREIGN KEY (posted_by_id) REFERENCES public.users(id);


--
-- TOC entry 3467 (class 2606 OID 24958)
-- Name: posts posts_school_id_schools_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_school_id_schools_id_fk FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- TOC entry 3468 (class 2606 OID 24963)
-- Name: role_permissions role_permissions_assigned_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_assigned_by_users_id_fk FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- TOC entry 3469 (class 2606 OID 24968)
-- Name: role_permissions role_permissions_module_id_system_modules_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_module_id_system_modules_id_fk FOREIGN KEY (module_id) REFERENCES public.system_modules(id);


--
-- TOC entry 3470 (class 2606 OID 24973)
-- Name: role_permissions role_permissions_school_id_schools_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_school_id_schools_id_fk FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- TOC entry 3471 (class 2606 OID 24978)
-- Name: student_attendance student_attendance_class_id_classes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_attendance
    ADD CONSTRAINT student_attendance_class_id_classes_id_fk FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- TOC entry 3472 (class 2606 OID 24983)
-- Name: student_attendance student_attendance_marked_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_attendance
    ADD CONSTRAINT student_attendance_marked_by_users_id_fk FOREIGN KEY (marked_by) REFERENCES public.users(id);


--
-- TOC entry 3473 (class 2606 OID 24988)
-- Name: student_attendance student_attendance_school_id_schools_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_attendance
    ADD CONSTRAINT student_attendance_school_id_schools_id_fk FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- TOC entry 3474 (class 2606 OID 24993)
-- Name: student_attendance student_attendance_student_id_students_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_attendance
    ADD CONSTRAINT student_attendance_student_id_students_id_fk FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- TOC entry 3475 (class 2606 OID 24998)
-- Name: student_parents student_parents_parent_id_parents_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_parents
    ADD CONSTRAINT student_parents_parent_id_parents_id_fk FOREIGN KEY (parent_id) REFERENCES public.parents(id);


--
-- TOC entry 3476 (class 2606 OID 25003)
-- Name: student_parents student_parents_student_id_students_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_parents
    ADD CONSTRAINT student_parents_student_id_students_id_fk FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- TOC entry 3477 (class 2606 OID 25008)
-- Name: students students_class_id_classes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_class_id_classes_id_fk FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- TOC entry 3478 (class 2606 OID 25013)
-- Name: students students_school_id_schools_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_school_id_schools_id_fk FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- TOC entry 3479 (class 2606 OID 25018)
-- Name: subjects subjects_school_id_schools_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_school_id_schools_id_fk FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- TOC entry 3480 (class 2606 OID 25023)
-- Name: substitutions substitutions_original_teacher_id_teachers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.substitutions
    ADD CONSTRAINT substitutions_original_teacher_id_teachers_id_fk FOREIGN KEY (original_teacher_id) REFERENCES public.teachers(id);


--
-- TOC entry 3481 (class 2606 OID 25028)
-- Name: substitutions substitutions_substitute_teacher_id_teachers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.substitutions
    ADD CONSTRAINT substitutions_substitute_teacher_id_teachers_id_fk FOREIGN KEY (substitute_teacher_id) REFERENCES public.teachers(id);


--
-- TOC entry 3482 (class 2606 OID 25033)
-- Name: substitutions substitutions_timetable_entry_id_timetable_entries_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.substitutions
    ADD CONSTRAINT substitutions_timetable_entry_id_timetable_entries_id_fk FOREIGN KEY (timetable_entry_id) REFERENCES public.timetable_entries(id);


--
-- TOC entry 3483 (class 2606 OID 25038)
-- Name: teacher_attendance teacher_attendance_marked_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teacher_attendance
    ADD CONSTRAINT teacher_attendance_marked_by_users_id_fk FOREIGN KEY (marked_by) REFERENCES public.users(id);


--
-- TOC entry 3484 (class 2606 OID 25043)
-- Name: teacher_attendance teacher_attendance_school_id_schools_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teacher_attendance
    ADD CONSTRAINT teacher_attendance_school_id_schools_id_fk FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- TOC entry 3485 (class 2606 OID 25048)
-- Name: teacher_attendance teacher_attendance_teacher_id_teachers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teacher_attendance
    ADD CONSTRAINT teacher_attendance_teacher_id_teachers_id_fk FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);


--
-- TOC entry 3486 (class 2606 OID 25053)
-- Name: teacher_replacements teacher_replacements_original_teacher_id_teachers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teacher_replacements
    ADD CONSTRAINT teacher_replacements_original_teacher_id_teachers_id_fk FOREIGN KEY (original_teacher_id) REFERENCES public.teachers(id);


--
-- TOC entry 3487 (class 2606 OID 25058)
-- Name: teacher_replacements teacher_replacements_replaced_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teacher_replacements
    ADD CONSTRAINT teacher_replacements_replaced_by_users_id_fk FOREIGN KEY (replaced_by) REFERENCES public.users(id);


--
-- TOC entry 3488 (class 2606 OID 25063)
-- Name: teacher_replacements teacher_replacements_replacement_teacher_id_teachers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teacher_replacements
    ADD CONSTRAINT teacher_replacements_replacement_teacher_id_teachers_id_fk FOREIGN KEY (replacement_teacher_id) REFERENCES public.teachers(id);


--
-- TOC entry 3489 (class 2606 OID 25068)
-- Name: teacher_replacements teacher_replacements_school_id_schools_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teacher_replacements
    ADD CONSTRAINT teacher_replacements_school_id_schools_id_fk FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- TOC entry 3490 (class 2606 OID 25073)
-- Name: teachers teachers_school_id_schools_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_school_id_schools_id_fk FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- TOC entry 3491 (class 2606 OID 25078)
-- Name: timetable_changes timetable_changes_approved_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timetable_changes
    ADD CONSTRAINT timetable_changes_approved_by_users_id_fk FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- TOC entry 3492 (class 2606 OID 25083)
-- Name: timetable_changes timetable_changes_new_teacher_id_teachers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timetable_changes
    ADD CONSTRAINT timetable_changes_new_teacher_id_teachers_id_fk FOREIGN KEY (new_teacher_id) REFERENCES public.teachers(id);


--
-- TOC entry 3493 (class 2606 OID 25088)
-- Name: timetable_changes timetable_changes_original_teacher_id_teachers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timetable_changes
    ADD CONSTRAINT timetable_changes_original_teacher_id_teachers_id_fk FOREIGN KEY (original_teacher_id) REFERENCES public.teachers(id);


--
-- TOC entry 3494 (class 2606 OID 25093)
-- Name: timetable_changes timetable_changes_timetable_entry_id_timetable_entries_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timetable_changes
    ADD CONSTRAINT timetable_changes_timetable_entry_id_timetable_entries_id_fk FOREIGN KEY (timetable_entry_id) REFERENCES public.timetable_entries(id);


--
-- TOC entry 3495 (class 2606 OID 25098)
-- Name: timetable_entries timetable_entries_class_id_classes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timetable_entries
    ADD CONSTRAINT timetable_entries_class_id_classes_id_fk FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- TOC entry 3496 (class 2606 OID 25103)
-- Name: timetable_entries timetable_entries_subject_id_subjects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timetable_entries
    ADD CONSTRAINT timetable_entries_subject_id_subjects_id_fk FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- TOC entry 3497 (class 2606 OID 25108)
-- Name: timetable_entries timetable_entries_teacher_id_teachers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timetable_entries
    ADD CONSTRAINT timetable_entries_teacher_id_teachers_id_fk FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);


--
-- TOC entry 3498 (class 2606 OID 25118)
-- Name: timetable_structures timetable_structures_school_id_schools_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timetable_structures
    ADD CONSTRAINT timetable_structures_school_id_schools_id_fk FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- TOC entry 3499 (class 2606 OID 25123)
-- Name: timetable_validity_periods timetable_validity_periods_class_id_classes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timetable_validity_periods
    ADD CONSTRAINT timetable_validity_periods_class_id_classes_id_fk FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- TOC entry 3500 (class 2606 OID 25128)
-- Name: timetable_versions timetable_versions_class_id_classes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timetable_versions
    ADD CONSTRAINT timetable_versions_class_id_classes_id_fk FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- TOC entry 3501 (class 2606 OID 25133)
-- Name: users users_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3502 (class 2606 OID 25138)
-- Name: users users_parent_id_parents_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_parent_id_parents_id_fk FOREIGN KEY (parent_id) REFERENCES public.parents(id);


--
-- TOC entry 3503 (class 2606 OID 25143)
-- Name: users users_school_id_schools_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_school_id_schools_id_fk FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- TOC entry 3504 (class 2606 OID 25148)
-- Name: users users_student_id_students_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_student_id_students_id_fk FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- TOC entry 3505 (class 2606 OID 25153)
-- Name: users users_teacher_id_teachers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_teacher_id_teachers_id_fk FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);


--
-- TOC entry 3506 (class 2606 OID 25158)
-- Name: weekly_timetables weekly_timetables_class_id_classes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.weekly_timetables
    ADD CONSTRAINT weekly_timetables_class_id_classes_id_fk FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- TOC entry 3507 (class 2606 OID 25163)
-- Name: weekly_timetables weekly_timetables_modified_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.weekly_timetables
    ADD CONSTRAINT weekly_timetables_modified_by_users_id_fk FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- TOC entry 3508 (class 2606 OID 25168)
-- Name: weekly_timetables weekly_timetables_school_id_schools_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.weekly_timetables
    ADD CONSTRAINT weekly_timetables_school_id_schools_id_fk FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- TOC entry 3683 (class 0 OID 0)
-- Dependencies: 3682
-- Name: DATABASE neondb; Type: ACL; Schema: -; Owner: neondb_owner
--

GRANT ALL ON DATABASE neondb TO neon_superuser;


--
-- TOC entry 3685 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: neondb_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- TOC entry 2134 (class 826 OID 32769)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- TOC entry 2133 (class 826 OID 32768)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


-- Completed on 2025-09-25 13:43:50 UTC

--
-- PostgreSQL database dump complete
--

