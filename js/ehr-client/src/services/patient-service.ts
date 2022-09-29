import { patientsResponse } from '../constants/patientsResponse';
import { Patient } from '../types/patient';

const getLocalStoragePatients = (
  page: number,
  search: string,
  limit: number
): { patients: Patient[]; totalPages: number } => {
  const LSPatients = localStorage.getItem('patients');
  if (LSPatients) {
    const patients = JSON.parse(LSPatients);
    const filteredPatients = patients.filter((patient: Patient) =>
      patient.name.toLowerCase().includes(search.toLowerCase())
    );
    const paginatedPatients = filteredPatients.slice(
      (page - 1) * limit,
      (page - 1) * limit + limit
    );
    return {
      patients: paginatedPatients,
      totalPages: Math.ceil(filteredPatients.length / limit)
    };
  } else {
    localStorage.setItem('patients', JSON.stringify(patientsResponse.patients));
    return getLocalStoragePatients(page, search, limit);
  }
};

export const PatientService = {
  getPatients: async (page: number, search: string, limit: number) => {
    const patients = getLocalStoragePatients(page, search, limit);
    return patients;
  },
  createPatient: async (patient: Omit<Patient, 'id'>) => {
    const id = Math.random().toString(16).substring(2, 8);
    const LSPatients = localStorage.getItem('patients');
    if (LSPatients) {
      const patients = JSON.parse(LSPatients);
      patients.push({ ...patient, id });
      localStorage.setItem('patients', JSON.stringify(patients));
    }
  },
  getPatient: async (id: string) => {
    const LSPatients = localStorage.getItem('patients');
    if (LSPatients) {
      const patients = JSON.parse(LSPatients);
      const patient: Patient = patients.find(
        (patient: Patient) => patient.id === id
      );
      return patient;
    } else {
      return null;
    }
  }
};
