import { useState, useEffect, useCallback, useMemo } from "react";
import { Header } from "@/components/dashboard/Header";
import { Download, Calendar, FileText, Search, ArrowUpDown, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchEsslLogs, type EsslLogEntry } from "@/lib/api";
import { toast } from "sonner";
import {
  USE_REPORTS_DEMO_DATA,
  getDemoAttendanceLogs,
  demoReportTableData,
  type DemoReportRow,
} from "@/data/reportsDemoData";

const reportTypes = [
  { value: "daily-attendance", label: "Daily Attendance Report" },
  { value: "monthly-summary", label: "Monthly Summary" },
  { value: "late-arrival", label: "Late Arrival Report" },
  { value: "leave-report", label: "Leave Report" },
  { value: "department-wise", label: "Department-wise Report" },
  { value: "overtime", label: "Overtime Report" },
];

type SortField = "empCode" | "name" | "date" | "checkIn" | "checkOut" | "status" | "hoursWorked";
type SortFieldDaily = "employee_code" | "employee_name" | "device_id" | "direction" | "log_date" | "check_in_time" | "check_out_time" | "hours_worked";
type SortDirection = "asc" | "desc" | null;

type EmployeeLogGroup = {
  employeeCode: string;
  employeeName: string;
  logs: EsslLogEntry[];
};

const Reports = () => {
  const [selectedReportType, setSelectedReportType] = useState<string>("daily-attendance");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const [dailyLogs, setDailyLogs] = useState<EsslLogEntry[]>([]);
  const [dailyLogsLoading, setDailyLogsLoading] = useState(false);
  const [dailyLogsError, setDailyLogsError] = useState<string | null>(null);
  const [sortFieldDaily, setSortFieldDaily] = useState<SortFieldDaily | null>(null);
  const [dailyPageSize, setDailyPageSize] = useState(20);
  const [dailyPage, setDailyPage] = useState(0);
  const [dailyGoToPageInput, setDailyGoToPageInput] = useState("");

  const loadDailyLogs = useCallback(async () => {
    setDailyLogsLoading(true);
    setDailyLogsError(null);
    try {
      const logs = await fetchEsslLogs();
      setDailyLogs(logs);
    } catch (e) {
      setDailyLogsError(e instanceof Error ? e.message : "Failed to load logs");
      setDailyLogs([]);
    } finally {
      setDailyLogsLoading(false);
    }
  }, []);

  const reportTableData: DemoReportRow[] = USE_REPORTS_DEMO_DATA ? demoReportTableData : [];

  useEffect(() => {
    if (selectedReportType !== "daily-attendance") return;
    if (USE_REPORTS_DEMO_DATA) {
      setDailyLogsLoading(false);
      setDailyLogsError(null);
      setDailyLogs(getDemoAttendanceLogs());
    } else {
      loadDailyLogs();
    }
  }, [selectedReportType, loadDailyLogs]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    }
    if (sortDirection === "asc") {
      return <ChevronUp className="w-4 h-4 ml-1" />;
    }
    return <ChevronDown className="w-4 h-4 ml-1" />;
  };

  const handleSortDaily = (field: SortFieldDaily) => {
    if (sortFieldDaily === field) {
      if (sortDirection === "asc") setSortDirection("desc");
      else if (sortDirection === "desc") {
        setSortFieldDaily(null);
        setSortDirection(null);
      }
    } else {
      setSortFieldDaily(field);
      setSortDirection("asc");
    }
  };

  const getSortIconDaily = (field: SortFieldDaily) => {
    if (sortFieldDaily !== field) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    if (sortDirection === "asc") return <ChevronUp className="w-4 h-4 ml-1" />;
    return <ChevronDown className="w-4 h-4 ml-1" />;
  };

  const isDailyAttendance = selectedReportType === "daily-attendance";

  const filteredAndSortedDailyLogs = useMemo(() => {
    const filtered = dailyLogs.filter((row) => {
      if (startDate != null || endDate != null) {
        const logDate = row.log_date;
        if (!logDate) return false;
        const d = new Date(logDate);
        if (isNaN(d.getTime())) return false;
        const logDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        if (startDate != null) {
          const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
          if (logDay < startDay) return false;
        }
        if (endDate != null) {
          const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();
          if (logDay > endDay) return false;
        }
      }
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (row.employee_code ?? "").toLowerCase().includes(q) ||
        (row.employee_name ?? "").toLowerCase().includes(q) ||
        (row.device_id ?? "").toLowerCase().includes(q) ||
        (row.direction ?? "").toLowerCase().includes(q)
      );
    });
    return filtered.sort((a, b) => {
      if (sortFieldDaily && sortDirection) {
        const aVal = a[sortFieldDaily] ?? "";
        const bVal = b[sortFieldDaily] ?? "";
        const cmp =
          sortFieldDaily === "hours_worked"
            ? (Number(aVal) || 0) - (Number(bVal) || 0)
            : aVal < bVal
              ? -1
              : aVal > bVal
                ? 1
                : 0;
        return sortDirection === "asc" ? cmp : -cmp;
      }
      // Default: date desc, then employee name asc (match API order)
      const dateA = (a.log_date ?? "").toString();
      const dateB = (b.log_date ?? "").toString();
      if (dateA !== dateB) return dateB.localeCompare(dateA);
      const nameA = (a.employee_name ?? "").toString();
      const nameB = (b.employee_name ?? "").toString();
      return nameA.localeCompare(nameB);
    });
  }, [dailyLogs, startDate, endDate, searchQuery, sortFieldDaily, sortDirection]);

  const dailyTotalRows = filteredAndSortedDailyLogs.length;
  const dailyTotalPages = Math.max(1, Math.ceil(dailyTotalRows / dailyPageSize));
  const dailyPageSafe = Math.min(dailyPage, dailyTotalPages - 1);
  const dailyStart = dailyPageSafe * dailyPageSize;
  const dailyEnd = Math.min(dailyStart + dailyPageSize, dailyTotalRows);
  const paginatedDailyLogs = filteredAndSortedDailyLogs.slice(dailyStart, dailyEnd);

  const goToDailyPage = () => {
    const raw = dailyGoToPageInput.trim();
    const num = parseInt(raw, 10);
    if (raw === "") return;
    if (Number.isNaN(num) || num < 1 || num > dailyTotalPages) {
      toast.error(
        dailyTotalPages <= 1
          ? "There is only 1 page."
          : `Page must be between 1 and ${dailyTotalPages}. You are not allowed to go to that page.`
      );
      return;
    }
    setDailyPage(num - 1);
    setDailyGoToPageInput("");
  };

  useEffect(() => {
    if (dailyPage >= dailyTotalPages && dailyTotalPages > 0) {
      setDailyPage(0);
    }
  }, [dailyTotalPages, dailyPage]);

  useEffect(() => {
    setDailyGoToPageInput("");
  }, [dailyPageSafe]);

  const filteredAndSortedData = reportTableData
    .filter((row: DemoReportRow) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        row.empCode.toLowerCase().includes(query) ||
        row.name.toLowerCase().includes(query) ||
        row.status.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (!sortField || !sortDirection) return 0;
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    });

  const dailyEmployeeGroupsForStats = useMemo(() => {
    const map = new Map<string, EsslLogEntry[]>();
    for (const log of filteredAndSortedDailyLogs) {
      const key = log.employee_code ?? "";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(log);
    }
    return Array.from(map.entries()).map(([employeeCode, logs]) => ({ employeeCode, logs }));
  }, [filteredAndSortedDailyLogs]);

  const quickStats = useMemo(() => {
    if (isDailyAttendance) {
      const groups = dailyEmployeeGroupsForStats;
      const total = groups.length;
      const withCheckOut = groups.filter((g) =>
        g.logs.some((l) => (l.direction ?? "").toLowerCase() === "out")
      ).length;
      const avgAttendance = total > 0 ? Math.round((withCheckOut / total) * 1000) / 10 : 0;
      const lateThreshold = "09:00:00";
      const lateToday = groups.filter((g) => {
        const inLogs = g.logs.filter((l) => (l.direction ?? "").toLowerCase() === "in" && l.check_in_time);
        if (inLogs.length === 0) return false;
        const earliest = inLogs.reduce((min, l) =>
          (l.check_in_time ?? "") < (min.check_in_time ?? "") ? l : min
        );
        return (earliest.check_in_time ?? "") > lateThreshold;
      }).length;
      return {
        totalEmployees: total,
        avgAttendance,
        lateToday,
        onLeave: 0,
      };
    }
    const data = filteredAndSortedData;
    const total = data.length;
    const presentOrLate = data.filter((r) => r.status === "Present" || r.status === "Late").length;
    const avgAttendance = total > 0 ? Math.round((presentOrLate / total) * 1000) / 10 : 0;
    const lateToday = data.filter((r) => r.status === "Late").length;
    const onLeave = data.filter((r) => r.status === "On Leave").length;
    return {
      totalEmployees: total,
      avgAttendance,
      lateToday,
      onLeave,
    };
  }, [isDailyAttendance, dailyEmployeeGroupsForStats, filteredAndSortedData]);

  const formatLogDate = (logDate: string | null) => {
    if (!logDate) return "—";
    try {
      const datePart = logDate.slice(0, 10);
      const d = new Date(datePart + "T00:00:00");
      return isNaN(d.getTime()) ? logDate : format(d, "MMM dd, yyyy");
    } catch {
      return logDate;
    }
  };

  const exportToCSV = () => {
    if (isDailyAttendance) {
      const headers = ["Employee Code", "Employee Name", "Device ID", "Status", "Log Date", "Check In", "Check Out", "Hours Worked"];
      const csvRows = [
        headers.join(","),
        ...filteredAndSortedDailyLogs.map((row) =>
          [
            row.employee_code,
            row.employee_name,
            row.device_id,
            row.direction,
            row.log_date ? formatLogDate(row.log_date) : "",
            row.check_in_time ?? "",
            row.check_out_time ?? "",
            row.hours_worked != null ? String(row.hours_worked) : "",
          ].join(",")
        ),
      ];
      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Daily_Attendance_Report_${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }
    const headers = ["Emp Code", "Employee Name", "Date", "Check In", "Check Out", "Status", "Hours Worked"];
    const csvRows = [
      headers.join(","),
      ...filteredAndSortedData.map((row) =>
        [row.empCode, row.name, row.date, row.checkIn, row.checkOut, row.status, row.hoursWorked].join(",")
      ),
    ];
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const reportLabel = reportTypes.find((r) => r.value === selectedReportType)?.label || "Report";
    const dateRange =
      startDate && endDate
        ? `_${format(startDate, "yyyy-MM-dd")}_to_${format(endDate, "yyyy-MM-dd")}`
        : `_${format(new Date(), "yyyy-MM-dd")}`;
    link.href = url;
    link.download = `${reportLabel.replace(/\s+/g, "_")}${dateRange}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "text-success";
      case "Late":
        return "text-warning";
      case "Absent":
        return "text-destructive";
      case "On Leave":
        return "text-muted-foreground";
      default:
        return "text-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="px-6 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
            <p className="text-sm text-muted-foreground">Generate and download attendance reports</p>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Report Type Dropdown */}
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedReportType} onValueChange={setSelectedReportType}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select Report Type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[160px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "MMM dd, yyyy") : "Start Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          {/* End Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[160px] justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "MMM dd, yyyy") : "End Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, code, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[250px]"
            />
          </div>

          {/* Export Button */}
          <Button className="ml-auto" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Quick Statistics */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="widget-card text-center">
              <p className="text-3xl font-bold text-foreground">{quickStats.totalEmployees}</p>
              <p className="text-sm text-muted-foreground">Total Employees</p>
            </div>
            <div className="widget-card text-center">
              <p className="text-3xl font-bold text-success">{quickStats.avgAttendance}%</p>
              <p className="text-sm text-muted-foreground">Avg. Attendance</p>
            </div>
            <div className="widget-card text-center">
              <p className="text-3xl font-bold text-warning">{quickStats.lateToday}</p>
              <p className="text-sm text-muted-foreground">Late Today</p>
            </div>
            <div className="widget-card text-center">
              <p className="text-3xl font-bold text-foreground">{quickStats.onLeave}</p>
              <p className="text-sm text-muted-foreground">On Leave</p>
            </div>
          </div>
        </div>

        {/* Report Data Table */}
        <div className="widget-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {reportTypes.find((r) => r.value === selectedReportType)?.label || "Report Data"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isDailyAttendance
                ? "Device logs from ESSL. Ordered by date (newest first), then employee name."
                : startDate && endDate
                  ? `${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`
                  : "All dates"}
            </p>
          </div>

          {isDailyAttendance && dailyLogsError && !USE_REPORTS_DEMO_DATA && (
            <p className="text-sm text-destructive mb-4 bg-destructive/10 px-3 py-2 rounded-md">{dailyLogsError}</p>
          )}
          {isDailyAttendance && !USE_REPORTS_DEMO_DATA && (
            <div className="mb-4">
              <Button variant="outline" size="sm" onClick={loadDailyLogs} disabled={dailyLogsLoading}>
                {dailyLogsLoading ? "Loading…" : "Refresh"}
              </Button>
            </div>
          )}

          <div className="rounded-md border overflow-hidden">
            {isDailyAttendance ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary hover:bg-primary">
                    <TableHead
                      className="text-primary-foreground cursor-pointer select-none"
                      onClick={() => handleSortDaily("employee_code")}
                    >
                      <div className="flex items-center">Employee Code {getSortIconDaily("employee_code")}</div>
                    </TableHead>
                    <TableHead
                      className="text-primary-foreground cursor-pointer select-none"
                      onClick={() => handleSortDaily("employee_name")}
                    >
                      <div className="flex items-center">Employee Name {getSortIconDaily("employee_name")}</div>
                    </TableHead>
                    <TableHead
                      className="text-primary-foreground cursor-pointer select-none"
                      onClick={() => handleSortDaily("device_id")}
                    >
                      <div className="flex items-center">Device ID {getSortIconDaily("device_id")}</div>
                    </TableHead>
                    <TableHead
                      className="text-primary-foreground cursor-pointer select-none"
                      onClick={() => handleSortDaily("direction")}
                    >
                      <div className="flex items-center">Status {getSortIconDaily("direction")}</div>
                    </TableHead>
                    <TableHead
                      className="text-primary-foreground cursor-pointer select-none"
                      onClick={() => handleSortDaily("log_date")}
                    >
                      <div className="flex items-center">Log Date {getSortIconDaily("log_date")}</div>
                    </TableHead>
                    <TableHead
                      className="text-primary-foreground cursor-pointer select-none"
                      onClick={() => handleSortDaily("check_in_time")}
                    >
                      <div className="flex items-center">Check In {getSortIconDaily("check_in_time")}</div>
                    </TableHead>
                    <TableHead
                      className="text-primary-foreground cursor-pointer select-none"
                      onClick={() => handleSortDaily("check_out_time")}
                    >
                      <div className="flex items-center">Check Out {getSortIconDaily("check_out_time")}</div>
                    </TableHead>
                    <TableHead
                      className="text-primary-foreground cursor-pointer select-none"
                      onClick={() => handleSortDaily("hours_worked")}
                    >
                      <div className="flex items-center">Hours Worked {getSortIconDaily("hours_worked")}</div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyLogsLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        Loading attendance logs…
                      </TableCell>
                    </TableRow>
                  ) : dailyTotalRows === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        {dailyLogsError ? "Could not load logs." : "No logs found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedDailyLogs.map((log, idx) => {
                      const dir = (log.direction ?? "").toLowerCase();
                      const isIn = dir === "in";
                      return (
                        <TableRow key={`daily-${log.employee_code ?? ""}-${log.log_date ?? ""}-${idx}`} className="hover:bg-muted/50">
                          <TableCell className="font-medium align-middle">{log.employee_code ?? "—"}</TableCell>
                          <TableCell className="align-middle">{log.employee_name ?? "—"}</TableCell>
                          <TableCell className="align-middle">{log.device_id ?? "—"}</TableCell>
                          <TableCell className="align-middle">
                            {log.direction ? (
                              <span
                                className={cn(
                                  "text-xs font-medium px-2 py-1 rounded-full",
                                  isIn ? "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" : "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400"
                                )}
                              >
                                {log.direction}
                              </span>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="align-middle">{formatLogDate(log.log_date)}</TableCell>
                          <TableCell className="align-middle">{log.check_in_time ?? "—"}</TableCell>
                          <TableCell className="align-middle">{log.check_out_time ?? "—"}</TableCell>
                          <TableCell className="align-middle">
                            {log.hours_worked != null && Number(log.hours_worked) > 0
                              ? Number(log.hours_worked).toFixed(1)
                              : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary hover:bg-primary">
                    <TableHead
                      className="text-primary-foreground cursor-pointer select-none"
                      onClick={() => handleSort("empCode")}
                    >
                      <div className="flex items-center">Emp Code {getSortIcon("empCode")}</div>
                    </TableHead>
                    <TableHead
                      className="text-primary-foreground cursor-pointer select-none"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">Employee Name {getSortIcon("name")}</div>
                    </TableHead>
                    <TableHead
                      className="text-primary-foreground cursor-pointer select-none"
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center">Date {getSortIcon("date")}</div>
                    </TableHead>
                    <TableHead
                      className="text-primary-foreground cursor-pointer select-none"
                      onClick={() => handleSort("checkIn")}
                    >
                      <div className="flex items-center">Check In {getSortIcon("checkIn")}</div>
                    </TableHead>
                    <TableHead
                      className="text-primary-foreground cursor-pointer select-none"
                      onClick={() => handleSort("checkOut")}
                    >
                      <div className="flex items-center">Check Out {getSortIcon("checkOut")}</div>
                    </TableHead>
                    <TableHead
                      className="text-primary-foreground cursor-pointer select-none"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center">Status {getSortIcon("status")}</div>
                    </TableHead>
                    <TableHead
                      className="text-primary-foreground cursor-pointer select-none"
                      onClick={() => handleSort("hoursWorked")}
                    >
                      <div className="flex items-center">Hours Worked {getSortIcon("hoursWorked")}</div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.empCode}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.checkIn}</TableCell>
                      <TableCell>{row.checkOut}</TableCell>
                      <TableCell className={getStatusColor(row.status)}>{row.status}</TableCell>
                      <TableCell>{row.hoursWorked}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {isDailyAttendance && !dailyLogsLoading && filteredAndSortedDailyLogs.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Rows per page</span>
                <Select
                  value={String(dailyPageSize)}
                  onValueChange={(v) => {
                    setDailyPageSize(Number(v));
                    setDailyPage(0);
                  }}
                >
                  <SelectTrigger className="w-[72px]">
                    <SelectValue placeholder="Rows" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                    <SelectItem value="500">500</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  {dailyTotalRows === 0 ? "0 rows" : `${dailyStart + 1}–${dailyEnd} of ${dailyTotalRows}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={dailyPageSafe <= 0}
                  onClick={() => setDailyPage((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  Page {dailyPageSafe + 1} of {dailyTotalPages}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Go to</span>
                  <Input
                    type="number"
                    min={1}
                    max={dailyTotalPages}
                    className="h-8 w-12 px-2 text-center text-sm"
                    placeholder={String(dailyPageSafe + 1)}
                    value={dailyGoToPageInput}
                    onChange={(e) => setDailyGoToPageInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), goToDailyPage())}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    onClick={goToDailyPage}
                  >
                    Go
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={dailyPageSafe >= dailyTotalPages - 1}
                  onClick={() => setDailyPage((p) => Math.min(dailyTotalPages - 1, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports;
