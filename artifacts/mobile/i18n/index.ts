type Locale = 'en' | 'ar';

const messages = {
  en: {
    today: 'Today',
    tomorrow: 'Tomorrow',
    viewAppointments: 'View Appointments',
    selectDate: 'Select Date',
    availableTimes: 'Available Times',
    confirmAppointment: 'Confirm Appointment',
    booking: 'Booking...',
    requestHomeVisit: 'Request Home Visit',
    requesting: 'Requesting...',
  },
  ar: {
    today: 'اليوم',
    tomorrow: 'غدا',
    viewAppointments: 'عرض المواعيد',
    selectDate: 'اختر التاريخ',
    availableTimes: 'الأوقات المتاحة',
    confirmAppointment: 'تأكيد الموعد',
    booking: 'جار الحجز...',
    requestHomeVisit: 'طلب زيارة منزلية',
    requesting: 'جار الطلب...',
  },
} as const;

let currentLocale: Locale = 'en';

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale() {
  return currentLocale;
}

export function t(key: keyof typeof messages.en) {
  return messages[currentLocale][key] ?? messages.en[key];
}
