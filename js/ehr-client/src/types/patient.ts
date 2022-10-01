export type Patient = {
  id: string;
  name: string;
  dateOfBirth: string;
  ssn: string;
  key: string;
};

export type PatientsResponse = {
  patients: Patient[];
  totalPages: number;
  currentPage: number;
};

export type PatientResponse = {
  patient: Patient;
};
