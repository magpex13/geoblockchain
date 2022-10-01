import { PatientResponse, PatientsResponse } from '../types/patient';

export const patientsResponse: PatientsResponse = {
  patients: [
    {
      id: '1',
      name: 'John',
      dateOfBirth: '01/01/2012',
      ssn: '123-45-6789',
      key: ''
    },
    {
      id: '2',
      name: 'Jane',
      dateOfBirth: '01/01/1820',
      ssn: '123-45-6789',
      key: ''
    },
    {
      id: '3',
      name: 'Bob',
      dateOfBirth: '01/01/1920',
      ssn: '123-45-6789',
      key: ''
    },
    {
      id: '4',
      name: 'Jerry',
      dateOfBirth: '01/01/2010',
      ssn: '123-45-6789',
      key: ''
    }
  ],
  totalPages: 1,
  currentPage: 1
};
