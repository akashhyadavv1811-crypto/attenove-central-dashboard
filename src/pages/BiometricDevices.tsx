import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/dashboard/Header";
import {
  Search,
  Plus,
  Cpu,
  Pencil,
  Trash2,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Filter,
  Download,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import {
  fetchBiometricDevices,
  fetchOffices,
  deleteBiometricDevice,
  type ApiBiometricDevice,
  type ApiOffice,
} from "@/lib/api";
import { toast } from "sonner";
import { useTableSort, useStatusFilter } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { AddBiometricDeviceModal } from "@/components/modals/AddBiometricDeviceModal";
import { EditBiometricDeviceModal, type BiometricDeviceForEdit } from "@/components/modals/EditBiometricDeviceModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";

interface BiometricDevice {
  id: number;
  officeId: number;
  officeName: string;
  deviceId: string;
  name: string;
  isActive: boolean;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
}

function apiToDevice(api: ApiBiometricDevice): BiometricDevice {
  return {
    id: api.id,
    officeId: api.office_id,
    officeName: api.office_name ?? `Office ${api.office_id}`,
    deviceId: api.device_id,
    name: api.name ?? "",
    isActive: api.is_active,
    status: api.is_active ? "Active" : "Inactive",
    createdAt: api.created_at ?? null,
    updatedAt: api.updated_at ?? null,
  };
}

function deviceToEdit(d: BiometricDevice): BiometricDeviceForEdit {
  return {
    id: d.id,
    officeId: d.officeId,
    officeName: d.officeName,
    deviceId: d.deviceId,
    name: d.name,
    isActive: d.isActive,
    status: d.status,
  };
}

type SortField = "deviceId" | "officeName" | "name" | "status" | "createdAt";

const BiometricDevices = () => {
  const { user } = useAuth();
  const canCreate = user?.is_superadmin === true || user?.role === "ORG_ADMIN";

  const [devices, setDevices] = useState<BiometricDevice[]>([]);
  const [offices, setOffices] = useState<ApiOffice[]>([]);
  const [loading, setLoading] = useState(true);
  const [officeFilterId, setOfficeFilterId] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<BiometricDevice | null>(null);
  const { sortField, sortDirection, handleSort, getSortDirection } = useTableSort<SortField>();
  const { statusFilters, setStatusFilters, toggleStatusFilter } = useStatusFilter([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const loadOffices = useCallback(async () => {
    try {
      const list = await fetchOffices();
      setOffices(list);
    } catch {
      setOffices([]);
    }
  }, []);

  const loadDevices = useCallback(async () => {
    setLoading(true);
    try {
      const officeId = officeFilterId === "all" ? undefined : officeFilterId;
      const list = await fetchBiometricDevices(officeId);
      setDevices(list.map(apiToDevice));
    } catch {
      setDevices([]);
      toast.error("Failed to load biometric devices.");
    } finally {
      setLoading(false);
    }
  }, [officeFilterId]);

  useEffect(() => {
    loadOffices();
  }, [loadOffices]);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const allStatuses = Array.from(new Set(devices.map((d) => d.status)));

  const getSortIcon = (field: SortField) => {
    const dir = getSortDirection(field);
    if (dir === null) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    if (dir === "asc") return <ChevronUp className="w-4 h-4 ml-1" />;
    return <ChevronDown className="w-4 h-4 ml-1" />;
  };

  const handleEdit = (device: BiometricDevice) => {
    setSelectedDevice(device);
    setIsEditModalOpen(true);
  };

  const handleDelete = (device: BiometricDevice) => {
    setSelectedDevice(device);
    setIsDeleteModalOpen(true);
  };

  const handleAddSuccess = (created: ApiBiometricDevice) => {
    setDevices((prev) => [...prev, apiToDevice(created)]);
    toast.success("Device added.");
  };

  const handleEditSuccess = (updated: ApiBiometricDevice) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === updated.id ? apiToDevice(updated) : d))
    );
    toast.success("Device updated.");
  };

  const handleConfirmDelete = async () => {
    if (!selectedDevice) return;
    try {
      await deleteBiometricDevice(selectedDevice.id);
      setDevices((prev) => prev.filter((d) => d.id !== selectedDevice.id));
      toast.success("Device deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete.");
    }
    setIsDeleteModalOpen(false);
    setSelectedDevice(null);
  };

  const clearFilters = () => setStatusFilters([]);
  const hasActiveFilters = statusFilters.length > 0;

  const filteredAndSortedData = devices
    .filter((d) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          d.deviceId.toLowerCase().includes(q) ||
          d.officeName.toLowerCase().includes(q) ||
          (d.name && d.name.toLowerCase().includes(q)) ||
          d.status.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (statusFilters.length > 0 && !statusFilters.includes(d.status)) return false;
      return true;
    })
    .sort((a, b) => {
      if (!sortField || !sortDirection) return 0;
      const aVal = a[sortField];
      const bVal = b[sortField];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDirection === "asc" ? cmp : -cmp;
    });

  const officeOptions = offices.map((o) => ({ id: o.id, name: o.name }));

  const exportToCSV = () => {
    const headers = ["ID", "Device ID", "Office", "Name", "Status", "Created", "Updated"];
    const rows = filteredAndSortedData.map((d) =>
      [
        d.id,
        d.deviceId,
        `"${d.officeName}"`,
        `"${d.name}"`,
        d.status,
        d.createdAt ?? "",
        d.updatedAt ?? "",
      ].join(",")
    );
    const blob = new Blob([headers.join(",") + "\n" + rows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BiometricDevices_${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="px-4 py-4 md:px-6 md:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Biometric Devices</h1>
            <p className="text-sm text-muted-foreground">
              Manage biometric devices linked to offices for attendance sync
            </p>
          </div>
          {canCreate && (
            <Button
              className="bg-primary text-primary-foreground"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Device
            </Button>
          )}
        </div>

        <div className="widget-card mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 flex-1 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4 flex-1">
                <div className="relative w-full sm:w-[260px] lg:w-[320px] min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search devices..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select
                  value={officeFilterId === "all" ? "all" : String(officeFilterId)}
                  onValueChange={(v) =>
                    setOfficeFilterId(v === "all" ? "all" : (Number(v) as number))
                  }
                >
                  <SelectTrigger className="w-full md:w-[220px]">
                    <SelectValue placeholder="All offices" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All offices</SelectItem>
                    {offices.map((o) => (
                      <SelectItem key={o.id} value={String(o.id)}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 mt-2 md:mt-0">
                <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={hasActiveFilters ? "border-primary text-primary" : ""}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                      {hasActiveFilters && (
                        <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5">
                          {statusFilters.length}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48" align="start">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Status</h4>
                        {hasActiveFilters && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                          >
                            Clear all
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                          Status
                        </Label>
                        {allStatuses.map((status) => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox
                              id={`device-status-${status}`}
                              checked={statusFilters.includes(status)}
                              onCheckedChange={() => toggleStatusFilter(status)}
                            />
                            <label
                              htmlFor={`device-status-${status}`}
                              className="text-sm cursor-pointer"
                            >
                              {status}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {statusFilters.map((status) => (
                <span
                  key={status}
                  className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                >
                  {status}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => toggleStatusFilter(status)}
                  />
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="widget-card">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary dark:bg-card dark:hover:bg-card">
                  <TableHead
                    className="text-primary-foreground cursor-pointer select-none"
                    onClick={() => handleSort("deviceId")}
                  >
                    <div className="flex items-center">Device ID {getSortIcon("deviceId")}</div>
                  </TableHead>
                  <TableHead
                    className="text-primary-foreground cursor-pointer select-none"
                    onClick={() => handleSort("officeName")}
                  >
                    <div className="flex items-center">Office {getSortIcon("officeName")}</div>
                  </TableHead>
                  <TableHead
                    className="text-primary-foreground cursor-pointer select-none"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">Name {getSortIcon("name")}</div>
                  </TableHead>
                  <TableHead
                    className="text-primary-foreground cursor-pointer select-none"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">Status {getSortIcon("status")}</div>
                  </TableHead>
                  <TableHead
                    className="text-primary-foreground cursor-pointer select-none"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center">Created {getSortIcon("createdAt")}</div>
                  </TableHead>
                  <TableHead className="text-primary-foreground w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No devices found. Add one or adjust filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedData.map((device) => (
                    <TableRow key={device.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Cpu className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium text-foreground font-mono">
                            {device.deviceId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{device.officeName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {device.name || "—"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            device.status === "Active" ? "badge-success" : "badge-danger"
                          }`}
                        >
                          {device.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {device.createdAt
                          ? format(new Date(device.createdAt), "MMM d, yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => handleEdit(device)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(device)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <AddBiometricDeviceModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        offices={officeOptions}
        onSuccess={handleAddSuccess}
      />
      <EditBiometricDeviceModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        device={selectedDevice ? deviceToEdit(selectedDevice) : null}
        onSuccess={handleEditSuccess}
      />
      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete Biometric Device"
        description={`Remove device "${selectedDevice?.deviceId}" (${selectedDevice?.officeName})? This cannot be undone.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default BiometricDevices;
