/**
 * Icons.jsx
 * A small hand written SVG icon set (stroke based, 24x24 grid) so the project
 * has crisp, consistent iconography without loading an external library.
 * Every icon accepts `size` and `strokeWidth` props.
 */
const base = (size, strokeWidth, children, extra = {}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...extra}
  >
    {children}
  </svg>
);

export const IconDashboard = ({ size = 19, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><rect x="3" y="3" width="7.5" height="9" rx="1.6" /><rect x="13.5" y="3" width="7.5" height="5.5" rx="1.6" /><rect x="3" y="15.5" width="7.5" height="5.5" rx="1.6" /><rect x="13.5" y="12" width="7.5" height="9" rx="1.6" /></>);

export const IconUsers = ({ size = 19, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" /></>);

export const IconLayers = ({ size = 19, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="M12 2 2 7l10 5 10-5-10-5Z" /><path d="m2 17 10 5 10-5M2 12l10 5 10-5" /></>);

export const IconCalendar = ({ size = 19, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><rect x="3" y="4.5" width="18" height="17" rx="2.5" /><path d="M8 2.5v4M16 2.5v4M3 10h18" /></>);

export const IconCalendarCheck = ({ size = 19, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><rect x="3" y="4.5" width="18" height="17" rx="2.5" /><path d="M8 2.5v4M16 2.5v4M3 10h18" /><path d="m9 15.5 2 2 4-4" /></>);

export const IconBook = ({ size = 19, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></>);

export const IconMegaphone = ({ size = 19, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="m3 11 15-8v18l-15-8v-2Z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /><path d="M21 10v4" /></>);

export const IconCheckSquare = ({ size = 19, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="M9 11.5 12 14.5 20 6.5" /><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" /></>);

export const IconUser = ({ size = 19, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>);

export const IconSettings = ({ size = 19, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></>);

export const IconSun = ({ size = 19, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>);

export const IconMoon = ({ size = 19, strokeWidth = 2 }) =>
  base(size, strokeWidth, <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />);

export const IconLogout = ({ size = 19, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>);

export const IconMenu = ({ size = 20, strokeWidth = 2 }) =>
  base(size, strokeWidth, <path d="M3 6h18M3 12h18M3 18h18" />);

export const IconX = ({ size = 19, strokeWidth = 2 }) =>
  base(size, strokeWidth, <path d="M18 6 6 18M6 6l12 12" />);

export const IconSearch = ({ size = 18, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>);

export const IconBell = ({ size = 19, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="M18 8.5a6 6 0 1 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5Z" /><path d="M13.7 20a2 2 0 0 1-3.4 0" /></>);

export const IconChevronDown = ({ size = 16, strokeWidth = 2.2 }) =>
  base(size, strokeWidth, <path d="m6 9 6 6 6-6" />);

export const IconChevronRight = ({ size = 16, strokeWidth = 2.2 }) =>
  base(size, strokeWidth, <path d="m9 6 6 6-6 6" />);

export const IconChevronLeft = ({ size = 16, strokeWidth = 2.2 }) =>
  base(size, strokeWidth, <path d="m15 6-6 6 6 6" />);

export const IconArrowRight = ({ size = 17, strokeWidth = 2.2 }) =>
  base(size, strokeWidth, <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>);

export const IconPlus = ({ size = 17, strokeWidth = 2.2 }) =>
  base(size, strokeWidth, <path d="M12 5v14M5 12h14" />);

export const IconFilter = ({ size = 17, strokeWidth = 2 }) =>
  base(size, strokeWidth, <path d="M3 5h18l-7 8v6l-4-2v-4L3 5Z" />);

export const IconTrash = ({ size = 16, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="M3 6h18M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6M19 6l-.8 13a2 2 0 0 1-2 1.9H7.8a2 2 0 0 1-2-1.9L5 6" /><path d="M10 11v6M14 11v6" /></>);

export const IconEdit = ({ size = 16, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" /><path d="M18.4 2.6a2 2 0 0 1 2.8 2.8L12.5 14l-3.5.9.9-3.5 8.5-8.8Z" /></>);

export const IconClock = ({ size = 15, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" /></>);

export const IconUsersRound = ({ size = 15, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16.5 5.6a3.2 3.2 0 0 1 0 6.2M18.5 20a6 6 0 0 0-2-4.5" /></>);

export const IconVideo = ({ size = 17, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><rect x="2.5" y="6" width="13" height="12" rx="2.5" /><path d="m15.5 10.5 5-3v9l-5-3" /></>);

export const IconLink = ({ size = 16, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="M10 13.5a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2" /><path d="M14 10.5a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2" /></>);

export const IconFileText = ({ size = 17, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="M14 2.5H7a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-11l-5-6Z" /><path d="M14 2.5v6h5M9 13h6M9 17h4" /></>);

export const IconGlobe = ({ size = 17, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" /></>);

export const IconStickyNote = ({ size = 17, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="M15.5 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8l6-6V5a2 2 0 0 0-2-2Z" /><path d="M14 21v-5a1 1 0 0 1 1-1h5" /></>);

export const IconMore = ({ size = 18, strokeWidth = 2.2 }) =>
  base(size, strokeWidth, <><circle cx="12" cy="5" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="12" cy="19" r="1.4" /></>);

export const IconCheck = ({ size = 17, strokeWidth = 2.4 }) =>
  base(size, strokeWidth, <path d="m5 13 4.5 4.5L19 7" />);

export const IconCheckCircle = ({ size = 19, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.5 2.5 4.5-5" /></>);

export const IconXCircle = ({ size = 19, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><circle cx="12" cy="12" r="9" /><path d="m15 9-6 6M9 9l6 6" /></>);

export const IconAlert = ({ size = 19, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="M10.3 3.6 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>);

export const IconInfo = ({ size = 19, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><circle cx="12" cy="12" r="9" /><path d="M12 16v-4.5M12 8h.01" /></>);

export const IconTrendingUp = ({ size = 17, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></>);

export const IconTarget = ({ size = 18, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></>);

export const IconSparkles = ({ size = 18, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="m12 3 1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3Z" /><path d="M19 15.5 19.8 18l2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.5Z" /></>);

export const IconGraduation = ({ size = 20, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="m12 3 10 5-10 5-10-5 10-5Z" /><path d="M5.5 10.5V16c0 1.9 2.9 3.5 6.5 3.5s6.5-1.6 6.5-3.5v-5.5" /></>);

export const IconEye = ({ size = 17, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" /><circle cx="12" cy="12" r="2.8" /></>);

export const IconMail = ({ size = 17, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><rect x="2.5" y="4.5" width="19" height="15" rx="2.5" /><path d="m3 7 9 6 9-6" /></>);

export const IconLock = ({ size = 17, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>);

export const IconShield = ({ size = 17, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="M12 22s7.5-3.4 7.5-9.5V5.5L12 2.5 4.5 5.5v7c0 6.1 7.5 9.5 7.5 9.5Z" /><path d="m9 12 2 2 4-4" /></>);

export const IconExternal = ({ size = 15, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="M14 4h6v6" /><path d="M20 4 10.5 13.5" /><path d="M19 14.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V6.5A1.5 1.5 0 0 1 5 5h4.5" /></>);

export const IconSend = ({ size = 16, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="M21 3 10.5 13.5" /><path d="M21 3 14.5 21l-4-7.5-7.5-4L21 3Z" /></>);

export const IconAward = ({ size = 18, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><circle cx="12" cy="9" r="5.5" /><path d="m8.5 13.5-1.5 7.5 5-2.5 5 2.5-1.5-7.5" /></>);

export const IconBarChart = ({ size = 18, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>);

export const IconInbox = ({ size = 19, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="M21 12.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6.5" /><path d="M3 12.5 5.5 5A2 2 0 0 1 7.4 3.5h9.2A2 2 0 0 1 18.5 5L21 12.5h-5l-1 2.5H9l-1-2.5H3Z" /></>);

export const IconClipboard = ({ size = 18, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><rect x="5" y="4" width="14" height="17" rx="2.5" /><path d="M9 4V2.8A1.8 1.8 0 0 1 10.8 1h2.4A1.8 1.8 0 0 1 15 2.8V4" /><path d="M9 11h6M9 15h4" /></>);

export const IconMessage = ({ size = 17, strokeWidth = 2 }) =>
  base(size, strokeWidth, <path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.2-4.5A8 8 0 1 1 21 12Z" />);

export const IconStar = ({ size = 16, strokeWidth = 2 }) =>
  base(size, strokeWidth, <path d="m12 3 2.8 5.8 6.2.9-4.5 4.4 1 6.3-5.5-3-5.5 3 1-6.3L3 9.7l6.2-.9L12 3Z" />);

export const IconZap = ({ size = 17, strokeWidth = 2 }) =>
  base(size, strokeWidth, <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />);

export const IconActivity = ({ size = 18, strokeWidth = 2 }) =>
  base(size, strokeWidth, <path d="M22 12h-4l-3 8-4-16-3 8H2" />);

export const IconBookOpen = ({ size = 18, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="M2.5 5.5A2 2 0 0 1 4.5 3.5H11v17H4.5a2 2 0 0 1-2-2v-13Z" /><path d="M21.5 5.5a2 2 0 0 0-2-2H13v17h6.5a2 2 0 0 0 2-2v-13Z" /></>);

export const IconRefresh = ({ size = 16, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="M21 12a9 9 0 1 1-2.6-6.4" /><path d="M21 4v5h-5" /></>);

export const IconMapPin = ({ size = 15, strokeWidth = 2 }) =>
  base(size, strokeWidth, <><path d="M20 10.5c0 6-8 11.5-8 11.5s-8-5.5-8-11.5a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10.5" r="2.8" /></>);

export default {
  IconDashboard, IconUsers, IconLayers, IconCalendar, IconCalendarCheck, IconBook,
  IconMegaphone, IconCheckSquare, IconUser, IconSettings, IconSun, IconMoon,
  IconLogout, IconMenu, IconX, IconSearch, IconBell, IconChevronDown, IconChevronRight,
  IconChevronLeft, IconArrowRight, IconPlus, IconFilter, IconTrash, IconEdit, IconClock,
};
