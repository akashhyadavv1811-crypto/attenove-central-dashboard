import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createEmployeeWithLogin, fetchShifts } from "@/lib/api";
import type { ApiEmployee, ApiShift } from "@/lib/api";
import { toast } from "sonner";
import { GOVERNMENT_ID_TYPES, MANAGER_SUPERVISOR_OPTIONS } from "@/constants/employee";
import { useEmployeeDuplicateCheck } from "@/hooks";
import { getDobValidationError } from "@/lib/utils";

interface AddManagerOrSupervisorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizations: { id: number; name: string }[];
  offices: { id: number; name: string; organizationId: number }[];
  onSuccess?: (employee: ApiEmployee) => void;
}

const emptyForm = {
  organizationId: "" as string | number,
  officeId: "" as string | number,
  shiftId: "" as string | number,
  empCode: "",
  name: "",
  designation: "MANAGER" as "MANAGER" | "SUPERVISOR",
  email: "",
  password: "",
  phone: "",
  gender: "",
  dateOfBirth: "",
  governmentIdType: "",
  governmentIdValue: "",
};

export function AddManagerOrSupervisorModal({
  open,
  onOpenChange,
  organizations,
  offices,
  onSuccess,
}: AddManagerOrSupervisorModalProps) {
  const [formData, setFormData] = useState(emptyForm);
  const [shifts, setShifts] = useState<ApiShift[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dobError, setDobError] = useState<string | undefined>(undefined);

  const { duplicateErrors, setDuplicateErrors, checkDuplicates } = useEmployeeDuplicateCheck({
    getOfficeId: () => formData.officeId,
    getPhone: () => formData.phone,
    getEmail: () => formData.email,
    getGovernmentIdValue: () => formData.governmentIdValue,
  });

  const officesForOrg =
    formData.organizationId !== ""
      ? offices.filter((o) => o.organizationId === Number(formData.organizationId))
      : [];

  useEffect(() => {
    if (open) {
      setFormData({
        ...emptyForm,
        organizationId: organizations[0]?.id ?? "",
        officeId: "",
      });
    }
  }, [open, organizations]);

  useEffect(() => {
    if (formData.organizationId !== "" && officesForOrg.length > 0 && formData.officeId === "") {
      setFormData((prev) => ({ ...prev, officeId: officesForOrg[0].id }));
    }
  }, [formData.organizationId, officesForOrg.length]);

  useEffect(() => {
    setDuplicateErrors({});
  }, [formData.officeId]);

  useEffect(() => {
    if (formData.officeId === "") {
      setShifts([]);
      return;
    }
    fetchShifts(Number(formData.officeId)).then(setShifts).catch(() => setShifts([]));
  }, [formData.officeId]);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) setFormData(emptyForm);
    onOpenChange(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dobErr = formData.dateOfBirth.trim() ? getDobValidationError(formData.dateOfBirth) : undefined;
    setDobError(dobErr ?? undefined);
    if (dobErr) {
      toast.error(dobErr);
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (duplicateErrors.phone || duplicateErrors.email || duplicateErrors.governmentIdValue) {
      toast.error("Please fix duplicate phone, email, or government ID before submitting.");
      return;
    }
    const orgId = Number(formData.organizationId);
    const officeId = Number(formData.officeId);
    if (!orgId || !officeId || !formData.empCode.trim() || !formData.name.trim()) {
      toast.error("Organization, Office, Emp Code, and Name are required.");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required for login.");
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await createEmployeeWithLogin({
        organization_id: orgId,
        office_id: officeId,
        shift_id: formData.shiftId !== "" ? Number(formData.shiftId) : null,
        emp_code: formData.empCode.trim(),
        name: formData.name.trim(),
        designation: formData.designation,
        email: formData.email.trim(),
        password: formData.password,
        phone_number: formData.phone.trim() || undefined,
        gender: formData.gender && ["M", "F", "O"].includes(formData.gender) ? formData.gender : undefined,
        date_of_birth: formData.dateOfBirth.trim() || undefined,
        government_id_type: formData.governmentIdType.trim() || undefined,
        government_id_value: formData.governmentIdValue.trim() || undefined,
      });
      toast.success("Manager/Supervisor created. They can now log in with their email and password.");
      onSuccess?.(created);
      handleClose(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[90vh] min-h-[50vh] flex flex-col p-0 gap-0">
        <div className="bg-primary text-primary-foreground px-6 pt-10 pb-3 shrink-0 rounded-t-lg sm:rounded-t-lg">
          <DialogTitle className="text-lg font-semibold text-white">Create Manager or Supervisor</DialogTitle>
          <p className="text-xs text-white/70 mt-0.5">Same as Add Employee, plus login (email and password) for reporting.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="overflow-y-auto min-h-0 flex-1 max-h-[calc(90vh-11rem)] scrollbar-modal px-6 pr-5">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="mgr-org">Organization</Label>
                  <Select
                    value={String(formData.organizationId)}
                    onValueChange={(v) =>
                      setFormData({ ...formData, organizationId: v ? Number(v) : "", officeId: "", shiftId: "" })
                    }
                    required
                  >
                    <SelectTrigger id="mgr-org">
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={String(org.id)}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mgr-office">Office</Label>
                  <Select
                    value={formData.officeId !== "" ? String(formData.officeId) : ""}
                    onValueChange={(v) => setFormData({ ...formData, officeId: v ? Number(v) : "", shiftId: "" })}
                    required
                    disabled={officesForOrg.length === 0}
                  >
                    <SelectTrigger id="mgr-office">
                      <SelectValue placeholder={officesForOrg.length === 0 ? "No offices" : "Select office"} />
                    </SelectTrigger>
                    <SelectContent>
                      {officesForOrg.map((office) => (
                        <SelectItem key={office.id} value={String(office.id)}>
                          {office.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mgr-name">Full Name</Label>
                <Input
                  id="mgr-name"
                  placeholder="Enter employee name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="mgr-code">Emp Code</Label>
                  <Input
                    id="mgr-code"
                    placeholder="e.g. EMP001"
                    value={formData.empCode}
                    onChange={(e) => setFormData({ ...formData, empCode: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mgr-designation">Designation</Label>
                  <Select
                    value={formData.designation}
                    onValueChange={(v) => setFormData({ ...formData, designation: v as "MANAGER" | "SUPERVISOR" })}
                  >
                    <SelectTrigger id="mgr-designation">
                      <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                    <SelectContent>
                      {MANAGER_SUPERVISOR_OPTIONS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mgr-shift">Shift</Label>
                <Select
                  value={formData.shiftId !== "" ? String(formData.shiftId) : "none"}
                  onValueChange={(v) => setFormData({ ...formData, shiftId: v === "none" ? "" : Number(v) })}
                  disabled={!formData.officeId}
                >
                  <SelectTrigger id="mgr-shift">
                    <SelectValue placeholder={!formData.officeId ? "Select office first" : shifts.length === 0 ? "No shifts" : "Select shift (optional)"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">—</SelectItem>
                    {shifts.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name} {s.start_time && s.end_time ? `(${s.start_time} – ${s.end_time})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="mgr-email">Email (Login ID)</Label>
                  <Input
                    id="mgr-email"
                    type="email"
                    placeholder="employee@company.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (duplicateErrors.email) setDuplicateErrors((p) => ({ ...p, email: undefined }));
                    }}
                    onBlur={() => formData.email.trim() && checkDuplicates("email")}
                    className={duplicateErrors.email ? "border-destructive" : ""}
                    required
                  />
                  {duplicateErrors.email && (
                    <p className="text-xs text-destructive">{duplicateErrors.email}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mgr-password">Password</Label>
                  <Input
                    id="mgr-password"
                    type="password"
                    placeholder="Min 8 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    minLength={8}
                    required
                  />
                  <p className="text-xs text-muted-foreground">They will use this with email to log in.</p>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mgr-phone">Phone Number</Label>
                <Input
                  id="mgr-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (duplicateErrors.phone) setDuplicateErrors((p) => ({ ...p, phone: undefined }));
                  }}
                  onBlur={() => formData.phone.trim() && checkDuplicates("phone")}
                  className={duplicateErrors.phone ? "border-destructive" : ""}
                />
                {duplicateErrors.phone && (
                  <p className="text-xs text-destructive">{duplicateErrors.phone}</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="mgr-gender">Gender</Label>
                  <Select
                    value={formData.gender || "none"}
                    onValueChange={(v) => setFormData({ ...formData, gender: v === "none" ? "" : v })}
                  >
                    <SelectTrigger id="mgr-gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">—</SelectItem>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                      <SelectItem value="O">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mgr-dob">Date of Birth</Label>
                  <Input
                    id="mgr-dob"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => {
                      setFormData({ ...formData, dateOfBirth: e.target.value });
                      if (dobError) setDobError(getDobValidationError(e.target.value));
                    }}
                    onBlur={() => setDobError(formData.dateOfBirth.trim() ? getDobValidationError(formData.dateOfBirth) ?? undefined : undefined)}
                    className={dobError ? "border-destructive" : ""}
                  />
                  {dobError && <p className="text-xs text-destructive">{dobError}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="mgr-gov-id-type">Government ID Type</Label>
                  <Select
                    value={formData.governmentIdType || "none"}
                    onValueChange={(v) => setFormData({ ...formData, governmentIdType: v === "none" ? "" : v })}
                  >
                    <SelectTrigger id="mgr-gov-id-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOVERNMENT_ID_TYPES.map((opt) => (
                        <SelectItem key={opt.value || "none"} value={opt.value || "none"}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mgr-gov-id-value">Government ID Value</Label>
                  <Input
                    id="mgr-gov-id-value"
                    placeholder="ID number"
                    value={formData.governmentIdValue}
                    onChange={(e) => {
                      setFormData({ ...formData, governmentIdValue: e.target.value });
                      if (duplicateErrors.governmentIdValue) setDuplicateErrors((p) => ({ ...p, governmentIdValue: undefined }));
                    }}
                    onBlur={() => formData.governmentIdValue.trim() && checkDuplicates("governmentIdValue")}
                    className={duplicateErrors.governmentIdValue ? "border-destructive" : ""}
                  />
                  {duplicateErrors.governmentIdValue && (
                    <p className="text-xs text-destructive">{duplicateErrors.governmentIdValue}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-row justify-between sm:justify-between px-6 py-4 border-t border-border shrink-0">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Manager/Supervisor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
