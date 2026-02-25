/**
 * API client for Django backend.
 * - Base URL from VITE_API_BASE_URL (env)
 * - Adds Authorization: Bearer <token> to requests when token exists
 * - Calls onUnauthorized when any request returns 401 (so auth can clear token and redirect)
 */

const STORAGE_KEY = "Attenova_token";

function getBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (base == null || base === "") {
    return ""; // relative to same origin
  }
  return base.replace(/\/$/, "");
}

export function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** Resolve profile pic URL (backend may return relative path like /media/...). */
export function getProfilePicUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  const base = getBaseUrl();
  return base ? `${base}${url.startsWith("/") ? url : `/${url}`}` : url;
}

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

export async function request<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<{ data: T; status: number }> {
  const base = getBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const init: RequestInit = {
    method: options.method ?? "GET",
    headers,
  };
  if (options.body != null && options.method !== "GET") {
    init.body = JSON.stringify(options.body);
  }
  const res = await fetch(url, init);
  if (res.status === 401 && onUnauthorized) {
    onUnauthorized();
  }
  const data = await (res.ok ? res.json().catch(() => ({})) : res.json().catch(() => ({ detail: res.statusText })));
  return { data: data as T, status: res.status };
}

/** GET request that returns a Blob (e.g. CSV/PDF export). Uses same base URL, auth, and 401 handling as request(). */
export async function requestBlob(
  path: string,
  options: { errorMessage?: string } = {}
): Promise<Blob> {
  const base = getBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { method: "GET", headers });
  if (res.status === 401 && onUnauthorized) onUnauthorized();
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string })?.error ?? options.errorMessage ?? "Request failed");
  }
  return res.blob();
}

/** Like request() but sends FormData (for multipart/form-data, e.g. file upload). Do not set Content-Type. */
export async function requestFormData<T = unknown>(
  path: string,
  formData: FormData,
  method: "POST" | "PATCH" = "POST"
): Promise<{ data: T; status: number }> {
  const base = getBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(url, {
    method,
    headers,
    body: formData,
  });
  if (res.status === 401 && onUnauthorized) {
    onUnauthorized();
  }
  const data = await (res.ok ? res.json().catch(() => ({})) : res.json().catch(() => ({ detail: res.statusText })));
  return { data: data as T, status: res.status };
}

/** POST /api/auth/login/ — body: { email, password } → { token, user } */
export type LoginResponse = {
  token: string;
  user: ApiUser;
};

export type ApiUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  organization_id: number | null;
  is_superadmin?: boolean;
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data, status } = await request<LoginResponse>("/api/auth/login/", {
    method: "POST",
    body: { email, password },
  });
  if (status !== 200 || !data.token || !data.user) {
    const message = (data as { detail?: string })?.detail ?? "Login failed";
    throw new Error(message);
  }
  return data;
}

/** GET /api/auth/me/ — returns { user } */
export type MeResponse = {
  user: ApiUser;
};

export async function getCurrentUser(): Promise<ApiUser | null> {
  const { data, status } = await request<MeResponse>("/api/auth/me/", { method: "GET" });
  if (status === 401 || !data?.user) {
    return null;
  }
  return data.user;
}

// ——— Organizations ———

export type ApiOrganizationOwner = {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  designation?: string;
};

export type ApiOrganization = {
  id: number;
  name: string;
  is_active?: boolean;
  created_at?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  phone_number?: string;
  email?: string;
  owner?: ApiOrganizationOwner;
};

export type OrganizationListResponse = {
  organizations: ApiOrganization[];
};

export async function fetchOrganizations(): Promise<ApiOrganization[]> {
  const { data, status } = await request<OrganizationListResponse>("/api/organizations/", { method: "GET" });
  if (status === 401 || status !== 200 || !data?.organizations) return [];
  return data.organizations;
}

export type CreateOrganizationPayload = {
  owner: {
    email: string;
    password: string;
    name?: string;
    phone_number?: string;
    designation?: string;
    gender?: string;
    government_id_type?: string;
    government_id_value?: string;
  };
  organization: {
    name: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    phone_number?: string;
    email?: string;
  };
};

export type CreateOrganizationResponse = {
  organization_id: number;
  user_id: number;
};

export async function createOrganization(payload: CreateOrganizationPayload): Promise<CreateOrganizationResponse> {
  const { data, status } = await request<CreateOrganizationResponse>("/api/organizations/", {
    method: "POST",
    body: payload,
  });
  if (status !== 201) {
    const msg = (data as { error?: string })?.error ?? "Failed to create organization";
    throw new Error(msg);
  }
  return data;
}

export async function fetchOrganization(id: number): Promise<ApiOrganization | null> {
  const { data, status } = await request<ApiOrganization>(`/api/organizations/${id}/`, { method: "GET" });
  if (status !== 200) return null;
  return data;
}

export type UpdateOrganizationPayload = {
  name?: string;
  is_active?: boolean;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  phone_number?: string;
  email?: string;
};

export async function updateOrganization(id: number, payload: UpdateOrganizationPayload): Promise<ApiOrganization> {
  const { data, status } = await request<ApiOrganization>(`/api/organizations/${id}/`, {
    method: "PATCH",
    body: payload,
  });
  if (status !== 200) {
    const msg = (data as { error?: string })?.error ?? "Failed to update";
    throw new Error(msg);
  }
  return data;
}

export async function deleteOrganization(id: number): Promise<void> {
  const { status, data } = await request<{ message?: string }>(`/api/organizations/${id}/`, { method: "DELETE" });
  if (status !== 200) {
    const msg = (data as { error?: string })?.error ?? "Failed to delete";
    throw new Error(msg);
  }
}

// ——— Offices ———

export type ApiOffice = {
  id: number;
  name: string;
  organization_id: number;
  location?: string;
  full_address?: string;
  num_biometric_devices?: number;
  manager_id?: number | null;
  is_active?: boolean;
  created_at?: string;
};

export type OfficeListResponse = {
  offices: ApiOffice[];
};

export async function fetchOffices(organizationId?: number): Promise<ApiOffice[]> {
  const path = organizationId != null ? `/api/offices/?organization_id=${organizationId}` : "/api/offices/";
  const { data, status } = await request<OfficeListResponse>(path, { method: "GET" });
  if (status === 401 || status !== 200 || !data?.offices) return [];
  return data.offices;
}

export type CreateOfficePayload = {
  organization_id: number;
  name: string;
  location?: string;
  full_address?: string;
  num_biometric_devices?: number;
  manager_id?: number | null;
};

export async function createOffice(payload: CreateOfficePayload): Promise<ApiOffice> {
  const { data, status } = await request<ApiOffice>("/api/offices/", {
    method: "POST",
    body: payload,
  });
  if (status !== 201) {
    const msg = (data as { error?: string })?.error ?? "Failed to create office";
    throw new Error(msg);
  }
  return data;
}

export type CreateOfficeWithAdminPayload = {
  organization_id: number;
  office: {
    name: string;
    location?: string;
    full_address?: string;
    num_biometric_devices?: number;
  };
  admin: {
    name?: string;
    email: string;
    password: string;
    phone_number?: string;
    emp_code?: string;
    designation?: string;
    gender?: string;
    government_id_type?: string;
    government_id_value?: string;
    date_of_birth?: string | null;
  };
};

export async function createOfficeWithAdmin(payload: CreateOfficeWithAdminPayload): Promise<ApiOffice> {
  const { data, status } = await request<ApiOffice>("/api/offices/", {
    method: "POST",
    body: payload,
  });
  if (status !== 201) {
    const msg = (data as { error?: string })?.error ?? "Failed to create office";
    throw new Error(msg);
  }
  return data;
}

export async function fetchOffice(id: number): Promise<ApiOffice | null> {
  const { data, status } = await request<ApiOffice>(`/api/offices/${id}/`, { method: "GET" });
  if (status !== 200) return null;
  return data;
}

export type UpdateOfficePayload = {
  name?: string;
  location?: string;
  full_address?: string;
  num_biometric_devices?: number;
  manager_id?: number | null;
  is_active?: boolean;
};

export async function updateOffice(id: number, payload: UpdateOfficePayload): Promise<ApiOffice> {
  const { data, status } = await request<ApiOffice>(`/api/offices/${id}/`, {
    method: "PATCH",
    body: payload,
  });
  if (status !== 200) {
    const msg = (data as { error?: string })?.error ?? "Failed to update";
    throw new Error(msg);
  }
  return data;
}

export async function deleteOffice(id: number): Promise<void> {
  const { status, data } = await request<{ message?: string }>(`/api/offices/${id}/`, { method: "DELETE" });
  if (status !== 200) {
    const msg = (data as { error?: string })?.error ?? "Failed to delete";
    throw new Error(msg);
  }
}

// ——— Employees ———

export type DesignationOption = { value: string; label: string };

export type DesignationListResponse = {
  designations: DesignationOption[];
};

export async function fetchDesignations(): Promise<DesignationOption[]> {
  const { data, status } = await request<DesignationListResponse>("/api/employees/designations/", { method: "GET" });
  if (status !== 200 || !data?.designations) return [];
  return data.designations;
}

export type ApiEmployee = {
  id: number;
  organization_id: number;
  office_id: number;
  emp_code: string;
  name: string;
  designation: string;
  gender: string;
  date_of_birth: string | null;
  email: string;
  phone_number: string;
  government_id_type?: string;
  government_id_value?: string;
  profile_pic: string | null;
  is_active: boolean;
  created_at: string | null;
};

export type EmployeeListResponse = {
  employees: ApiEmployee[];
};

export async function fetchEmployees(organizationId?: number, officeId?: number): Promise<ApiEmployee[]> {
  const params = new URLSearchParams();
  if (organizationId != null) params.set("organization_id", String(organizationId));
  if (officeId != null) params.set("office_id", String(officeId));
  const query = params.toString();
  const path = query ? `/api/employees/?${query}` : "/api/employees/";
  const { data, status } = await request<EmployeeListResponse>(path, { method: "GET" });
  if (status === 401 || status !== 200 || !data?.employees) return [];
  return data.employees;
}

export type CreateEmployeePayload = {
  organization_id: number;
  office_id: number;
  shift_id?: number | null;
  emp_code: string;
  name: string;
  designation?: string;
  gender?: string;
  date_of_birth?: string | null;
  email?: string;
  phone_number?: string;
  government_id_type?: string;
  government_id_value?: string;
};

export type CreateEmployeeWithLoginPayload = {
  organization_id: number;
  office_id: number;
  shift_id?: number | null;
  emp_code: string;
  name: string;
  designation: "MANAGER" | "SUPERVISOR";
  email: string;
  password: string;
  phone_number?: string;
  gender?: string;
  date_of_birth?: string | null;
  government_id_type?: string;
  government_id_value?: string;
};

export async function createEmployeeWithLogin(
  payload: CreateEmployeeWithLoginPayload
): Promise<ApiEmployee> {
  const body: Record<string, unknown> = {
    organization_id: payload.organization_id,
    office_id: payload.office_id,
    emp_code: payload.emp_code,
    name: payload.name,
    designation: payload.designation,
    email: payload.email,
    password: payload.password,
  };
  if (payload.shift_id != null) body.shift_id = payload.shift_id;
  if (payload.phone_number) body.phone_number = payload.phone_number;
  if (payload.gender) body.gender = payload.gender;
  if (payload.date_of_birth != null) body.date_of_birth = payload.date_of_birth;
  if (payload.government_id_type) body.government_id_type = payload.government_id_type;
  if (payload.government_id_value) body.government_id_value = payload.government_id_value;
  const { data, status } = await request<ApiEmployee>("/api/employees/create-with-login/", {
    method: "POST",
    body,
  });
  if (status !== 201) {
    const msg = (data as { error?: string })?.error ?? "Failed to create";
    throw new Error(msg);
  }
  return data;
}

export async function createEmployee(
  payload: CreateEmployeePayload,
  profilePicFile?: File | null
): Promise<ApiEmployee> {
  if (profilePicFile) {
    const formData = new FormData();
    formData.append("organization_id", String(payload.organization_id));
    formData.append("office_id", String(payload.office_id));
    formData.append("emp_code", payload.emp_code);
    formData.append("name", payload.name);
    if (payload.designation) formData.append("designation", payload.designation);
    if (payload.gender) formData.append("gender", payload.gender);
    if (payload.date_of_birth) formData.append("date_of_birth", payload.date_of_birth);
    if (payload.email) formData.append("email", payload.email);
    if (payload.phone_number) formData.append("phone_number", payload.phone_number);
    if (payload.shift_id != null) formData.append("shift_id", String(payload.shift_id));
    if (payload.government_id_type) formData.append("government_id_type", payload.government_id_type);
    if (payload.government_id_value) formData.append("government_id_value", payload.government_id_value);
    formData.append("profile_pic", profilePicFile);
    const { data, status } = await requestFormData<ApiEmployee>("/api/employees/", formData, "POST");
    if (status !== 201) {
      const msg = (data as { error?: string })?.error ?? "Failed to create employee";
      throw new Error(msg);
    }
    return data;
  }
  const body: Record<string, unknown> = {
    organization_id: payload.organization_id,
    office_id: payload.office_id,
    emp_code: payload.emp_code,
    name: payload.name,
  };
  if (payload.designation) body.designation = payload.designation;
  if (payload.gender) body.gender = payload.gender;
  if (payload.date_of_birth != null) body.date_of_birth = payload.date_of_birth;
  if (payload.email) body.email = payload.email;
  if (payload.phone_number) body.phone_number = payload.phone_number;
  if (payload.shift_id != null) body.shift_id = payload.shift_id;
  if (payload.government_id_type) body.government_id_type = payload.government_id_type;
  if (payload.government_id_value) body.government_id_value = payload.government_id_value;
  const { data, status } = await request<ApiEmployee>("/api/employees/", {
    method: "POST",
    body,
  });
  if (status !== 201) {
    const msg = (data as { error?: string })?.error ?? "Failed to create employee";
    throw new Error(msg);
  }
  return data;
}

export async function fetchEmployee(id: number): Promise<ApiEmployee | null> {
  const { data, status } = await request<ApiEmployee>(`/api/employees/${id}/`, { method: "GET" });
  if (status !== 200) return null;
  return data;
}

export type UpdateEmployeePayload = {
  name?: string;
  designation?: string;
  gender?: string;
  date_of_birth?: string | null;
  email?: string;
  phone_number?: string;
  government_id_type?: string;
  government_id_value?: string;
  emp_code?: string;
  office_id?: number;
  is_active?: boolean;
};

export async function updateEmployee(
  id: number,
  payload: UpdateEmployeePayload,
  profilePicFile?: File | null
): Promise<ApiEmployee> {
  if (profilePicFile) {
    const formData = new FormData();
    if (payload.name !== undefined) formData.append("name", payload.name);
    if (payload.designation !== undefined) formData.append("designation", payload.designation);
    if (payload.gender !== undefined) formData.append("gender", payload.gender);
    if (payload.date_of_birth !== undefined) formData.append("date_of_birth", payload.date_of_birth ?? "");
    if (payload.email !== undefined) formData.append("email", payload.email);
    if (payload.phone_number !== undefined) formData.append("phone_number", payload.phone_number);
    if (payload.emp_code !== undefined) formData.append("emp_code", payload.emp_code);
    if (payload.office_id !== undefined) formData.append("office_id", String(payload.office_id));
    if (payload.is_active !== undefined) formData.append("is_active", String(payload.is_active));
    if (payload.government_id_type !== undefined) formData.append("government_id_type", payload.government_id_type);
    if (payload.government_id_value !== undefined) formData.append("government_id_value", payload.government_id_value);
    formData.append("profile_pic", profilePicFile);
    const { data, status } = await requestFormData<ApiEmployee>(`/api/employees/${id}/`, formData, "PATCH");
    if (status !== 200) {
      const msg = (data as { error?: string })?.error ?? "Failed to update";
      throw new Error(msg);
    }
    return data;
  }
  const { data, status } = await request<ApiEmployee>(`/api/employees/${id}/`, {
    method: "PATCH",
    body: payload,
  });
  if (status !== 200) {
    const msg = (data as { error?: string })?.error ?? "Failed to update";
    throw new Error(msg);
  }
  return data;
}

export async function deleteEmployee(id: number): Promise<void> {
  const { status, data } = await request<{ message?: string }>(`/api/employees/${id}/`, { method: "DELETE" });
  if (status !== 200) {
    const msg = (data as { error?: string })?.error ?? "Failed to delete";
    throw new Error(msg);
  }
}

export type CheckDuplicateResponse = {
  phone_number_taken: boolean;
  email_taken: boolean;
  government_id_value_taken: boolean;
};

/** GET /api/employees/check-duplicate/ — Check if phone/email/govt_id already used by active employee in same office. */
export async function checkEmployeeDuplicate(
  officeId: number,
  params: { phone_number?: string; email?: string; government_id_value?: string },
  excludeEmployeeId?: number
): Promise<CheckDuplicateResponse> {
  const searchParams = new URLSearchParams({ office_id: String(officeId) });
  if (params.phone_number?.trim()) searchParams.set("phone_number", params.phone_number.trim());
  if (params.email?.trim()) searchParams.set("email", params.email.trim());
  if (params.government_id_value?.trim()) searchParams.set("government_id_value", params.government_id_value.trim());
  if (excludeEmployeeId != null) searchParams.set("exclude_employee_id", String(excludeEmployeeId));
  const { data, status } = await request<CheckDuplicateResponse>(`/api/employees/check-duplicate/?${searchParams.toString()}`);
  if (status !== 200) {
    const msg = (data as { error?: string })?.error ?? "Check failed";
    throw new Error(msg);
  }
  return data;
}

/** GET /api/employees/export/ — returns CSV blob. Optional organization_id, office_id query params. */
export async function exportEmployeesBlob(organizationId?: number, officeId?: number): Promise<Blob> {
  const params = new URLSearchParams();
  if (organizationId != null) params.set("organization_id", String(organizationId));
  if (officeId != null) params.set("office_id", String(officeId));
  const query = params.toString();
  const path = query ? `/api/employees/export/?${query}` : "/api/employees/export/";
  return requestBlob(path, { errorMessage: "Export failed" });
}

export type ImportEmployeesResponse = {
  created: number;
  errors: string[];
  message: string;
  skipped_duplicate_rows?: number;
  total_errors?: number;
  total_rows?: number;
};

/** POST /api/employees/import/ — multipart: file, organization_id, office_id. */
export async function importEmployees(
  file: File,
  organizationId: number,
  officeId: number
): Promise<ImportEmployeesResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("organization_id", String(organizationId));
  formData.append("office_id", String(officeId));
  const { data, status } = await requestFormData<ImportEmployeesResponse>("/api/employees/import/", formData, "POST");
  if (status !== 200) {
    const msg = (data as { error?: string })?.error ?? "Import failed";
    throw new Error(msg);
  }
  return data;
}

// ——— Shifts ———

export type ApiShift = {
  id: number;
  office_id: number;
  name: string;
  start_time: string | null;
  end_time: string | null;
  grace_minutes: number;
  is_night_shift: boolean;
  is_active: boolean;
  created_at: string | null;
};

export type ShiftListResponse = {
  shifts: ApiShift[];
};

export async function fetchShifts(officeId?: number): Promise<ApiShift[]> {
  const path = officeId != null ? `/api/shifts/?office_id=${officeId}` : "/api/shifts/";
  const { data, status } = await request<ShiftListResponse>(path, { method: "GET" });
  if (status === 401 || status !== 200 || !data?.shifts) return [];
  return data.shifts;
}

export type CreateShiftPayload = {
  office_id: number;
  name: string;
  start_time: string;
  end_time: string;
  grace_minutes?: number;
  is_night_shift?: boolean;
  is_active?: boolean;
};

export async function createShift(payload: CreateShiftPayload): Promise<ApiShift> {
  const { data, status } = await request<ApiShift>("/api/shifts/", {
    method: "POST",
    body: payload,
  });
  if (status !== 201) {
    const msg = (data as { error?: string })?.error ?? "Failed to create shift";
    throw new Error(msg);
  }
  return data;
}

export async function fetchShift(id: number): Promise<ApiShift | null> {
  const { data, status } = await request<ApiShift>(`/api/shifts/${id}/`, { method: "GET" });
  if (status !== 200) return null;
  return data;
}

export type UpdateShiftPayload = {
  name?: string;
  start_time?: string;
  end_time?: string;
  grace_minutes?: number;
  is_night_shift?: boolean;
  is_active?: boolean;
};

export async function updateShift(id: number, payload: UpdateShiftPayload): Promise<ApiShift> {
  const { data, status } = await request<ApiShift>(`/api/shifts/${id}/`, {
    method: "PATCH",
    body: payload,
  });
  if (status !== 200) {
    const msg = (data as { error?: string })?.error ?? "Failed to update";
    throw new Error(msg);
  }
  return data;
}

export async function deleteShift(id: number): Promise<void> {
  const { status, data } = await request<{ message?: string }>(`/api/shifts/${id}/`, { method: "DELETE" });
  if (status !== 200) {
    const msg = (data as { error?: string })?.error ?? "Failed to delete";
    throw new Error(msg);
  }
}

// ——— Biometric / ESSL logs (Daily Attendance) ———

export type EsslLogEntry = {
  employee_code: string;
  employee_name: string;
  device_id: string;
  direction: string;
  log_date: string | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  hours_worked?: number | null;
};

export type EsslLogsResponse = {
  logs: EsslLogEntry[];
};

export async function fetchEsslLogs(): Promise<EsslLogEntry[]> {
  const { data, status } = await request<EsslLogsResponse>("/api/biometric/essl-logs/", { method: "GET" });
  if (status !== 200) {
    const msg = (data as { error?: string })?.error ?? "Failed to load attendance logs";
    throw new Error(msg);
  }
  return data?.logs ?? [];
}
