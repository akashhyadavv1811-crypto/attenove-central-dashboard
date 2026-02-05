import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Building2, User } from "lucide-react";

interface AddOrganizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddOrganizationModal({ open, onOpenChange }: AddOrganizationModalProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  const [formData, setFormData] = useState({
    // Owner Profile
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerDesignation: "",
    // Organization Details
    name: "",
    location: "",
    address: "",
    devices: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < totalSteps) {
      setStep(step + 1);
      return;
    }
    // Final submission
    console.log("Organization data:", formData);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      ownerName: "",
      ownerEmail: "",
      ownerPhone: "",
      ownerDesignation: "",
      name: "",
      location: "",
      address: "",
      devices: "",
    });
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const progressValue = (step / totalSteps) * 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg ${step === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              <User className="h-4 w-4" />
            </div>
            <div className="h-px flex-1 bg-border" />
            <div className={`p-2 rounded-lg ${step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <Progress value={progressValue} className="h-1 mb-2" />
          <DialogTitle>
            {step === 1 ? "Owner Profile" : "Organization Details"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? "Enter the details of the organization owner or primary contact."
              : "Add a new office location or branch to your organization."
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {step === 1 && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="owner-name">Owner Name</Label>
                  <Input
                    id="owner-name"
                    placeholder="e.g. John Doe"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="owner-email">Email Address</Label>
                  <Input
                    id="owner-email"
                    type="email"
                    placeholder="e.g. john@company.com"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="owner-phone">Phone Number</Label>
                  <Input
                    id="owner-phone"
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={formData.ownerPhone}
                    onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="owner-designation">Designation</Label>
                  <Input
                    id="owner-designation"
                    placeholder="e.g. CEO, Director, Manager"
                    value={formData.ownerDesignation}
                    onChange={(e) => setFormData({ ...formData, ownerDesignation: e.target.value })}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    placeholder="e.g. Headquarters, Tech Park Office"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">City/Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Mumbai, India"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter complete address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="devices">Number of Biometric Devices</Label>
                  <Input
                    id="devices"
                    type="number"
                    placeholder="e.g. 2"
                    min="1"
                    value={formData.devices}
                    onChange={(e) => setFormData({ ...formData, devices: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter className="flex flex-row justify-between sm:justify-between">
            {step === 1 ? (
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={goBack}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <Button type="submit">
              {step < totalSteps ? (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
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
