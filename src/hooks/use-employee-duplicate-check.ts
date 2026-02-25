import { useState, useCallback, useRef, useEffect } from "react";
import { checkEmployeeDuplicate } from "@/lib/api";
import { toast } from "sonner";

export type DuplicateErrors = {
  phone?: string;
  email?: string;
  governmentIdValue?: string;
};

const DUPLICATE_MESSAGES = {
  phone: "This phone number is already used by another active employee in this office.",
  email: "This email is already used by another active employee in this office.",
  governmentIdValue: "This government ID is already used by another active employee in this office.",
} as const;

type DuplicateField = keyof DuplicateErrors;

export function useEmployeeDuplicateCheck(options: {
  getOfficeId: () => number | string | "";
  getPhone: () => string;
  getEmail: () => string;
  getGovernmentIdValue: () => string;
  getExcludeEmployeeId?: () => number | undefined;
}) {
  const [duplicateErrors, setDuplicateErrors] = useState<DuplicateErrors>({});
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const checkDuplicates = useCallback(async (field: DuplicateField) => {
    const opts = optionsRef.current;
    const officeId = Number(opts.getOfficeId());
    if (!officeId) return;
    const phone = opts.getPhone().trim();
    const email = opts.getEmail().trim();
    const govt = opts.getGovernmentIdValue().trim();
    if (!phone && !email && !govt) {
      setDuplicateErrors((prev) => ({ ...prev, [field]: undefined }));
      return;
    }
    try {
      const result = await checkEmployeeDuplicate(
        officeId,
        {
          phone_number: phone || undefined,
          email: email || undefined,
          government_id_value: govt || undefined,
        },
        opts.getExcludeEmployeeId?.()
      );
      setDuplicateErrors({
        phone: result.phone_number_taken ? DUPLICATE_MESSAGES.phone : undefined,
        email: result.email_taken ? DUPLICATE_MESSAGES.email : undefined,
        governmentIdValue: result.government_id_value_taken ? DUPLICATE_MESSAGES.governmentIdValue : undefined,
      });
      if (result.phone_number_taken || result.email_taken || result.government_id_value_taken) {
        toast.error("Duplicate value: already used by an active employee in this office.");
      }
    } catch {
      setDuplicateErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, []);

  return { duplicateErrors, setDuplicateErrors, checkDuplicates };
}
