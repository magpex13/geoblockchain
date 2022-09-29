import { records } from '../constants/healthRecords';
import { HealthRecord } from '../types/healthRecord';
import { ApiPromise,WsProvider } from '@polkadot/api'
import { ContractPromise } from '@polkadot/api-contract';
import metadata from '../../../../contract/health-record/target/ink/metadata.json';

const getLocalStorageHealthRecords = (patientId: string): HealthRecord[] => {
  const LSHealthRecords = localStorage.getItem('healthRecords');
  if (LSHealthRecords) {
    const healthRecords = JSON.parse(LSHealthRecords);
    const patientHealthRecords: HealthRecord[] = healthRecords.filter(
      (healthRecord: HealthRecord) => healthRecord.patientId === patientId
    );
    return patientHealthRecords;
  } else {
    localStorage.setItem('healthRecords', JSON.stringify([]));
    return getLocalStorageHealthRecords(patientId);
  }
};

const HealthRecordService = {
  getHealthRecordsByPatientId: async (patientId: string) => {

    let healthRecords: HealthRecord[] = [];
    try {
      const aliceAccountId = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
      const contractKey = "5FmuFBnr7rdqJUnkFDEjevKVSsHpyFZUUEEXX6rkdSEJZiAD";
      const ws = new WsProvider("ws://127.0.0.1:9944");
      const apiPromise = await ApiPromise.create({ provider: ws });
      const contract = new ContractPromise(apiPromise, metadata, contractKey);
      const gasLimit = -1;
      const { result, output } = await contract.query.getHealthRecord(aliceAccountId, { gasLimit });
      // console.log(result.toHuman());
      console.log(output?.toHuman());
      healthRecords = [<HealthRecord>output?.toHuman()];
      console.log(healthRecords);
      apiPromise.disconnect();
    } catch (error) {
      console.log(error);
    }

    if(!healthRecords){
      healthRecords = getLocalStorageHealthRecords(patientId);
    }

    return healthRecords;
    // return getLocalStorageHealthRecords(patientId);
  },
  createHealthRecord: async (healthRecord: HealthRecord) => {
    const id = Math.random().toString(16).substring(2, 8);
    const LSHealthRecords = localStorage.getItem('healthRecords');
    if (LSHealthRecords) {
      const healthRecords = JSON.parse(LSHealthRecords);
      healthRecords.push({ ...healthRecord, id });
      localStorage.setItem('healthRecords', JSON.stringify(healthRecords));
    }
  },
  updateHealthRecord: async (healthRecord: HealthRecord) => {
    const LSHealthRecords = localStorage.getItem('healthRecords');
    if (LSHealthRecords) {
      const healthRecords = JSON.parse(LSHealthRecords);
      const index = healthRecords.findIndex(
        (healthRecordItem: HealthRecord) =>
          healthRecordItem.id === healthRecord.id
      );
      healthRecords[index] = healthRecord;
      localStorage.setItem('healthRecords', JSON.stringify(healthRecords));
    }
  },
  getHealthRecord: async (healthRecordId: string, patientId: string) => {
    const LSHealthRecords = localStorage.getItem('healthRecords');
    if (LSHealthRecords) {
      const healthRecords = JSON.parse(LSHealthRecords);
      const healthRecord = healthRecords.find(
        (healthRecord: HealthRecord) =>
          healthRecord.id === healthRecordId &&
          healthRecord.patientId === patientId
      ) as HealthRecord;
      if (healthRecord) return healthRecord as HealthRecord;
    }
  },
  createTestRecords: async (patientId: string) => {
    function randomDate(start: Date, end: Date) {
      return new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
      );
    }

    const newHealthRecords = records.map((record: HealthRecord) => ({
      ...record,
      patientId,
      id: Math.random().toString(16).substring(2, 8),
      date: randomDate(new Date(2000, 0, 1), new Date()).toISOString()
    }));
    const LSHealthRecords = localStorage.getItem('healthRecords');
    if (LSHealthRecords) {
      const healthRecords: HealthRecord[] = JSON.parse(LSHealthRecords);
      newHealthRecords.forEach((healthRecord: HealthRecord) => {
        healthRecords.push(healthRecord);
      });
      localStorage.setItem('healthRecords', JSON.stringify(healthRecords));
    }
  }
};

export default HealthRecordService;
