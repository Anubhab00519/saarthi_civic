export const ICONS = {
  mapPin:    'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10a2 2 0 100-4 2 2 0 000 4z',
  shield:    'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  zap:       'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  building:  'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  chartBar:  'M18 20V10 M12 20V4 M6 20v-6',
  check:     'M20 6L9 17l-5-5',
  x:         'M18 6L6 18 M6 6l12 12',
  arrowR:    'M5 12h14 M12 5l7 7-7 7',
  arrowUpR:  'M7 17L17 7 M7 7h10v10',
  eye:       'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12a3 3 0 100-6 3 3 0 000 6z',
  eyeOff:    'M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94 M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19 M1 1l22 22',
  lock:      'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4',
  alert:     'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01',
  cpu:       'M9 3H5a2 2 0 00-2 2v4 M15 3h4a2 2 0 012 2v4 M9 21H5a2 2 0 01-2-2v-4 M15 21h4a2 2 0 002-2v-4 M9 9h6v6H9z',
  menu:      'M3 12h18 M3 6h18 M3 18h18',
  users:     'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
  checkCirc: 'M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3',
  globe:     'M2 12a10 10 0 1020 0 10 10 0 00-20 0z M2 12h20 M12 2a15.3 15.3 0 010 20 15.3 15.3 0 010-20z',
}

export default function Icon({ name, size = 20, stroke = 'currentColor', fill = 'none', className = '' }) {
  const d = ICONS[name] ?? ''
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {d.split(' M').filter(Boolean).map((seg, i) => (
        <path key={i} d={i === 0 ? seg : 'M' + seg} />
      ))}
    </svg>
  )
}