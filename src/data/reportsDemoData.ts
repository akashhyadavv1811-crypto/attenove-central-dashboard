import type { EsslLogEntry } from "@/lib/api";

/**
 * Set to true via env (e.g. VITE_REPORTS_USE_DEMO_DATA=true) to use demo data
 * for Daily Attendance and for other report types (mock table).
 */
export const USE_REPORTS_DEMO_DATA =
  import.meta.env.VITE_REPORTS_USE_DEMO_DATA === "true" ||
  import.meta.env.VITE_REPORTS_USE_DEMO_DATA === "1";

const DEMO_INDIAN_NAMES = [
  "Rajesh Kumar", "Priya Sharma", "Amit Patel", "Sneha Reddy", "Vikram Singh",
  "Kavita Nair", "Suresh Iyer", "Anita Desai", "Rahul Mehta", "Pooja Joshi",
  "Arun Krishnan", "Deepa Menon", "Manoj Gupta", "Lakshmi Pillai", "Sanjay Verma",
  "Meera Rao", "Kiran Nambiar", "Sunita Bhat", "Ramesh Choudhury", "Kavitha Rajan",
  "Venkat Subramanian", "Shobha Murthy", "Gopalakrishnan", "Divya Venkatesh",
  "Senthil Perumal", "Malini Sundaram", "Bala Chandran", "Preeti Agarwal",
  "Harish Prabhu", "Swati Dixit", "Naveen Kapoor", "Rekha Malhotra",
  "Prakash Tiwari", "Neha Saxena", "Srinivas Varma", "Anjali Tripathi",
  "Mohan Das", "Kirti Banerjee", "Ravi Shankar", "Shalini Ghosh",
  "Karthik Bose", "Indira Chatterjee", "Ganesh Mukherjee", "Ritu Dutta",
  "Lakshmanan", "Pallavi Sengupta", "Subramanian", "Nidhi Roy",
  "Venugopal", "Aditi Sinha",
];

/** Demo attendance logs for Daily Attendance report when USE_REPORTS_DEMO_DATA is true. */
export function getDemoAttendanceLogs(): EsslLogEntry[] {
  const logs: EsslLogEntry[] = [];
  const devices = [3, 17, 31, 42, 51, 62, 88, 103, 111, 119];
  const baseDate = new Date(2026, 1, 10);
  const pad = (n: number) => String(n).padStart(2, "0");

  const patterns: string[][] = [
    ["08:45:00", "13:05:00", "14:00:00", "18:30:00"],
    ["09:00:00", "13:00:00", "13:45:00", "17:15:00", "17:30:00"],
    ["07:30:00", "12:00:00", "12:45:00", "16:30:00"],
    ["09:15:00", "11:30:00", "12:15:00", "15:00:00", "15:15:00"],
    ["08:00:00", "12:30:00", "13:15:00", "17:45:00"],
    ["10:00:00", "13:00:00", "14:00:00", "18:00:00"],
  ];

  const addOffset = (timeStr: string, mins: number): string => {
    const [h, m, s] = timeStr.split(":").map(Number);
    let totalMin = h * 60 + m + mins;
    if (totalMin >= 24 * 60) totalMin -= 24 * 60;
    return `${pad(Math.floor(totalMin / 60))}:${pad(totalMin % 60)}:${pad(s)}`;
  };

  DEMO_INDIAN_NAMES.forEach((name, idx) => {
    const code = `E${String(idx + 1).padStart(3, "0")}`;
    const dev = String(devices[idx % devices.length]);
    const logDate = new Date(baseDate);
    logDate.setDate(logDate.getDate() + (idx % 2));
    const dateStr = logDate.toISOString().slice(0, 10);
    const punches = patterns[idx % patterns.length];
    const offsetMin = (idx * 3) % 12;

    punches.forEach((baseTime, pIdx) => {
      const time = addOffset(baseTime, offsetMin);
      const isIn = pIdx % 2 === 0;
      logs.push({
        employee_code: code,
        employee_name: name,
        device_id: dev,
        direction: isIn ? "in" : "out",
        log_date: dateStr,
        ...(isIn ? { check_in_time: time, check_out_time: null } : { check_in_time: null, check_out_time: time }),
        hours_worked: null,
      });
    });
  });

  return logs.sort((a, b) => {
    const codeA = a.employee_code ?? "";
    const codeB = b.employee_code ?? "";
    if (codeA !== codeB) return codeA.localeCompare(codeB);
    const dateA = a.log_date ?? "";
    const dateB = b.log_date ?? "";
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    const timeA = a.check_in_time ?? a.check_out_time ?? "";
    const timeB = b.check_in_time ?? b.check_out_time ?? "";
    return String(timeA).localeCompare(String(timeB));
  });
}

/** Row shape for mock report table (non–Daily Attendance) when using demo data. */
export type DemoReportRow = {
  id: number;
  empCode: string;
  name: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
  hoursWorked: string;
};

/** Mock tabular data for report types other than Daily Attendance. Used only when USE_REPORTS_DEMO_DATA is true. */
export const demoReportTableData: DemoReportRow[] = [
  { id: 1, empCode: "EMP001", name: "John Smith", date: "2024-02-04", checkIn: "09:00 AM", checkOut: "06:00 PM", status: "Present", hoursWorked: "9h 00m" },
  { id: 2, empCode: "EMP002", name: "Sarah Johnson", date: "2024-02-04", checkIn: "09:15 AM", checkOut: "06:30 PM", status: "Late", hoursWorked: "9h 15m" },
  { id: 3, empCode: "EMP003", name: "Mike Davis", date: "2024-02-04", checkIn: "08:45 AM", checkOut: "05:45 PM", status: "Present", hoursWorked: "9h 00m" },
  { id: 4, empCode: "EMP004", name: "Emily Brown", date: "2024-02-04", checkIn: "-", checkOut: "-", status: "Absent", hoursWorked: "-" },
  { id: 5, empCode: "EMP005", name: "David Wilson", date: "2024-02-04", checkIn: "09:30 AM", checkOut: "06:00 PM", status: "Late", hoursWorked: "8h 30m" },
  { id: 6, empCode: "EMP006", name: "Lisa Anderson", date: "2024-02-04", checkIn: "08:55 AM", checkOut: "06:15 PM", status: "Present", hoursWorked: "9h 20m" },
  { id: 7, empCode: "EMP007", name: "James Taylor", date: "2024-02-04", checkIn: "-", checkOut: "-", status: "On Leave", hoursWorked: "-" },
  { id: 8, empCode: "EMP008", name: "Jennifer Martinez", date: "2024-02-04", checkIn: "09:05 AM", checkOut: "06:10 PM", status: "Present", hoursWorked: "9h 05m" },
];
