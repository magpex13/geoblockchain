import { patientsResponse } from '../constants/patientsResponse';
import { Patient } from '../types/patient';
import { uniqueNamesGenerator, names } from 'unique-names-generator';
import { ApiPromise, WsProvider } from '@polkadot/api';
const { encodeAddress } = require('@polkadot/util-crypto');
import { GeoblockchainConstants } from '../utils/blockchain-helper';


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
  }

  return { patients: [], totalPages: 0};
  // } else {
  //   localStorage.setItem('patients', JSON.stringify(patientsResponse.patients));
  //   return getLocalStoragePatients(page, search, limit);
  // }
};

export const PatientService = {
  getPatients: async (page: number, search: string, limit: number) => {
    const localPatients = getLocalStoragePatients(page, search, limit);

    if(!localPatients || localPatients.totalPages <= 0)
    {
      try {
        const ws = new WsProvider(GeoblockchainConstants.url);
        const apiPromise = await ApiPromise.create({ provider: ws });
        const patients = (await apiPromise.query.system.account.entries()).map<Patient>((x) => (<Patient>{ id:Math.random().toString(10).substring(2, 5) ,key: encodeAddress(x[0].slice(-32)), name: uniqueNamesGenerator({ dictionaries: [names] }) }));
        localStorage.setItem('patients', JSON.stringify(patients));
        apiPromise.disconnect();
      } catch (error) {
        console.log(error);
      }
    }

    return getLocalStoragePatients(page, search, limit);
  },
  createPatient: async (patient: Omit<Patient, 'id'>) => {
    const id = Math.random().toString(10).substring(2, 5);
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
