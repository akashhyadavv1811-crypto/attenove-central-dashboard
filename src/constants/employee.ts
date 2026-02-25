import type { DesignationOption } from "@/lib/api";

/** Fallback designation options when API designations are not yet loaded. */
export const DESIGNATION_FALLBACK: DesignationOption[] = [
  { value: "ORG_ADMIN", label: "Org Admin" },
  { value: "OFFICE_ADMIN", label: "Office Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "SUPERVISOR", label: "Supervisor" },
  { value: "EMPLOYEE", label: "Staff" },
  { value: "SUPPORT_STAFF", label: "Support Staff" },
];

/** Only these designations can be set when adding a new employee (Add Employee form). */
export const ADD_EMPLOYEE_DESIGNATION_OPTIONS: DesignationOption[] = [
  { value: "EMPLOYEE", label: "Staff" },
  { value: "SUPPORT_STAFF", label: "Support Staff" },
];

/** Designations for Create Manager/Supervisor (with login). */
export const MANAGER_SUPERVISOR_OPTIONS: DesignationOption[] = [
  { value: "MANAGER", label: "Manager" },
  { value: "SUPERVISOR", label: "Supervisor" },
];

/** Government ID type options for employee forms. */
export const GOVERNMENT_ID_TYPES = [
  { value: "", label: "—" },
  { value: "License", label: "License" },
  { value: "PanCard", label: "Pan Card" },
  { value: "AadhaarCard", label: "Aadhaar Card" },
  { value: "VoterID", label: "Voter ID" },
] as const;
