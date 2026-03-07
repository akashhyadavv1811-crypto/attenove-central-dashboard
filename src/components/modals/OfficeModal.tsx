import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Building2, User } from "lucide-react";
import { createOfficeWithAdmin, fetchOffice, fetchEmployee, fetchEmployees, updateOffice, updateEmployee } from "@/lib/api";
import { GOVERNMENT_ID_TYPES } from "@/constants/employee";
import { getDobValidationError } from "@/lib/utils";
import type { ApiOffice, ApiEmployee } from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface Office {
  id: number;
  name: string;
  organizationId: number;
  organizationName?: string;
  location: string;
  fullAddress: string;
  numBiometricDevices: number;
  status: string;
  /** Set by backend when office is created with admin; used to show prefilled admin in Edit */
  managerId?: number | null;
}

type Mode = "add" | "edit";

interface OfficeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  /** Required when mode is "edit" */
  office?: Office | null;
  /** List of organizations for the dropdown (add) and display (edit) */
  organizations: { id: number; name: string }[];
  onAddSuccess?: (office: ApiOffice) => void;
  onEditSave?: (office: Office) => void;
}

const emptyEditForm = {
  organizationId: "" as string | number,
  name: "",
  location: "",
  fullAddress: "",
  numBiometricDevices: 0,
  isActive: true,
};

const OFFICE_ADMIN_DESIGNATION = "OFFICE_ADMIN";

const emptyEditAdminForm = {
  adminName: "",
  adminEmail: "",
  adminPhone: "",
  adminEmpCode: "",
  adminGender: "",
  adminGovtIdType: "",
  adminGovtIdValue: "",
  adminDob: "",
};

const emptyAddForm = {
  adminName: "",
  adminEmail: "",
  adminPassword: "",
  adminPhone: "",
  adminEmpCode: "",
  adminDesignation: OFFICE_ADMIN_DESIGNATION,
  adminGender: "",
  adminGovtIdType: "",
  adminGovtIdValue: "",
  adminDob: "",
  organizationId: "" as string | number,
  name: "",
  location: "",
  fullAddress: "",
  numBiometricDevices: 0,
};

export function OfficeModal({
  open,
  onOpenChange,
  mode,
  office = null,
  organizations,
  onAddSuccess,
  onEditSave,
}: OfficeModalProps) {
  const { user } = useAuth();
  const isAdd = mode === "add";
  const isSuperAdmin = user?.is_superadmin === true;

  // Add flow: 2 steps
  const [step, setStep] = useState(1);
  const [addFormData, setAddFormData] = useState(emptyAddForm);
  const [adminDobError, setAdminDobError] = useState<string | undefined>(undefined);

  // Edit flow: 2 steps like Add; admin is resolved from office.manager_id or employees in office
  const [editStep, setEditStep] = useState(1);
  const [formData, setFormData] = useState(emptyEditForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editAdminEmployee, setEditAdminEmployee] = useState<ApiEmployee | null | "loading">(null);
  const [editAdminFormData, setEditAdminFormData] = useState(emptyEditAdminForm);

  useEffect(() => {
    if (open) {
      if (office) {
        setEditStep(1);
        setEditAdminEmployee("loading");
        setFormData({
          organizationId: office.organizationId,
          name: office.name,
          location: office.location ?? "",
          fullAddress: office.fullAddress ?? "",
          numBiometricDevices: office.numBiometricDevices ?? 0,
          isActive: office.status === "Active",
        });
        (async () => {
          try {
            const apiOffice = await fetchOffice(office!.id);
            let admin: ApiEmployee | null = null;
            const managerId = apiOffice?.manager_id ?? office.managerId;
            if (managerId) {
              admin = await fetchEmployee(managerId);
            }
            if (!admin && office.organizationId && office.id) {
              const employees = await fetchEmployees(office.organizationId, office.id);
              const officeAdmin = employees.find((e) => e.designation === OFFICE_ADMIN_DESIGNATION);
              admin = officeAdmin ?? null;
            }
            setEditAdminEmployee(admin);
            if (admin) {
              setEditAdminFormData({
                adminName: admin.name ?? "",
                adminEmail: admin.email ?? "",
                adminPhone: admin.phone_number ?? "",
                adminEmpCode: admin.emp_code ?? "",
                adminGender: admin.gender ?? "",
                adminGovtIdType: admin.government_id_type ?? "",
                adminGovtIdValue: admin.government_id_value ?? "",
                adminDob: admin.date_of_birth ?? "",
              });
            } else {
              setEditAdminFormData(emptyEditAdminForm);
            }
          } catch {
            setEditAdminEmployee(null);
            setEditAdminFormData(emptyEditAdminForm);
          }
        })();
      } else {
        setStep(1);
        setEditAdminEmployee(null);
        setAddFormData({
          ...emptyAddForm,
          organizationId: organizations[0]?.id ?? "",
        });
      }
    }
  }, [open, office, organizations]);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setStep(1);
      setEditStep(1);
      setEditAdminEmployee(null);
      setEditAdminFormData(emptyEditAdminForm);
      setAddFormData(emptyAddForm);
      setFormData(emptyEditForm);
      setAdminDobError(undefined);
    }
    onOpenChange(isOpen);
  };

  const isAdminDetailsValid = () => {
    const email = addFormData.adminEmail.trim();
    const password = addFormData.adminPassword;
    const empCode = addFormData.adminEmpCode.trim();
    return email.length > 0 && password.length >= 8 && empCode.length > 0;
  };

  const goToStep = (newStep: number) => {
    if (newStep === 2) {
      if (!isAdminDetailsValid()) {
        toast.error("Please fill in Office Admin Email, Password (min 8 characters), and Emp Code before continuing.");
        return;
      }
      const dobErr = addFormData.adminDob.trim() ? getDobValidationError(addFormData.adminDob) : undefined;
      setAdminDobError(dobErr ?? undefined);
      if (dobErr) {
        toast.error(dobErr);
        return;
      }
    }
    setStep(newStep);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      if (!isAdminDetailsValid()) {
        toast.error("Please fill in Office Admin Email, Password (min 8 characters), and Emp Code before continuing.");
        return;
      }
      setStep(2);
      return;
    }
    const dobErr = addFormData.adminDob.trim() ? getDobValidationError(addFormData.adminDob) : undefined;
    setAdminDobError(dobErr ?? undefined);
    if (dobErr) {
      toast.error(dobErr);
      return;
    }
    const orgId = Number(addFormData.organizationId);
    if (!orgId || !addFormData.name.trim()) {
      toast.error("Organization and Office name are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await createOfficeWithAdmin({
        organization_id: orgId,
        office: {
          name: addFormData.name.trim(),
          location: addFormData.location.trim() || undefined,
          full_address: addFormData.fullAddress.trim() || undefined,
          num_biometric_devices: Math.max(0, Number(addFormData.numBiometricDevices) || 0),
        },
        admin: {
          name: addFormData.adminName.trim() || undefined,
          email: addFormData.adminEmail.trim(),
          password: addFormData.adminPassword,
          phone_number: addFormData.adminPhone.trim() || undefined,
          emp_code: addFormData.adminEmpCode.trim() || undefined,
          designation: OFFICE_ADMIN_DESIGNATION,
          gender: addFormData.adminGender.trim() || undefined,
          government_id_type: addFormData.adminGovtIdType.trim() || undefined,
          government_id_value: addFormData.adminGovtIdValue.trim() || undefined,
          date_of_birth: addFormData.adminDob.trim() || undefined,
        },
      });
      toast.success("Office created.");
      onAddSuccess?.(created);
      handleClose(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create office.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editStep !== 2) return;
    if (!office) return;
    if (!formData.name.trim()) {
      toast.error("Office name is required.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (isSuperAdmin && editAdminEmployee && editAdminEmployee !== "loading") {
        await updateEmployee(editAdminEmployee.id, {
          name: editAdminFormData.adminName.trim() || undefined,
          email: editAdminFormData.adminEmail.trim() || undefined,
          phone_number: editAdminFormData.adminPhone.trim() || undefined,
          emp_code: editAdminFormData.adminEmpCode.trim() || undefined,
          gender: editAdminFormData.adminGender.trim() || undefined,
          government_id_type: editAdminFormData.adminGovtIdType.trim() || undefined,
          government_id_value: editAdminFormData.adminGovtIdValue.trim() || undefined,
          date_of_birth: editAdminFormData.adminDob.trim() || undefined,
        });
      }
      await updateOffice(office.id, {
        name: formData.name.trim(),
        location: formData.location.trim() || undefined,
        full_address: formData.fullAddress.trim() || undefined,
        num_biometric_devices: Math.max(0, Number(formData.numBiometricDevices) || 0),
        is_active: formData.isActive,
      });
      const updated: Office = {
        ...office,
        name: formData.name.trim(),
        location: formData.location.trim(),
        fullAddress: formData.fullAddress.trim(),
        numBiometricDevices: Math.max(0, Number(formData.numBiometricDevices) || 0),
        status: formData.isActive ? "Active" : "Inactive",
      };
      toast.success("Office updated.");
      onEditSave?.(updated);
      handleClose(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ——— Add mode: 2-step form ———
  if (isAdd) {
    const progressValue = (step / 2) * 100;
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] p-0 gap-0 overflow-hidden">
          <div className="bg-primary text-primary-foreground px-6 pt-10 pb-3 rounded-t-lg sm:rounded-t-lg">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`p-2 rounded-lg transition-colors cursor-pointer hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 ${step === 1 ? "bg-white/20 text-white" : "bg-white/10 text-white/70"}`}
                aria-label="Go to Office Admin"
              >
                <User className="h-4 w-4" />
              </button>
              <div className="h-px flex-1 bg-white/30" />
              <button
                type="button"
                onClick={() => goToStep(2)}
                className={`p-2 rounded-lg transition-colors cursor-pointer hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 ${step === 2 ? "bg-white/20 text-white" : "bg-white/10 text-white/70"}`}
                aria-label="Go to Office Details"
              >
                <Building2 className="h-4 w-4" />
              </button>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden mb-1">
              <Progress value={progressValue} className="h-1.5 rounded-full bg-transparent [&>div]:h-full [&>div]:rounded-full [&>div]:bg-white/90" />
            </div>
            <DialogTitle className="text-lg font-semibold text-white mt-2">
              {step === 1 ? "Office Admin Details" : "Office Details"}
            </DialogTitle>
            <DialogDescription className="text-xs text-white/70 mt-0.5">
              {step === 1
                ? "Enter the details of the office admin or primary contact."
                : "Enter office name and address details."}
            </DialogDescription>
          </div>

          <form onSubmit={handleAddSubmit}>
            <div className="grid gap-4 px-6 py-5 max-h-[55vh] overflow-y-auto">
              {step === 1 && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="admin-name">Admin Name</Label>
                    <Input
                      id="admin-name"
                      placeholder="e.g. John Doe"
                      value={addFormData.adminName}
                      onChange={(e) => setAddFormData({ ...addFormData, adminName: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="admin-email">Email Address</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="e.g. admin@office.com"
                      value={addFormData.adminEmail}
                      onChange={(e) => setAddFormData({ ...addFormData, adminEmail: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Set a password for the office admin account"
                      value={addFormData.adminPassword}
                      onChange={(e) => setAddFormData({ ...addFormData, adminPassword: e.target.value })}
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="admin-phone">Phone Number</Label>
                      <Input
                        id="admin-phone"
                        type="tel"
                        placeholder="e.g. +91 98765 43210"
                        value={addFormData.adminPhone}
                        onChange={(e) => setAddFormData({ ...addFormData, adminPhone: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="admin-emp-code">Emp Code</Label>
                      <Input
                        id="admin-emp-code"
                        placeholder="e.g. OA001"
                        value={addFormData.adminEmpCode}
                        onChange={(e) => setAddFormData({ ...addFormData, adminEmpCode: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="admin-govt-id-type">Govt ID Type</Label>
                      <Select
                        value={addFormData.adminGovtIdType || "__none__"}
                        onValueChange={(v) => setAddFormData({ ...addFormData, adminGovtIdType: v === "__none__" ? "" : v })}
                      >
                        <SelectTrigger id="admin-govt-id-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {GOVERNMENT_ID_TYPES.map((opt) => (
                            <SelectItem key={opt.value || "__none__"} value={opt.value || "__none__"}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="admin-govt-id-value">Govt ID Number</Label>
                      <Input
                        id="admin-govt-id-value"
                        placeholder="ID number"
                        value={addFormData.adminGovtIdValue}
                        onChange={(e) => setAddFormData({ ...addFormData, adminGovtIdValue: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="admin-dob">Date of Birth</Label>
                      <Input
                        id="admin-dob"
                        type="date"
                        value={addFormData.adminDob}
                        onChange={(e) => {
                          setAddFormData({ ...addFormData, adminDob: e.target.value });
                          if (adminDobError) setAdminDobError(getDobValidationError(e.target.value) ?? undefined);
                        }}
                        onBlur={() => setAdminDobError(addFormData.adminDob.trim() ? getDobValidationError(addFormData.adminDob) ?? undefined : undefined)}
                        className={adminDobError ? "border-destructive" : ""}
                      />
                      {adminDobError && <p className="text-xs text-destructive">{adminDobError}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="admin-gender">Gender</Label>
                      <Select
                        value={addFormData.adminGender || "none"}
                        onValueChange={(v) => setAddFormData({ ...addFormData, adminGender: v === "none" ? "" : v })}
                      >
                        <SelectTrigger id="admin-gender">
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
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="office-org">Organization</Label>
                    <Select
                      value={String(addFormData.organizationId)}
                      onValueChange={(v) => setAddFormData({ ...addFormData, organizationId: v ? Number(v) : "" })}
                    >
                      <SelectTrigger id="office-org">
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
                    <Label htmlFor="office-name">Office Name</Label>
                    <Input
                      id="office-name"
                      placeholder="e.g. Headquarters, Branch Office"
                      value={addFormData.name}
                      onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="office-location">Location</Label>
                    <Input
                      id="office-location"
                      placeholder="e.g. Mumbai, Andheri East"
                      value={addFormData.location}
                      onChange={(e) => setAddFormData({ ...addFormData, location: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="office-full-address">Full Address</Label>
                    <Input
                      id="office-full-address"
                      placeholder="e.g. 123 Main St, Building A"
                      value={addFormData.fullAddress}
                      onChange={(e) => setAddFormData({ ...addFormData, fullAddress: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="office-devices">Number of Biometric Devices</Label>
                    <Input
                      id="office-devices"
                      type="number"
                      min={0}
                      placeholder="0"
                      value={addFormData.numBiometricDevices === 0 ? "" : addFormData.numBiometricDevices}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          numBiometricDevices: Math.max(0, parseInt(e.target.value, 10) || 0),
                        })
                      }
                    />
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="flex flex-row justify-between sm:justify-between border-t border-border px-6 py-4 bg-muted/20">
              {step === 1 ? (
                <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                  Cancel
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={isSubmitting}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {step < 2 ? (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                ) : isSubmitting ? (
                  "Creating..."
                ) : (
                  "Create Office"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // ——— Edit mode: 2-step form (Office Admin Details → Office Details), admin prefilled when available ———
  const editProgressValue = (editStep / 2) * 100;
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] w-[95vw] p-0 gap-0 overflow-hidden">
        <div className="bg-primary text-primary-foreground px-6 pt-10 pb-3 rounded-t-lg sm:rounded-t-lg">
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => setEditStep(1)}
              className={`p-2 rounded-lg transition-colors cursor-pointer hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 ${editStep === 1 ? "bg-white/20 text-white" : "bg-white/10 text-white/70"}`}
              aria-label="Go to Office Admin"
            >
              <User className="h-4 w-4" />
            </button>
            <div className="h-px flex-1 bg-white/30" />
            <button
              type="button"
              onClick={() => setEditStep(2)}
              className={`p-2 rounded-lg transition-colors cursor-pointer hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 ${editStep === 2 ? "bg-white/20 text-white" : "bg-white/10 text-white/70"}`}
              aria-label="Go to Office Details"
            >
              <Building2 className="h-4 w-4" />
            </button>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden mb-1">
            <Progress value={editProgressValue} className="h-1.5 rounded-full bg-transparent [&>div]:h-full [&>div]:rounded-full [&>div]:bg-white/90" />
          </div>
          <DialogTitle className="text-lg font-semibold text-white mt-2">
            {editStep === 1 ? "Office Admin Details" : "Office Details"}
          </DialogTitle>
          <DialogDescription className="text-xs text-white/70 mt-0.5">
            {editStep === 1
              ? "Office admin is linked to this office."
              : "Update office name and address details."}
          </DialogDescription>
        </div>

        <div
          onKeyDown={(e) => {
            if (e.key === "Enter" && editStep === 1) e.preventDefault();
          }}
        >
          <div className="grid gap-4 px-6 py-5 max-h-[55vh] overflow-y-auto">
            {editStep === 1 && (
              <div className="grid gap-4">
                {editAdminEmployee === "loading" && (
                  <p className="text-sm text-muted-foreground">Loading office admin details…</p>
                )}
                {editAdminEmployee === null && (
                  <p className="text-sm text-muted-foreground">No office admin assigned to this office. To assign one, use User management.</p>
                )}
                {editAdminEmployee && editAdminEmployee !== "loading" && (
                  <>
                    {isSuperAdmin ? (
                      <div className="grid gap-3 rounded-lg border border-border p-4">
                        <p className="text-xs text-muted-foreground mb-1">Edit office admin details (saved when you click Save Changes on Step 2).</p>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-admin-name">Full Name</Label>
                          <Input
                            id="edit-admin-name"
                            placeholder="e.g. John Doe"
                            value={editAdminFormData.adminName}
                            onChange={(e) => setEditAdminFormData({ ...editAdminFormData, adminName: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-admin-email">Email</Label>
                          <Input
                            id="edit-admin-email"
                            type="email"
                            placeholder="e.g. admin@office.com"
                            value={editAdminFormData.adminEmail}
                            onChange={(e) => setEditAdminFormData({ ...editAdminFormData, adminEmail: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="grid gap-2">
                            <Label htmlFor="edit-admin-phone">Phone</Label>
                            <Input
                              id="edit-admin-phone"
                              type="tel"
                              placeholder="e.g. +91 98765 43210"
                              value={editAdminFormData.adminPhone}
                              onChange={(e) => setEditAdminFormData({ ...editAdminFormData, adminPhone: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-admin-emp-code">Emp Code</Label>
                            <Input
                              id="edit-admin-emp-code"
                              placeholder="e.g. OA001"
                              value={editAdminFormData.adminEmpCode}
                              onChange={(e) => setEditAdminFormData({ ...editAdminFormData, adminEmpCode: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="grid gap-2">
                            <Label htmlFor="edit-admin-gender">Gender</Label>
                            <Input
                              id="edit-admin-gender"
                              placeholder="e.g. M / F"
                              value={editAdminFormData.adminGender}
                              onChange={(e) => setEditAdminFormData({ ...editAdminFormData, adminGender: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-admin-dob">DOB (YYYY-MM-DD)</Label>
                            <Input
                              id="edit-admin-dob"
                              placeholder="e.g. 1990-01-15"
                              value={editAdminFormData.adminDob}
                              onChange={(e) => setEditAdminFormData({ ...editAdminFormData, adminDob: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="grid gap-2">
                            <Label htmlFor="edit-admin-govt-type">Govt ID Type</Label>
                            <Select
                              value={editAdminFormData.adminGovtIdType || "__none__"}
                              onValueChange={(v) => setEditAdminFormData({ ...editAdminFormData, adminGovtIdType: v === "__none__" ? "" : v })}
                            >
                              <SelectTrigger id="edit-admin-govt-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {GOVERNMENT_ID_TYPES.map((opt) => (
                                  <SelectItem key={opt.value || "__none__"} value={opt.value || "__none__"}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-admin-govt-value">Govt ID Value</Label>
                            <Input
                              id="edit-admin-govt-value"
                              placeholder="ID number"
                              value={editAdminFormData.adminGovtIdValue}
                              onChange={(e) => setEditAdminFormData({ ...editAdminFormData, adminGovtIdValue: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-3 rounded-lg border border-border p-4">
                        <p className="text-xs text-muted-foreground mb-1">Office admin (read-only). To change, use User management.</p>
                        <div className="grid gap-2">
                          <Label className="text-muted-foreground">Full Name</Label>
                          <p className="text-sm">{editAdminEmployee.name || "—"}</p>
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-muted-foreground">Email</Label>
                          <p className="text-sm">{editAdminEmployee.email || "—"}</p>
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-muted-foreground">Phone</Label>
                          <p className="text-sm">{editAdminEmployee.phone_number || "—"}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="grid gap-2">
                            <Label className="text-muted-foreground">Gender</Label>
                            <p className="text-sm">{editAdminEmployee.gender || "—"}</p>
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-muted-foreground">DOB</Label>
                            <p className="text-sm">{editAdminEmployee.date_of_birth ? format(new Date(editAdminEmployee.date_of_birth), "PP") : "—"}</p>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-muted-foreground">Designation</Label>
                          <p className="text-sm">{editAdminEmployee.designation || "—"}</p>
                        </div>
                        {(editAdminEmployee.government_id_type || editAdminEmployee.government_id_value) && (
                          <div className="grid gap-2">
                            <Label className="text-muted-foreground">Govt ID</Label>
                            <p className="text-sm">
                              {[editAdminEmployee.government_id_type, editAdminEmployee.government_id_value].filter(Boolean).join(": ") || "—"}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {editStep === 2 && (
              <>
                <div className="grid gap-2">
                  <Label>Organization</Label>
                  <p className="text-sm text-muted-foreground py-2">{office?.organizationName ?? "—"}</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="office-name">Office Name</Label>
                  <Input
                    id="office-name"
                    placeholder="e.g. Headquarters, Branch Office"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="office-location">Location</Label>
                  <Input
                    id="office-location"
                    placeholder="e.g. Mumbai, Andheri East"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="office-full-address">Full Address</Label>
                  <Input
                    id="office-full-address"
                    placeholder="e.g. 123 Main St, Building A"
                    value={formData.fullAddress}
                    onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="office-devices">Number of Biometric Devices</Label>
                  <Input
                    id="office-devices"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={formData.numBiometricDevices === 0 ? "" : formData.numBiometricDevices}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numBiometricDevices: Math.max(0, parseInt(e.target.value, 10) || 0),
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <Label htmlFor="office-active">Active</Label>
                    <p className="text-sm text-muted-foreground">Inactive offices are hidden from normal use.</p>
                  </div>
                  <Switch
                    id="office-active"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter className="border-t border-border px-6 py-4 bg-muted/20 flex flex-row justify-between sm:justify-between">
            {editStep === 2 ? (
              <Button type="button" variant="outline" onClick={() => setEditStep(1)} disabled={isSubmitting}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
            )}
            {editStep === 1 ? (
              <Button type="button" onClick={() => setEditStep(2)}>
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={(e) => {
                  e.preventDefault();
                  handleEditSubmit(e as unknown as React.FormEvent);
                }}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
