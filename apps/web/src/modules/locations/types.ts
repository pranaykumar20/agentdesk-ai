export type BusinessLocation = {
  id: string;
  name: string;
  city: string;
  region: string;
  phone: string;
  status: "active" | "inactive";
  teamCount: number;
  callsThisMonth: number;
  appointmentsThisMonth: number;
  isPrimary: boolean;
};
