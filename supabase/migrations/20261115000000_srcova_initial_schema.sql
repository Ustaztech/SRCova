create type public.srcova_role as enum (
  'SUPER_ADMIN',
  'DEPARTMENT_OFFICER',
  'FACULTY_OFFICER',
  'DEAN_STUDENT_AFFAIRS',
  'MANAGEMENT_APPROVER'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role public.srcova_role not null,
  faculty_id text,
  department_id text,
  phone text,
  avatar text,
  title text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  last_login timestamptz
);

create table public.faculties (
  id text primary key default gen_random_uuid()::text,
  code text not null unique,
  name text not null,
  dean_name text not null default '',
  officer_email text not null default '',
  created_at timestamptz not null default now()
);

create table public.departments (
  id text primary key default gen_random_uuid()::text,
  faculty_id text not null references public.faculties (id),
  code text not null,
  name text not null,
  hod_name text not null default '',
  officer_email text not null default '',
  created_at timestamptz not null default now(),
  unique (faculty_id, code)
);

alter table public.profiles
  add constraint profiles_faculty_fk foreign key (faculty_id) references public.faculties (id),
  add constraint profiles_department_fk foreign key (department_id) references public.departments (id);

create table public.programmes (
  id text primary key default gen_random_uuid()::text,
  department_id text not null references public.departments (id),
  name text not null,
  duration_years integer not null check (duration_years > 0),
  degree_type text not null check (degree_type in ('B.Sc.', 'B.A.', 'LL.B.', 'B.Ed.', 'B.Agric.'))
);

create table public.academic_sessions (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  is_current boolean not null default false,
  start_date date not null,
  end_date date not null,
  check (end_date >= start_date)
);

create table public.src_exercises (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  academic_session_id text not null references public.academic_sessions (id),
  start_date date not null,
  nomination_deadline date not null,
  status text not null check (status in ('Upcoming', 'Active', 'Verification', 'Review', 'Closed')),
  description text not null default '',
  total_capacity integer not null default 0 check (total_capacity >= 0),
  is_management_approval_required boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.src_positions (
  id text primary key default gen_random_uuid()::text,
  exercise_id text not null references public.src_exercises (id) on delete cascade,
  title text not null,
  quota integer not null check (quota >= 0),
  description text not null default '',
  requirements text
);

create table public.eligibility_rules (
  id text primary key default gen_random_uuid()::text,
  exercise_id text not null references public.src_exercises (id) on delete cascade,
  rule_code text not null,
  rule_name text not null,
  description text not null default '',
  rule_type text not null check (rule_type in (
    'MIN_CGPA',
    'ACADEMIC_LEVEL',
    'COURSE_REP_REQUIRED',
    'NO_DISCIPLINARY_RECORD',
    'REQUIRED_DOCUMENTS',
    'FACULTY_QUOTA'
  )),
  threshold_value jsonb not null,
  is_mandatory boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (exercise_id, rule_code)
);

create table public.students (
  id text primary key default gen_random_uuid()::text,
  matric_number text not null unique,
  full_name text not null,
  gender text not null check (gender in ('Male', 'Female')),
  email text not null,
  phone text not null,
  faculty_id text not null references public.faculties (id),
  department_id text not null references public.departments (id),
  programme_id text not null references public.programmes (id),
  level text not null check (level in ('100L', '200L', '300L', '400L', '500L')),
  cgpa numeric(4, 2) not null check (cgpa between 0 and 5),
  is_course_rep boolean not null default false,
  passport_photo text,
  clearance_notes text,
  has_disciplinary_record boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.nominations (
  id text primary key default gen_random_uuid()::text,
  reference_number text not null unique,
  exercise_id text not null references public.src_exercises (id),
  student_id text not null references public.students (id),
  position_id text not null references public.src_positions (id),
  faculty_id text not null references public.faculties (id),
  department_id text not null references public.departments (id),
  status text not null check (status in (
    'Draft',
    'Submitted',
    'Awaiting Faculty Verification',
    'Returned for Correction',
    'Faculty Verified',
    'Faculty Rejected',
    'Pending Student Affairs Review',
    'Approved',
    'Rejected',
    'Recommended for Selection',
    'Pending Final Approval',
    'Selected',
    'Not Selected'
  )),
  proposed_position text not null,
  leadership_experience text not null default '',
  willingness_statement text not null default '',
  supporting_statement text not null default '',
  clearance_status text not null default 'Pending'
    check (clearance_status in ('Cleared', 'Pending', 'Flagged')),
  submitted_at timestamptz,
  submitted_by_user_id uuid references public.profiles (id),
  current_review_stage text not null check (current_review_stage in (
    'Department Draft',
    'Faculty Verification',
    'Student Affairs Review',
    'Management Approval',
    'Completed'
  )),
  correction_reason text,
  rejection_reason text,
  faculty_officer_remarks text,
  student_affairs_remarks text,
  management_remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.supporting_documents (
  id text primary key default gen_random_uuid()::text,
  nomination_id text not null references public.nominations (id) on delete cascade,
  student_id text not null references public.students (id),
  document_type text not null check (document_type in (
    'Statement of Result',
    'Course Rep Certificate',
    'Character Clearance',
    'Student ID Card',
    'Letter of Intent'
  )),
  file_name text not null,
  file_url text not null,
  file_size text not null,
  uploaded_at timestamptz not null default now(),
  verification_status text not null default 'Pending'
    check (verification_status in ('Pending', 'Verified', 'Flagged')),
  verified_by uuid references public.profiles (id),
  notes text
);

create table public.verification_records (
  id text primary key default gen_random_uuid()::text,
  nomination_id text not null references public.nominations (id) on delete cascade,
  verifying_officer_id uuid not null references public.profiles (id),
  officer_name text not null,
  officer_role text not null,
  verified_cgpa numeric(4, 2) not null check (verified_cgpa between 0 and 5),
  verified_level text not null,
  verified_course_rep boolean not null,
  documents_inspected boolean not null,
  result text not null check (result in ('Verified', 'Returned for Correction', 'Rejected')),
  remarks text not null default '',
  verified_fields text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.eligibility_checks (
  id text primary key default gen_random_uuid()::text,
  nomination_id text not null references public.nominations (id) on delete cascade,
  rule_id text not null references public.eligibility_rules (id),
  rule_code text not null,
  outcome text not null check (outcome in (
    'Eligible',
    'Ineligible',
    'Pending Verification',
    'Requires Clarification'
  )),
  actual_value jsonb not null,
  threshold_value jsonb not null,
  evaluated_at timestamptz not null default now(),
  remarks text not null default ''
);

create table public.administrative_reviews (
  id text primary key default gen_random_uuid()::text,
  nomination_id text not null references public.nominations (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id),
  reviewer_name text not null,
  reviewer_role text not null,
  decision text not null check (decision in (
    'Approved',
    'Rejected',
    'Request Clarification',
    'Recommended for Selection'
  )),
  remarks text not null default '',
  created_at timestamptz not null default now()
);

create table public.selections (
  id text primary key default gen_random_uuid()::text,
  exercise_id text not null references public.src_exercises (id),
  nomination_id text not null references public.nominations (id),
  student_id text not null references public.students (id),
  position_id text not null references public.src_positions (id),
  position_title text not null,
  faculty_id text not null references public.faculties (id),
  department_id text not null references public.departments (id),
  status text not null check (status in ('Recommended', 'Provisional', 'Approved', 'Confirmed')),
  selected_by_officer_id uuid not null references public.profiles (id),
  confirmed_by_officer_id uuid references public.profiles (id),
  confirmation_date timestamptz,
  resolution_number text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.app_notifications (
  id text primary key default gen_random_uuid()::text,
  recipient_user_id uuid references public.profiles (id),
  recipient_role text,
  faculty_id text references public.faculties (id),
  department_id text references public.departments (id),
  title text not null,
  message text not null,
  type text not null check (type in ('info', 'success', 'warning', 'danger')),
  link_to text,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  check (recipient_role is null or recipient_role in (
    'SUPER_ADMIN',
    'DEPARTMENT_OFFICER',
    'FACULTY_OFFICER',
    'DEAN_STUDENT_AFFAIRS',
    'MANAGEMENT_APPROVER',
    'ALL'
  ))
);

create table public.audit_logs (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references public.profiles (id),
  user_name text not null,
  user_role text not null,
  action text not null,
  entity_type text not null check (entity_type in (
    'Nomination',
    'Candidate',
    'Staff',
    'Verification',
    'Selection',
    'Exercise',
    'Settings'
  )),
  entity_id text not null,
  details text not null default '',
  ip_address text not null default '',
  created_at timestamptz not null default now()
);

create table public.system_settings (
  id text primary key default gen_random_uuid()::text,
  app_name text not null,
  institution_name text not null,
  tagline text not null,
  primary_logo_url text not null default '',
  vector_logo_url text not null default '',
  premium_logo_url text not null default '',
  current_academic_session_id text references public.academic_sessions (id),
  current_exercise_id text references public.src_exercises (id),
  is_management_approval_required boolean not null default true,
  max_nominations_per_dept integer not null default 3 check (max_nominations_per_dept >= 0),
  min_cgpa_requirement numeric(4, 2) not null default 3.50 check (min_cgpa_requirement between 0 and 5),
  contact_email text not null default '',
  contact_phone text not null default '',
  campus_address text not null default '',
  updated_at timestamptz not null default now()
);

create index departments_faculty_id_idx on public.departments (faculty_id);
create index programmes_department_id_idx on public.programmes (department_id);
create index students_department_id_idx on public.students (department_id);
create index students_faculty_id_idx on public.students (faculty_id);
create index nominations_department_status_idx on public.nominations (department_id, status);
create index nominations_faculty_status_idx on public.nominations (faculty_id, status);
create index supporting_documents_nomination_id_idx on public.supporting_documents (nomination_id);
create index notifications_user_created_idx on public.app_notifications (recipient_user_id, created_at desc);
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);

create function public.current_user_role()
returns public.srcova_role
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
    and p.is_active
$$;

create function public.can_view_department(target_department_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    left join public.departments d on d.id = target_department_id
    where p.id = auth.uid()
      and p.is_active
      and (
        p.role in ('SUPER_ADMIN', 'DEAN_STUDENT_AFFAIRS', 'MANAGEMENT_APPROVER')
        or (p.role = 'DEPARTMENT_OFFICER' and p.department_id = target_department_id)
        or (p.role = 'FACULTY_OFFICER' and p.faculty_id = d.faculty_id)
      )
  )
$$;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

create trigger nominations_set_updated_at
before update on public.nominations
for each row execute function public.set_updated_at();

create trigger settings_set_updated_at
before update on public.system_settings
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.faculties enable row level security;
alter table public.departments enable row level security;
alter table public.programmes enable row level security;
alter table public.academic_sessions enable row level security;
alter table public.src_exercises enable row level security;
alter table public.src_positions enable row level security;
alter table public.eligibility_rules enable row level security;
alter table public.students enable row level security;
alter table public.nominations enable row level security;
alter table public.supporting_documents enable row level security;
alter table public.verification_records enable row level security;
alter table public.eligibility_checks enable row level security;
alter table public.administrative_reviews enable row level security;
alter table public.selections enable row level security;
alter table public.app_notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.system_settings enable row level security;

create policy "Profiles can be read by their owner or administrators"
on public.profiles for select to authenticated
using (id = auth.uid() or public.current_user_role() = 'SUPER_ADMIN');

create policy "Authenticated users can read faculties"
on public.faculties for select to authenticated using (true);

create policy "Administrators manage faculties"
on public.faculties for all to authenticated
using (public.current_user_role() = 'SUPER_ADMIN')
with check (public.current_user_role() = 'SUPER_ADMIN');

create policy "Authenticated users can read departments"
on public.departments for select to authenticated using (true);

create policy "Administrators manage departments"
on public.departments for all to authenticated
using (public.current_user_role() = 'SUPER_ADMIN')
with check (public.current_user_role() = 'SUPER_ADMIN');

create policy "Authenticated users can read programmes"
on public.programmes for select to authenticated using (true);

create policy "Administrators manage programmes"
on public.programmes for all to authenticated
using (public.current_user_role() = 'SUPER_ADMIN')
with check (public.current_user_role() = 'SUPER_ADMIN');

create policy "Authenticated users can read academic sessions"
on public.academic_sessions for select to authenticated using (true);

create policy "Administrators manage academic sessions"
on public.academic_sessions for all to authenticated
using (public.current_user_role() = 'SUPER_ADMIN')
with check (public.current_user_role() = 'SUPER_ADMIN');

create policy "Authenticated users can read exercises"
on public.src_exercises for select to authenticated using (true);

create policy "Administrators manage exercises"
on public.src_exercises for all to authenticated
using (public.current_user_role() = 'SUPER_ADMIN')
with check (public.current_user_role() = 'SUPER_ADMIN');

create policy "Authenticated users can read positions"
on public.src_positions for select to authenticated using (true);

create policy "Administrators manage positions"
on public.src_positions for all to authenticated
using (public.current_user_role() = 'SUPER_ADMIN')
with check (public.current_user_role() = 'SUPER_ADMIN');

create policy "Authenticated users can read eligibility rules"
on public.eligibility_rules for select to authenticated using (true);

create policy "Administrators manage eligibility rules"
on public.eligibility_rules for all to authenticated
using (public.current_user_role() = 'SUPER_ADMIN')
with check (public.current_user_role() = 'SUPER_ADMIN');

create policy "Users read students in their scope"
on public.students for select to authenticated
using (public.can_view_department(department_id));

create policy "Department officers and administrators manage students"
on public.students for all to authenticated
using (
  public.current_user_role() = 'SUPER_ADMIN'
  or (
    public.current_user_role() = 'DEPARTMENT_OFFICER'
    and public.can_view_department(department_id)
  )
)
with check (
  public.current_user_role() = 'SUPER_ADMIN'
  or (
    public.current_user_role() = 'DEPARTMENT_OFFICER'
    and public.can_view_department(department_id)
  )
);

create policy "Users read nominations in their scope"
on public.nominations for select to authenticated
using (public.can_view_department(department_id));

create policy "Department officers submit nominations"
on public.nominations for insert to authenticated
with check (
  public.current_user_role() = 'SUPER_ADMIN'
  or (
    public.current_user_role() = 'DEPARTMENT_OFFICER'
    and public.can_view_department(department_id)
  )
);

create policy "Officers update nominations at their review stage"
on public.nominations for update to authenticated
using (
  public.current_user_role() = 'SUPER_ADMIN'
  or (
    public.current_user_role() = 'DEPARTMENT_OFFICER'
    and public.can_view_department(department_id)
    and status in ('Draft', 'Returned for Correction')
  )
  or (
    public.current_user_role() = 'FACULTY_OFFICER'
    and public.can_view_department(department_id)
    and status in ('Awaiting Faculty Verification', 'Faculty Verified', 'Faculty Rejected')
  )
  or (
    public.current_user_role() = 'DEAN_STUDENT_AFFAIRS'
    and status in ('Pending Student Affairs Review', 'Approved', 'Rejected', 'Recommended for Selection')
  )
  or (
    public.current_user_role() = 'MANAGEMENT_APPROVER'
    and status in ('Pending Final Approval', 'Selected', 'Not Selected')
  )
)
with check (
  public.current_user_role() = 'SUPER_ADMIN'
  or (
    public.current_user_role() = 'DEPARTMENT_OFFICER'
    and public.can_view_department(department_id)
    and status in ('Draft', 'Submitted', 'Returned for Correction')
  )
  or (
    public.current_user_role() = 'FACULTY_OFFICER'
    and public.can_view_department(department_id)
    and status in ('Faculty Verified', 'Faculty Rejected', 'Pending Student Affairs Review', 'Returned for Correction')
  )
  or (
    public.current_user_role() = 'DEAN_STUDENT_AFFAIRS'
    and status in ('Approved', 'Rejected', 'Recommended for Selection', 'Pending Final Approval')
  )
  or (
    public.current_user_role() = 'MANAGEMENT_APPROVER'
    and status in ('Selected', 'Not Selected')
  )
);

create policy "Users read nomination documents in their scope"
on public.supporting_documents for select to authenticated
using (
  exists (
    select 1 from public.nominations n
    where n.id = nomination_id
      and public.can_view_department(n.department_id)
  )
);

create policy "Department officers and administrators add documents"
on public.supporting_documents for insert to authenticated
with check (
  public.current_user_role() = 'SUPER_ADMIN'
  or (
    public.current_user_role() = 'DEPARTMENT_OFFICER'
    and exists (
      select 1 from public.nominations n
      where n.id = nomination_id
        and public.can_view_department(n.department_id)
    )
  )
);

create policy "Faculty officers and administrators verify documents"
on public.supporting_documents for update to authenticated
using (
  public.current_user_role() = 'SUPER_ADMIN'
  or (
    public.current_user_role() = 'FACULTY_OFFICER'
    and exists (
      select 1 from public.nominations n
      where n.id = nomination_id
        and public.can_view_department(n.department_id)
    )
  )
)
with check (
  public.current_user_role() = 'SUPER_ADMIN'
  or (
    public.current_user_role() = 'FACULTY_OFFICER'
    and exists (
      select 1 from public.nominations n
      where n.id = nomination_id
        and public.can_view_department(n.department_id)
    )
  )
);

create policy "Users read verification and eligibility records in their scope"
on public.verification_records for select to authenticated
using (
  exists (
    select 1 from public.nominations n
    where n.id = nomination_id
      and public.can_view_department(n.department_id)
  )
);

create policy "Faculty officers record verifications"
on public.verification_records for insert to authenticated
with check (
  public.current_user_role() in ('SUPER_ADMIN', 'FACULTY_OFFICER')
  and verifying_officer_id = auth.uid()
  and exists (
    select 1 from public.nominations n
    where n.id = nomination_id
      and public.can_view_department(n.department_id)
  )
);

create policy "Users read eligibility checks in their scope"
on public.eligibility_checks for select to authenticated
using (
  exists (
    select 1 from public.nominations n
    where n.id = nomination_id
      and public.can_view_department(n.department_id)
  )
);

create policy "Authorized officers record eligibility checks"
on public.eligibility_checks for insert to authenticated
with check (
  public.current_user_role() in (
    'SUPER_ADMIN',
    'DEPARTMENT_OFFICER',
    'FACULTY_OFFICER',
    'DEAN_STUDENT_AFFAIRS'
  )
  and exists (
    select 1 from public.nominations n
    where n.id = nomination_id
      and public.can_view_department(n.department_id)
  )
);

create policy "Users read administrative reviews in their scope"
on public.administrative_reviews for select to authenticated
using (
  exists (
    select 1 from public.nominations n
    where n.id = nomination_id
      and public.can_view_department(n.department_id)
  )
);

create policy "Student affairs and administrators record reviews"
on public.administrative_reviews for insert to authenticated
with check (
  public.current_user_role() in ('SUPER_ADMIN', 'DEAN_STUDENT_AFFAIRS', 'MANAGEMENT_APPROVER')
  and reviewer_id = auth.uid()
  and exists (
    select 1 from public.nominations n
    where n.id = nomination_id
      and public.can_view_department(n.department_id)
  )
);

create policy "Users read selections in their scope"
on public.selections for select to authenticated
using (public.can_view_department(department_id));

create policy "Student affairs and administrators recommend selections"
on public.selections for insert to authenticated
with check (
  public.current_user_role() in ('SUPER_ADMIN', 'DEAN_STUDENT_AFFAIRS')
  and selected_by_officer_id = auth.uid()
  and public.can_view_department(department_id)
);

create policy "Management and administrators confirm selections"
on public.selections for update to authenticated
using (
  public.current_user_role() in ('SUPER_ADMIN', 'MANAGEMENT_APPROVER')
)
with check (
  public.current_user_role() in ('SUPER_ADMIN', 'MANAGEMENT_APPROVER')
);

create policy "Users read their notifications"
on public.app_notifications for select to authenticated
using (
  recipient_user_id = auth.uid()
  or recipient_role = 'ALL'
  or recipient_role = public.current_user_role()::text
);

create policy "Users mark their notifications as read"
on public.app_notifications for update to authenticated
using (
  recipient_user_id = auth.uid()
  or recipient_role = 'ALL'
  or recipient_role = public.current_user_role()::text
)
with check (
  recipient_user_id = auth.uid()
  or recipient_role = 'ALL'
  or recipient_role = public.current_user_role()::text
);

create policy "Administrators and student affairs create notifications"
on public.app_notifications for insert to authenticated
with check (public.current_user_role() in ('SUPER_ADMIN', 'DEAN_STUDENT_AFFAIRS'));

create policy "Administrators read audit logs"
on public.audit_logs for select to authenticated
using (public.current_user_role() = 'SUPER_ADMIN');

create policy "Authenticated users append their own audit events"
on public.audit_logs for insert to authenticated
with check (user_id = auth.uid());

create policy "Authenticated users read system settings"
on public.system_settings for select to authenticated using (true);

create policy "Administrators manage system settings"
on public.system_settings for all to authenticated
using (public.current_user_role() = 'SUPER_ADMIN')
with check (public.current_user_role() = 'SUPER_ADMIN');

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.can_view_department(text) to authenticated;

revoke update on public.app_notifications from authenticated;
grant update (is_read) on public.app_notifications to authenticated;
