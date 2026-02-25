import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ArrowRight, Building2, User } from "lucide-react";
import { createOrganization, updateOrganization } from "@/lib/api";
import { GOVERNMENT_ID_TYPES } from "@/constants/employee";
import type { CreateOrganizationResponse } from "@/lib/api";
import { toast } from "sonner";

export interface OrganizationOwner {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  designation?: string;
}

export interface Organization {
  id: number;
  name: string;
  location: string;
  employees: number;
  devices: number;
  status: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  phone_number?: string;
  email?: string;
  owner?: OrganizationOwner;
}

export type CreatedOrgFormData = {
  orgName: string;
  orgAddress: string;
  orgCity: string;
  orgState: string;
  orgCountry: string;
  orgPincode: string;
  orgPhone: string;
  orgEmail: string;
};

type Mode = "add" | "edit";

interface OrganizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  /** Required when mode is "edit" */
  organization?: Organization | null;
  onAddSuccess?: (response: CreateOrganizationResponse, orgFormData: CreatedOrgFormData) => void;
  onEditSave?: (organization: Organization) => void;
}

const emptyAddForm = {
  ownerName: "",
  ownerEmail: "",
  ownerPassword: "",
  ownerPhone: "",
  ownerGender: "",
  ownerGovtIdType: "",
  ownerGovtIdValue: "",
  orgName: "",
  orgAddress: "",
  orgCity: "",
  orgState: "",
  orgCountry: "",
  orgPincode: "",
  orgPhone: "",
  orgEmail: "",
};

const emptyEditForm = {
  ...emptyAddForm,
  isActive: true,
};

export function OrganizationModal({
  open,
  onOpenChange,
  mode,
  organization = null,
  onAddSuccess,
  onEditSave,
}: OrganizationModalProps) {
  const isAdd = mode === "add";

  // Add flow state
  const [step, setStep] = useState(1);
  const [addFormData, setAddFormData] = useState(emptyAddForm);

  // Edit flow state
  const [editStep, setEditStep] = useState(1);
  const [editFormData, setEditFormData] = useState(emptyEditForm);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && organization) {
      setEditStep(1);
      setEditFormData({
        ...emptyAddForm,
        isActive: organization.status === "Active",
        ownerName: organization.owner?.name ?? "",
        ownerEmail: organization.owner?.email ?? "",
        ownerPassword: "",
        ownerPhone: organization.owner?.phone_number ?? "",
        ownerGender: "",
        ownerGovtIdType: "",
        ownerGovtIdValue: "",
        orgName: organization.name,
        orgAddress: organization.address ?? "",
        orgCity: organization.city ?? "",
        orgState: organization.state ?? "",
        orgCountry: organization.country ?? "",
        orgPincode: organization.pincode ?? "",
        orgPhone: organization.phone_number ?? "",
        orgEmail: organization.email ?? "",
      });
    }
  }, [open, organization]);

  const resetAddForm = () => {
    setStep(1);
    setAddFormData(emptyAddForm);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      if (isAdd) resetAddForm();
      else {
        setEditStep(1);
        if (organization) {
          setEditFormData({
            ...emptyAddForm,
            isActive: organization.status === "Active",
            ownerName: organization.owner?.name ?? "",
            ownerEmail: organization.owner?.email ?? "",
            ownerPassword: "",
            ownerPhone: organization.owner?.phone_number ?? "",
            ownerGender: "",
            ownerGovtIdType: "",
            ownerGovtIdValue: "",
            orgName: organization.name,
            orgAddress: organization.address ?? "",
            orgCity: organization.city ?? "",
            orgState: organization.state ?? "",
            orgCountry: organization.country ?? "",
            orgPincode: organization.pincode ?? "",
            orgPhone: organization.phone_number ?? "",
            orgEmail: organization.email ?? "",
          });
        }
      }
    }
    onOpenChange(isOpen);
  };

  const isOwnerDetailsValid = () => {
    const name = addFormData.ownerName.trim();
    const email = addFormData.ownerEmail.trim();
    const password = addFormData.ownerPassword;
    return name.length > 0 && email.length > 0 && password.length >= 8;
  };

  const goToStep = (newStep: number) => {
    if (newStep === 2 && !isOwnerDetailsValid()) {
      toast.error("Please fill in Owner Name, Email Address, and Password (min 8 characters) before continuing.");
      return;
    }
    setStep(newStep);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      if (!isOwnerDetailsValid()) {
        toast.error("Please fill in Owner Name, Email Address, and Password (min 8 characters) before continuing.");
        return;
      }
      setStep(2);
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await createOrganization({
        owner: {
          email: addFormData.ownerEmail.trim(),
          password: addFormData.ownerPassword,
          name: addFormData.ownerName.trim() || undefined,
          phone_number: addFormData.ownerPhone.trim() || undefined,
          designation: "ORG_ADMIN",
          gender: addFormData.ownerGender.trim() || undefined,
          government_id_type: addFormData.ownerGovtIdType.trim() || undefined,
          government_id_value: addFormData.ownerGovtIdValue.trim() || undefined,
        },
        organization: {
          name: addFormData.orgName.trim(),
          address: addFormData.orgAddress.trim() || undefined,
          city: addFormData.orgCity.trim() || undefined,
          state: addFormData.orgState.trim() || undefined,
          country: addFormData.orgCountry.trim() || undefined,
          pincode: addFormData.orgPincode.trim() || undefined,
          phone_number: addFormData.orgPhone.trim() || undefined,
          email: addFormData.orgEmail.trim() || undefined,
        },
      });
      toast.success("Organization created successfully.");
      onAddSuccess?.(response, {
        orgName: addFormData.orgName,
        orgAddress: addFormData.orgAddress,
        orgCity: addFormData.orgCity,
        orgState: addFormData.orgState,
        orgCountry: addFormData.orgCountry,
        orgPincode: addFormData.orgPincode,
        orgPhone: addFormData.orgPhone,
        orgEmail: addFormData.orgEmail,
      });
      handleClose(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create organization.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;
    // Step 1: only advance to step 2; do not save
    if (editStep !== 2) {
      setEditStep(2);
      return;
    }
    setIsSubmitting(true);
    try {
      await updateOrganization(organization.id, {
        name: editFormData.orgName.trim(),
        is_active: editFormData.isActive,
        address: editFormData.orgAddress.trim() || undefined,
        city: editFormData.orgCity.trim() || undefined,
        state: editFormData.orgState.trim() || undefined,
        country: editFormData.orgCountry.trim() || undefined,
        pincode: editFormData.orgPincode.trim() || undefined,
        phone_number: editFormData.orgPhone.trim() || undefined,
        email: editFormData.orgEmail.trim() || undefined,
      });
      onEditSave?.({
        ...organization,
        name: editFormData.orgName.trim(),
        status: editFormData.isActive ? "Active" : "Inactive",
        address: editFormData.orgAddress.trim() || undefined,
        city: editFormData.orgCity.trim() || undefined,
        state: editFormData.orgState.trim() || undefined,
        country: editFormData.orgCountry.trim() || undefined,
        pincode: editFormData.orgPincode.trim() || undefined,
        phone_number: editFormData.orgPhone.trim() || undefined,
        email: editFormData.orgEmail.trim() || undefined,
        location: editFormData.orgCity
          ? [editFormData.orgCity, editFormData.orgState, editFormData.orgCountry].filter(Boolean).join(", ")
          : organization.location,
      });
      toast.success("Organization updated.");
      handleClose(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAdd) {
    const progressValue = (step / 2) * 100;
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[680px] w-[95vw] p-0 gap-0 overflow-hidden">
          <div className="bg-primary text-primary-foreground px-6 pt-10 pb-3 rounded-t-lg sm:rounded-t-lg">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`p-2 rounded-lg transition-colors cursor-pointer hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 ${step === 1 ? "bg-white/20 text-white" : "bg-white/10 text-white/70"}`}
                aria-label="Go to Owner Profile"
              >
                <User className="h-4 w-4" />
              </button>
              <div className="h-px flex-1 bg-white/30" />
              <button
                type="button"
                onClick={() => goToStep(2)}
                className={`p-2 rounded-lg transition-colors cursor-pointer hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 ${step === 2 ? "bg-white/20 text-white" : "bg-white/10 text-white/70"}`}
                aria-label="Go to Organization Details"
              >
                <Building2 className="h-4 w-4" />
              </button>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden mb-1">
              <Progress
                value={progressValue}
                className="h-1.5 rounded-full bg-transparent [&>div]:h-full [&>div]:rounded-full [&>div]:bg-gradient-to-r [&>div]:from-white [&>div]:to-white/90 [&>div]:shadow-[0_0_14px_rgba(255,255,255,0.35)] [&>div]:transition-all [&>div]:duration-500"
              />
            </div>
            <h2 className="text-lg font-semibold text-white mt-2">
              {step === 1 ? "Owner Profile" : "Organization Details"}
            </h2>
            <p className="text-xs text-white/70 mt-0.5">
              {step === 1
                ? "Enter the details of the organization owner or primary contact."
                : "Enter your organization name and contact details."}
            </p>
          </div>

          <form onSubmit={handleAddSubmit}>
            <div className="grid gap-4 px-6 py-5 max-h-[50vh] overflow-y-auto">
              {step === 1 && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="owner-name">Owner Name</Label>
                    <Input
                      id="owner-name"
                      placeholder="e.g. John Doe"
                      value={addFormData.ownerName}
                      onChange={(e) => setAddFormData({ ...addFormData, ownerName: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="owner-email">Email Address</Label>
                    <Input
                      id="owner-email"
                      type="email"
                      placeholder="e.g. john@company.com"
                      value={addFormData.ownerEmail}
                      onChange={(e) => setAddFormData({ ...addFormData, ownerEmail: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="owner-password">Password</Label>
                    <Input
                      id="owner-password"
                      type="password"
                      placeholder="Set a password for the owner account"
                      value={addFormData.ownerPassword}
                      onChange={(e) => setAddFormData({ ...addFormData, ownerPassword: e.target.value })}
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="owner-phone">Phone Number</Label>
                      <Input
                        id="owner-phone"
                        type="tel"
                        placeholder="e.g. +91 98765 43210"
                        value={addFormData.ownerPhone}
                        onChange={(e) => setAddFormData({ ...addFormData, ownerPhone: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="owner-gender">Gender</Label>
                      <Select
                        value={addFormData.ownerGender || "none"}
                        onValueChange={(v) => setAddFormData({ ...addFormData, ownerGender: v === "none" ? "" : v })}
                      >
                        <SelectTrigger id="owner-gender">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="owner-govt-id-type">Government ID Type</Label>
                      <Select
                        value={addFormData.ownerGovtIdType || "__none__"}
                        onValueChange={(v) => setAddFormData({ ...addFormData, ownerGovtIdType: v === "__none__" ? "" : v })}
                      >
                        <SelectTrigger id="owner-govt-id-type">
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
                      <Label htmlFor="owner-govt-id-value">Government ID Value</Label>
                      <Input
                        id="owner-govt-id-value"
                        placeholder="ID number"
                        value={addFormData.ownerGovtIdValue}
                        onChange={(e) => setAddFormData({ ...addFormData, ownerGovtIdValue: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input
                      id="org-name"
                      placeholder="e.g. Headquarters, Tech Park Office"
                      value={addFormData.orgName}
                      onChange={(e) => setAddFormData({ ...addFormData, orgName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="org-address">Address</Label>
                    <Input
                      id="org-address"
                      placeholder="e.g. 123 Main Street"
                      value={addFormData.orgAddress}
                      onChange={(e) => setAddFormData({ ...addFormData, orgAddress: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="org-city">City</Label>
                      <Input
                        id="org-city"
                        placeholder="e.g. Mumbai"
                        value={addFormData.orgCity}
                        onChange={(e) => setAddFormData({ ...addFormData, orgCity: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="org-state">State</Label>
                      <Input
                        id="org-state"
                        placeholder="e.g. Maharashtra"
                        value={addFormData.orgState}
                        onChange={(e) => setAddFormData({ ...addFormData, orgState: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="org-country">Country</Label>
                    <Input
                      id="org-country"
                      placeholder="e.g. India"
                      value={addFormData.orgCountry}
                      onChange={(e) => setAddFormData({ ...addFormData, orgCountry: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="org-pincode">Pincode</Label>
                    <Input
                      id="org-pincode"
                      placeholder="e.g. 400001"
                      value={addFormData.orgPincode}
                      onChange={(e) => setAddFormData({ ...addFormData, orgPincode: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="org-phone">Phone Number</Label>
                      <Input
                        id="org-phone"
                        type="tel"
                        placeholder="e.g. +91 22 1234 5678"
                        value={addFormData.orgPhone}
                        onChange={(e) => setAddFormData({ ...addFormData, orgPhone: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="org-email">Email</Label>
                      <Input
                        id="org-email"
                        type="email"
                        placeholder="e.g. contact@company.com"
                        value={addFormData.orgEmail}
                        onChange={(e) => setAddFormData({ ...addFormData, orgEmail: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
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
                  "Add Organization"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // Edit mode — same 2-step form as Add (Owner Profile → Organization Details), prefilled
  const editProgressValue = (editStep / 2) * 100;
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[680px] w-[95vw] p-0 gap-0 overflow-hidden">
        <div className="bg-primary text-primary-foreground px-6 pt-10 pb-3 rounded-t-lg sm:rounded-t-lg">
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => setEditStep(1)}
              className={`p-2 rounded-lg transition-colors cursor-pointer hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 ${editStep === 1 ? "bg-white/20 text-white" : "bg-white/10 text-white/70"}`}
              aria-label="Go to Owner Profile"
            >
              <User className="h-4 w-4" />
            </button>
            <div className="h-px flex-1 bg-white/30" />
            <button
              type="button"
              onClick={() => setEditStep(2)}
              className={`p-2 rounded-lg transition-colors cursor-pointer hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 ${editStep === 2 ? "bg-white/20 text-white" : "bg-white/10 text-white/70"}`}
              aria-label="Go to Organization Details"
            >
              <Building2 className="h-4 w-4" />
            </button>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden mb-1">
            <Progress
              value={editProgressValue}
              className="h-1.5 rounded-full bg-transparent [&>div]:h-full [&>div]:rounded-full [&>div]:bg-gradient-to-r [&>div]:from-white [&>div]:to-white/90 [&>div]:shadow-[0_0_14px_rgba(255,255,255,0.35)] [&>div]:transition-all [&>div]:duration-500"
            />
          </div>
          <h2 className="text-lg font-semibold text-white mt-2">
            {editStep === 1 ? "Owner Profile" : "Organization Details"}
          </h2>
          <p className="text-xs text-white/70 mt-0.5">
            {editStep === 1
              ? "Enter the details of the organization owner or primary contact."
              : "Enter your organization name and contact details."}
          </p>
        </div>

        <form
          onSubmit={handleEditSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && editStep === 1) e.preventDefault();
          }}
        >
          <div className="grid gap-4 px-6 py-5 max-h-[50vh] overflow-y-auto">
            {editStep === 1 && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="edit-owner-name">Owner Name</Label>
                  <Input
                    id="edit-owner-name"
                    placeholder="e.g. John Doe"
                    value={editFormData.ownerName}
                    onChange={(e) => setEditFormData({ ...editFormData, ownerName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-owner-email">Email Address</Label>
                  <Input
                    id="edit-owner-email"
                    type="email"
                    placeholder="e.g. john@company.com"
                    value={editFormData.ownerEmail}
                    onChange={(e) => setEditFormData({ ...editFormData, ownerEmail: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-owner-password">Password</Label>
                  <Input
                    id="edit-owner-password"
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={editFormData.ownerPassword}
                    onChange={(e) => setEditFormData({ ...editFormData, ownerPassword: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-owner-phone">Phone Number</Label>
                    <Input
                      id="edit-owner-phone"
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={editFormData.ownerPhone}
                      onChange={(e) => setEditFormData({ ...editFormData, ownerPhone: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-owner-gender">Gender</Label>
                    <Select
                      value={editFormData.ownerGender || "none"}
                      onValueChange={(v) => setEditFormData({ ...editFormData, ownerGender: v === "none" ? "" : v })}
                    >
                      <SelectTrigger id="edit-owner-gender">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-owner-govt-id-type">Government ID Type</Label>
                    <Select
                      value={editFormData.ownerGovtIdType || "__none__"}
                      onValueChange={(v) => setEditFormData({ ...editFormData, ownerGovtIdType: v === "__none__" ? "" : v })}
                    >
                      <SelectTrigger id="edit-owner-govt-id-type">
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
                    <Label htmlFor="edit-owner-govt-id-value">Government ID Value</Label>
                    <Input
                      id="edit-owner-govt-id-value"
                      placeholder="ID number"
                      value={editFormData.ownerGovtIdValue}
                      onChange={(e) => setEditFormData({ ...editFormData, ownerGovtIdValue: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}

            {editStep === 2 && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-org-name">Organization Name</Label>
                  <Input
                    id="edit-org-name"
                    placeholder="e.g. Headquarters, Tech Park Office"
                    value={editFormData.orgName}
                    onChange={(e) => setEditFormData({ ...editFormData, orgName: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-org-address">Address</Label>
                  <Input
                    id="edit-org-address"
                    placeholder="e.g. 123 Main Street"
                    value={editFormData.orgAddress}
                    onChange={(e) => setEditFormData({ ...editFormData, orgAddress: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-org-city">City</Label>
                    <Input
                      id="edit-org-city"
                      placeholder="e.g. Mumbai"
                      value={editFormData.orgCity}
                      onChange={(e) => setEditFormData({ ...editFormData, orgCity: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-org-state">State</Label>
                    <Input
                      id="edit-org-state"
                      placeholder="e.g. Maharashtra"
                      value={editFormData.orgState}
                      onChange={(e) => setEditFormData({ ...editFormData, orgState: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-org-country">Country</Label>
                  <Input
                    id="edit-org-country"
                    placeholder="e.g. India"
                    value={editFormData.orgCountry}
                    onChange={(e) => setEditFormData({ ...editFormData, orgCountry: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-org-pincode">Pincode</Label>
                  <Input
                    id="edit-org-pincode"
                    placeholder="e.g. 400001"
                    value={editFormData.orgPincode}
                    onChange={(e) => setEditFormData({ ...editFormData, orgPincode: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-org-phone">Phone Number</Label>
                    <Input
                      id="edit-org-phone"
                      type="tel"
                      placeholder="e.g. +91 22 1234 5678"
                      value={editFormData.orgPhone}
                      onChange={(e) => setEditFormData({ ...editFormData, orgPhone: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-org-email">Email</Label>
                    <Input
                      id="edit-org-email"
                      type="email"
                      placeholder="e.g. contact@company.com"
                      value={editFormData.orgEmail}
                      onChange={(e) => setEditFormData({ ...editFormData, orgEmail: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <Label htmlFor="edit-active">Active</Label>
                    <p className="text-sm text-muted-foreground">Inactive organizations are hidden from normal use.</p>
                  </div>
                  <Switch
                    id="edit-active"
                    checked={editFormData.isActive}
                    onCheckedChange={(checked) => setEditFormData({ ...editFormData, isActive: checked })}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-row justify-between sm:justify-between border-t border-border px-6 py-4 bg-muted/20">
            {editStep === 1 ? (
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => setEditStep(1)} disabled={isSubmitting}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            {editStep === 1 ? (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditStep(2);
                }}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
