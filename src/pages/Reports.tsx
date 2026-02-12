import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/dashboard/Header";
import { Download, Calendar, FileText, Search, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
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

const reportTypes = [
  { value: "daily-attendance", label: "Daily Attendance Report" },
  { value: "monthly-summary", label: "Monthly Summary" },
  { value: "late-arrival", label: "Late Arrival Report" },
  { value: "leave-report", label: "Leave Report" },
  { value: "department-wise", label: "Department-wise Report" },
  { value: "overtime", label: "Overtime Report" },
];

// Mock tabular data
const reportData = [
  { id: 1, empCode: "EMP001", name: "John Smith", date: "2024-02-04", checkIn: "09:00 AM", checkOut: "06:00 PM", status: "Present", hoursWorked: "9h 00m" },
  { id: 2, empCode: "EMP002", name: "Sarah Johnson", date: "2024-02-04", checkIn: "09:15 AM", checkOut: "06:30 PM", status: "Late", hoursWorked: "9h 15m" },
  { id: 3, empCode: "EMP003", name: "Mike Davis", date: "2024-02-04", checkIn: "08:45 AM", checkOut: "05:45 PM", status: "Present", hoursWorked: "9h 00m" },
  { id: 4, empCode: "EMP004", name: "Emily Brown", date: "2024-02-04", checkIn: "-", checkOut: "-", status: "Absent", hoursWorked: "-" },
  { id: 5, empCode: "EMP005", name: "David Wilson", date: "2024-02-04", checkIn: "09:30 AM", checkOut: "06:00 PM", status: "Late", hoursWorked: "8h 30m" },
  { id: 6, empCode: "EMP006", name: "Lisa Anderson", date: "2024-02-04", checkIn: "08:55 AM", checkOut: "06:15 PM", status: "Present", hoursWorked: "9h 20m" },
  { id: 7, empCode: "EMP007", name: "James Taylor", date: "2024-02-04", checkIn: "-", checkOut: "-", status: "On Leave", hoursWorked: "-" },
  { id: 8, empCode: "EMP008", name: "Jennifer Martinez", date: "2024-02-04", checkIn: "09:05 AM", checkOut: "06:10 PM", status: "Present", hoursWorked: "9h 05m" },
];

type SortField = "empCode" | "name" | "date" | "checkIn" | "checkOut" | "status" | "hoursWorked";
type SortFieldDaily = "employee_code" | "employee_name" | "device_id" | "direction" | "log_date";
type SortDirection = "asc" | "desc" | null;

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

  useEffect(() => {
    if (selectedReportType === "daily-attendance") {
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

  const filteredAndSortedDailyLogs = dailyLogs
    .filter((row) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (row.employee_code ?? "").toLowerCase().includes(q) ||
        (row.employee_name ?? "").toLowerCase().includes(q) ||
        (row.device_id ?? "").toLowerCase().includes(q) ||
        (row.direction ?? "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (!sortFieldDaily || !sortDirection) return 0;
      const aVal = a[sortFieldDaily] ?? "";
      const bVal = b[sortFieldDaily] ?? "";
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDirection === "asc" ? cmp : -cmp;
    });

  const filteredAndSortedData = reportData
    .filter((row) => {
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

  const formatLogDate = (logDate: string | null) => {
    if (!logDate) return "—";
    try {
      const d = new Date(logDate);
      return isNaN(d.getTime()) ? logDate : format(d, "MMM dd, yyyy HH:mm");
    } catch {
      return logDate;
    }
  };

  const exportToCSV = () => {
    if (isDailyAttendance) {
      const headers = ["Employee Code", "Employee Name", "Device ID", "Direction", "Log Date"];
      const csvRows = [
        headers.join(","),
        ...filteredAndSortedDailyLogs.map((row) =>
          [
            row.employee_code,
            row.employee_name,
            row.device_id,
            row.direction,
            row.log_date ? formatLogDate(row.log_date) : "",
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
              <p className="text-3xl font-bold text-foreground">248</p>
              <p className="text-sm text-muted-foreground">Total Employees</p>
            </div>
            <div className="widget-card text-center">
              <p className="text-3xl font-bold text-success">86.7%</p>
              <p className="text-sm text-muted-foreground">Avg. Attendance</p>
            </div>
            <div className="widget-card text-center">
              <p className="text-3xl font-bold text-warning">12</p>
              <p className="text-sm text-muted-foreground">Late Today</p>
            </div>
            <div className="widget-card text-center">
              <p className="text-3xl font-bold text-foreground">6</p>
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
                ? "Latest 50 device logs from ESSL"
                : startDate && endDate
                  ? `${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`
                  : "All dates"}
            </p>
          </div>

          {isDailyAttendance && dailyLogsError && (
            <p className="text-sm text-destructive mb-4 bg-destructive/10 px-3 py-2 rounded-md">{dailyLogsError}</p>
          )}
          {isDailyAttendance && (
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
                      <div className="flex items-center">Direction {getSortIconDaily("direction")}</div>
                    </TableHead>
                    <TableHead
                      className="text-primary-foreground cursor-pointer select-none"
                      onClick={() => handleSortDaily("log_date")}
                    >
                      <div className="flex items-center">Log Date {getSortIconDaily("log_date")}</div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyLogsLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Loading attendance logs…
                      </TableCell>
                    </TableRow>
                  ) : filteredAndSortedDailyLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        {dailyLogsError ? "Could not load logs." : "No logs found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedDailyLogs.map((row, idx) => (
                      <TableRow key={`${row.employee_code}-${row.log_date ?? ""}-${idx}`}>
                        <TableCell className="font-medium">{row.employee_code ?? "—"}</TableCell>
                        <TableCell>{row.employee_name ?? "—"}</TableCell>
                        <TableCell>{row.device_id ?? "—"}</TableCell>
                        <TableCell>{row.direction ?? "—"}</TableCell>
                        <TableCell>{formatLogDate(row.log_date)}</TableCell>
                      </TableRow>
                    ))
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
        </div>
      </main>
    </div>
  );
};

export default Reports;
