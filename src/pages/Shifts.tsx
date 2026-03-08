import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
import { Search, Plus, Clock, Pencil, Trash2, ArrowUpDown, ChevronUp, ChevronDown, Filter, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { CreateShiftModal } from "@/components/modals/CreateShiftModal";
import { EditShiftModal, type ShiftForEdit } from "@/components/modals/EditShiftModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { format } from "date-fns";
import {
  fetchShifts,
  fetchOffices,
  createShift,
  updateShift,
  deleteShift,
  type ApiShift,
  type ApiOffice,
} from "@/lib/api";
import { useTableSort, useStatusFilter } from "@/hooks";

interface Shift {
  id: number;
  officeId: number;
  officeName: string;
  name: string;
  startTime: string;
  endTime: string;
  startTimeRaw: string;
  endTimeRaw: string;
  graceMinutes: number;
  isNightShift: boolean;
  status: string;
}

function formatTimeDisplay(hhmm: string | null | undefined): string {
  if (!hhmm) return "—";
  const [hStr, mStr] = hhmm.split(":");
  const h = parseInt(hStr ?? "0", 10);
  const m = (mStr ?? "00").slice(0, 2);
  if (h >= 12) {
    const displayH = h === 12 ? 12 : h - 12;
    return `${displayH.toString().padStart(2, "0")}:${m} PM`;
  }
  const displayH = h === 0 ? 12 : h;
  return `${displayH.toString().padStart(2, "0")}:${m} AM`;
}

function apiToShift(api: ApiShift, offices: ApiOffice[]): Shift {
  const office = offices.find((o) => o.id === api.office_id);
  const startRaw = api.start_time ?? "";
  const endRaw = api.end_time ?? "";
  return {
    id: api.id,
    officeId: api.office_id,
    officeName: office?.name ?? `Office ${api.office_id}`,
    name: api.name,
    startTime: formatTimeDisplay(api.start_time),
    endTime: formatTimeDisplay(api.end_time),
    startTimeRaw: startRaw.length >= 5 ? startRaw.slice(0, 5) : startRaw,
    endTimeRaw: endRaw.length >= 5 ? endRaw.slice(0, 5) : endRaw,
    graceMinutes: api.grace_minutes,
    isNightShift: api.is_night_shift,
    status: api.is_active ? "Active" : "Inactive",
  };
}

function shiftToEdit(shift: Shift): ShiftForEdit {
  return {
    id: shift.id,
    officeId: shift.officeId,
    officeName: shift.officeName,
    name: shift.name,
    startTime: shift.startTimeRaw,
    endTime: shift.endTimeRaw,
    graceMinutes: shift.graceMinutes,
    isNightShift: shift.isNightShift,
    isActive: shift.status === "Active",
    status: shift.status,
  };
}

type SortField = "name" | "officeName" | "startTime" | "endTime" | "graceMinutes" | "status";
type SortDirection = "asc" | "desc" | null;

const Shifts = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [offices, setOffices] = useState<ApiOffice[]>([]);
  const [loading, setLoading] = useState(true);
  const [officeFilterId, setOfficeFilterId] = useState<number | "">("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { sortField, sortDirection, handleSort, getSortDirection } = useTableSort<SortField>();
  const { statusFilters, setStatusFilters, toggleStatusFilter } = useStatusFilter([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const loadOffices = useCallback(async () => {
    const list = await fetchOffices();
    setOffices(list);
    return list;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const officeList = await loadOffices();
      const officeId = officeFilterId === "" ? undefined : (officeFilterId as number);
      const list = await fetchShifts(officeId);
      if (!cancelled) {
        setShifts(list.map((s) => apiToShift(s, officeList)));
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [officeFilterId, loadOffices]);

  const allStatuses = Array.from(new Set(shifts.map((s) => s.status)));

  const getSortIcon = (field: SortField) => {
    const dir = getSortDirection(field);
    if (dir === null) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    if (dir === "asc") return <ChevronUp className="w-4 h-4 ml-1" />;
    return <ChevronDown className="w-4 h-4 ml-1" />;
  };

  const handleEdit = (shift: Shift) => {
    setSelectedShift(shift);
    setIsEditModalOpen(true);
  };

  const handleDelete = (shift: Shift) => {
    setSelectedShift(shift);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSuccess = (created: ApiShift) => {
    const officeList = offices.length ? offices : [];
    setShifts((prev) => [...prev, apiToShift(created, officeList)]);
  };

  const handleSaveEdit = (updated: ApiShift) => {
    const officeList = offices.length ? offices : [];
    setShifts((prev) =>
      prev.map((s) => (s.id === updated.id ? apiToShift(updated, officeList) : s))
    );
  };

  const handleConfirmDelete = async () => {
    if (!selectedShift) return;
    try {
      await deleteShift(selectedShift.id);
      setShifts((prev) => prev.filter((s) => s.id !== selectedShift.id));
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedShift(null);
    }
  };

  const clearFilters = () => setStatusFilters([]);
  const hasActiveFilters = statusFilters.length > 0;

  const filteredAndSortedData = shifts
    .filter((shift) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !shift.name.toLowerCase().includes(q) &&
          !shift.startTime.toLowerCase().includes(q) &&
          !shift.endTime.toLowerCase().includes(q) &&
          !shift.status.toLowerCase().includes(q) &&
          !shift.officeName.toLowerCase().includes(q)
        )
          return false;
      }
      if (statusFilters.length > 0 && !statusFilters.includes(shift.status)) return false;
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
    const headers = ["ID", "Shift Name", "Office", "Start Time", "End Time", "Grace (min)", "Night", "Status"];
    const rows = filteredAndSortedData.map((s) =>
      [s.id, s.name, s.officeName, s.startTime, s.endTime, s.graceMinutes, s.isNightShift ? "Yes" : "No", s.status].join(",")
    );
    const blob = new Blob([headers.join(",") + "\n" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Shifts_${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Shifts</h1>
            <p className="text-sm text-muted-foreground">Configure shift timings and rules</p>
          </div>
          <Button className="bg-primary text-primary-foreground" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Shift
          </Button>
        </div>

        <div className="widget-card mb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Left: search + office select */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1 md:flex-none">
              <div className="relative w-full sm:w-[260px] lg:w-[320px] min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search shifts..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={officeFilterId === "" ? "all" : String(officeFilterId)}
                onValueChange={(v) => setOfficeFilterId(v === "all" ? "" : (Number(v) as number))}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
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

            {/* Right: Filter + Export */}
            <div className="flex items-center gap-3">
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={hasActiveFilters ? "border-primary text-primary" : ""}>
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
                      <h4 className="font-medium text-sm">Filters</h4>
                      {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground">
                          Clear all
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Status</Label>
                      {allStatuses.map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={`shift-status-${status}`}
                            checked={statusFilters.includes(status)}
                            onCheckedChange={() => toggleStatusFilter(status)}
                          />
                          <label htmlFor={`shift-status-${status}`} className="text-sm cursor-pointer">{status}</label>
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
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {statusFilters.map((status) => (
                <span
                  key={status}
                  className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                >
                  {status}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => toggleStatusFilter(status)} />
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
                  <TableHead className="text-primary-foreground cursor-pointer select-none" onClick={() => handleSort("name")}>
                    <div className="flex items-center">Shift Name {getSortIcon("name")}</div>
                  </TableHead>
                  <TableHead className="text-primary-foreground cursor-pointer select-none" onClick={() => handleSort("officeName")}>
                    <div className="flex items-center">Office {getSortIcon("officeName")}</div>
                  </TableHead>
                  <TableHead className="text-primary-foreground cursor-pointer select-none" onClick={() => handleSort("startTime")}>
                    <div className="flex items-center">Start {getSortIcon("startTime")}</div>
                  </TableHead>
                  <TableHead className="text-primary-foreground cursor-pointer select-none" onClick={() => handleSort("endTime")}>
                    <div className="flex items-center">End {getSortIcon("endTime")}</div>
                  </TableHead>
                  <TableHead className="text-primary-foreground cursor-pointer select-none" onClick={() => handleSort("graceMinutes")}>
                    <div className="flex items-center">Grace {getSortIcon("graceMinutes")}</div>
                  </TableHead>
                  <TableHead className="text-primary-foreground">Night</TableHead>
                  <TableHead className="text-primary-foreground cursor-pointer select-none" onClick={() => handleSort("status")}>
                    <div className="flex items-center">Status {getSortIcon("status")}</div>
                  </TableHead>
                  <TableHead className="text-primary-foreground w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No shifts found. Create one or adjust filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedData.map((shift) => (
                    <TableRow key={shift.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{shift.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{shift.officeName}</TableCell>
                      <TableCell className="text-muted-foreground">{shift.startTime}</TableCell>
                      <TableCell className="text-muted-foreground">{shift.endTime}</TableCell>
                      <TableCell className="text-muted-foreground">{shift.graceMinutes} min</TableCell>
                      <TableCell>{shift.isNightShift ? "Yes" : "—"}</TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            shift.status === "Active" ? "badge-success" : "badge-danger"
                          }`}
                        >
                          {shift.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => handleEdit(shift)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(shift)}
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

      <CreateShiftModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        offices={officeOptions}
        onSuccess={handleCreateSuccess}
      />
      <EditShiftModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        shift={selectedShift ? shiftToEdit(selectedShift) : null}
        onSave={handleSaveEdit}
      />
      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete Shift"
        description={`Are you sure you want to delete "${selectedShift?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
      />
      <Footer />
    </div>
  );
};

export default Shifts;
