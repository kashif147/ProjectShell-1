import dayjs from "dayjs";

export const HOLIDAY_CATEGORIES = [
  { value: "BANK_HOLIDAY", label: "Bank holiday" },
  { value: "CHRISTMAS", label: "Christmas" },
  { value: "EASTER", label: "Easter" },
  { value: "PUBLIC_HOLIDAY", label: "Public holiday" },
  { value: "OTHER", label: "Other" },
];

export const getHolidayCategoryLabel = (value) =>
  HOLIDAY_CATEGORIES.find((c) => c.value === value)?.label || value;

export const OFFICE_TYPES = [
  { value: "HEAD_OFFICE", label: "Head Office" },
  { value: "BRANCH", label: "Branch" },
  { value: "REGIONAL_OFFICE", label: "Regional Office" },
];

export const WEEKDAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const DAY_LABELS = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

const DEFAULT_DAY_HOURS = {
  MONDAY: { openTime: "09:00", closeTime: "17:00", isClosed: false },
  TUESDAY: { openTime: "09:00", closeTime: "17:00", isClosed: false },
  WEDNESDAY: { openTime: "09:00", closeTime: "17:00", isClosed: false },
  THURSDAY: { openTime: "09:00", closeTime: "17:00", isClosed: false },
  FRIDAY: { openTime: "08:30", closeTime: "16:30", isClosed: false },
  SATURDAY: { openTime: "", closeTime: "", isClosed: true },
  SUNDAY: { openTime: "", closeTime: "", isClosed: true },
};

export const getDayLabel = (day) => DAY_LABELS[day] || day;

/** Default open/close for a day when marking it as a working day. */
export const getDefaultDayHours = (day) =>
  DEFAULT_DAY_HOURS[day] || {
    openTime: "09:00",
    closeTime: "17:00",
    isClosed: false,
  };

export const defaultOfficeAddress = () => ({
  buildingOrHouse: "",
  streetOrRoad: "",
  areaOrTown: "",
  countyCityOrPostCode: "",
  eircode: "",
  country: "Ireland",
});

export const buildDefaultOpeningHours = () =>
  WEEKDAYS.map((day) => ({
    day,
    ...DEFAULT_DAY_HOURS[day],
  }));

export const normalizeOpeningHours = (openingHours) => {
  if (!Array.isArray(openingHours) || openingHours.length === 0) {
    return buildDefaultOpeningHours();
  }

  const byDay = Object.fromEntries(
    openingHours
      .filter((row) => row?.day && WEEKDAYS.includes(row.day))
      .map((row) => [row.day, row])
  );

  return WEEKDAYS.map((day) => {
    const row = byDay[day];
    if (!row) {
      return { day, ...DEFAULT_DAY_HOURS[day] };
    }
    return {
      day,
      openTime: row.openTime ?? DEFAULT_DAY_HOURS[day].openTime,
      closeTime: row.closeTime ?? DEFAULT_DAY_HOURS[day].closeTime,
      isClosed: Boolean(row.isClosed),
    };
  });
};

export const emptyHolidayDraft = () => ({
  name: "",
  category: "PUBLIC_HOLIDAY",
  startDate: null,
  endDate: null,
  notes: "",
});

const toDayjs = (value) => {
  if (!value) return null;
  const d = dayjs(value);
  return d.isValid() ? d : null;
};

export const normalizeNonWorkingDaysForForm = (items = []) =>
  [...items]
    .map((row) => ({
      _id: row._id,
      clientId: row._id || row.clientId || `temp-${row.name}-${row.startDate}`,
      name: row.name || "",
      category: row.category || "PUBLIC_HOLIDAY",
      startDate: toDayjs(row.startDate),
      endDate: toDayjs(row.endDate),
      notes: row.notes || "",
    }))
    .sort((a, b) => {
      if (!a.startDate) return 1;
      if (!b.startDate) return -1;
      return a.startDate.valueOf() - b.startDate.valueOf();
    });

export const formatNonWorkingDayRange = (startDate, endDate) => {
  const start = toDayjs(startDate);
  const end = toDayjs(endDate);
  if (!start) return "—";
  const fmt = (d) => d.format("DD/MM/YYYY");
  if (!end || end.isSame(start, "day")) return fmt(start);
  return `${fmt(start)} – ${fmt(end)}`;
};

export const serializeNonWorkingDaysForApi = (items = []) =>
  items
    .map((row) => {
      const start = toDayjs(row.startDate);
      const end = toDayjs(row.endDate) || start;
      if (!start || !row.name?.trim()) return null;
      return {
        name: row.name.trim(),
        category: row.category || "PUBLIC_HOLIDAY",
        startDate: start.format("YYYY-MM-DD"),
        endDate: end ? end.format("YYYY-MM-DD") : start.format("YYYY-MM-DD"),
        notes: row.notes?.trim() || "",
      };
    })
    .filter(Boolean);

export const emptyOfficeDetailsForm = () => ({
  name: "",
  officeType: "BRANCH",
  address: defaultOfficeAddress(),
  email: "",
  phone: "",
  isPrimary: false,
  isActive: true,
});

export const officeToDetailsForm = (office) => ({
  name: office?.name || "",
  officeType: office?.officeType || "BRANCH",
  address: {
    ...defaultOfficeAddress(),
    ...(office?.address || {}),
  },
  email: office?.email || "",
  phone: office?.phone || "",
  isPrimary: Boolean(office?.isPrimary),
  isActive: office?.isActive !== false,
});

export const serializeOfficeDetailsForApi = (form) => ({
  name: form.name?.trim(),
  officeType: form.officeType || "BRANCH",
  address: form.address,
  email: form.email?.trim() || undefined,
  phone: form.phone?.trim() || undefined,
  isPrimary: Boolean(form.isPrimary),
  isActive: form.isActive !== false,
});

export const emptyOfficeForm = () => ({
  name: "",
  officeType: "BRANCH",
  address: defaultOfficeAddress(),
  email: "",
  phone: "",
  openingHours: buildDefaultOpeningHours(),
  nonWorkingDays: [],
  isPrimary: false,
  isActive: true,
});

export const officeToForm = (office) => ({
  name: office?.name || "",
  officeType: office?.officeType || "BRANCH",
  address: {
    ...defaultOfficeAddress(),
    ...(office?.address || {}),
  },
  email: office?.email || "",
  phone: office?.phone || "",
  openingHours: normalizeOpeningHours(office?.openingHours),
  nonWorkingDays: normalizeNonWorkingDaysForForm(office?.nonWorkingDays),
  isPrimary: Boolean(office?.isPrimary),
  isActive: office?.isActive !== false,
});

export const formatOfficeAddress = (address = {}) => {
  const parts = [
    address.buildingOrHouse,
    address.streetOrRoad,
    address.areaOrTown,
    address.countyCityOrPostCode,
    address.eircode,
    address.country,
  ].filter(Boolean);
  return parts.join(", ") || "—";
};
