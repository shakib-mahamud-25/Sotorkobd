// Curated list of Dhaka neighborhoods/areas with approximate center coordinates.
// Used for the "select a neighborhood" fallback when a user doesn't want to
// share GPS or drop a manual pin. Coordinates are area centers, not exact —
// intentionally coarse for privacy.
export interface DhakaArea {
  name: string;
  latitude: number;
  longitude: number;
}

export const DHAKA_AREAS: DhakaArea[] = [
  { name: "Mirpur 1", latitude: 23.7961, longitude: 90.3565 },
  { name: "Mirpur 2", latitude: 23.8103, longitude: 90.3654 },
  { name: "Mirpur 10", latitude: 23.8069, longitude: 90.3687 },
  { name: "Mirpur 11", latitude: 23.8237, longitude: 90.3654 },
  { name: "Mirpur 12", latitude: 23.8369, longitude: 90.3654 },
  { name: "Kazipara", latitude: 23.8213, longitude: 90.3654 },
  { name: "Shewrapara", latitude: 23.8154, longitude: 90.3654 },
  { name: "Pallabi", latitude: 23.8259, longitude: 90.3654 },
  { name: "Uttara Sector 3", latitude: 23.8747, longitude: 90.3987 },
  { name: "Uttara Sector 4", latitude: 23.8698, longitude: 90.3987 },
  { name: "Uttara Sector 7", latitude: 23.8759, longitude: 90.3795 },
  { name: "Uttara Sector 10", latitude: 23.8642, longitude: 90.3987 },
  { name: "Airport", latitude: 23.8433, longitude: 90.3978 },
  { name: "Dhanmondi 2", latitude: 23.7461, longitude: 90.3742 },
  { name: "Dhanmondi 27", latitude: 23.7509, longitude: 90.3742 },
  { name: "Dhanmondi 32", latitude: 23.7509, longitude: 90.3797 },
  { name: "Zigatola", latitude: 23.7461, longitude: 90.3801 },
  { name: "Jigatola", latitude: 23.7401, longitude: 90.3797 },
  { name: "Rayer Bazar", latitude: 23.7371, longitude: 90.3625 },
  { name: "Hazaribagh", latitude: 23.7271, longitude: 90.3625 },
  { name: "Gulshan 1", latitude: 23.7925, longitude: 90.4078 },
  { name: "Gulshan 2", latitude: 23.7808, longitude: 90.4147 },
  { name: "Banani", latitude: 23.7937, longitude: 90.4066 },
  { name: "Baridhara", latitude: 23.7989, longitude: 90.4225 },
  { name: "Niketan", latitude: 23.7683, longitude: 90.4198 },
  { name: "New Market", latitude: 23.7325, longitude: 90.3860 },
  { name: "Azimpur", latitude: 23.7280, longitude: 90.3838 },
  { name: "Lalbagh", latitude: 23.7104, longitude: 90.3859 },
  { name: "Old Dhaka - Chawkbazar", latitude: 23.7183, longitude: 90.3915 },
  { name: "Old Dhaka - Sadarghat", latitude: 23.7061, longitude: 90.4074 },
  { name: "Motijheel", latitude: 23.7104, longitude: 90.4074 },
  { name: "Paltan", latitude: 23.7333, longitude: 90.4113 },
  { name: "Jatrabari", latitude: 23.7271, longitude: 90.4128 },
  { name: "Sayedabad", latitude: 23.7275, longitude: 90.4200 },
  { name: "Farmgate", latitude: 23.7590, longitude: 90.3670 },
  { name: "Karwan Bazar", latitude: 23.7654, longitude: 90.3934 },
  { name: "Panthapath", latitude: 23.7461, longitude: 90.3897 },
  { name: "Elephant Road", latitude: 23.7515, longitude: 90.3841 },
  { name: "Shahbagh", latitude: 23.7383, longitude: 90.3958 },
  { name: "Mohammadpur", latitude: 23.7643, longitude: 90.3599 },
  { name: "Shyamoli", latitude: 23.7806, longitude: 90.3653 },
  { name: "Adabor", latitude: 23.7699, longitude: 90.3564 },
  { name: "Kallyanpur", latitude: 23.7789, longitude: 90.3599 },
  { name: "Khilgaon", latitude: 23.7383, longitude: 90.4173 },
  { name: "Rampura", latitude: 23.7677, longitude: 90.4203 },
  { name: "Badda", latitude: 23.7809, longitude: 90.4267 },
  { name: "Mohakhali", latitude: 23.7808, longitude: 90.4014 },
  { name: "Tejgaon", latitude: 23.7679, longitude: 90.3936 },
  { name: "Malibagh", latitude: 23.7461, longitude: 90.4128 },
  { name: "Bashundhara", latitude: 23.8151, longitude: 90.4342 },
];
