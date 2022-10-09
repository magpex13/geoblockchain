import { records } from '../constants/healthRecords';
import { HealthRecord } from '../types/healthRecord';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api'
import { ContractPromise } from '@polkadot/api-contract';
import metadata from '../../../../contract/health-record/build/metadata.json';
import { GeoblockchainConstants } from '../utils/blockchain-helper';


const getLocalStorageHealthRecords = (patientId: string): HealthRecord[] => {
  const LSHealthRecords = localStorage.getItem('healthRecords');
  if (LSHealthRecords) {
    const healthRecords = JSON.parse(LSHealthRecords);
    const patientHealthRecords: HealthRecord[] = healthRecords.filter(
      (healthRecord: HealthRecord) => healthRecord.patientId === patientId
    );
    return patientHealthRecords;
  }

  return [];
  // } else {
  //   localStorage.setItem('healthRecords', JSON.stringify([]));
  //   return getLocalStorageHealthRecords(patientId);
  // }
};

const HealthRecordService = {
  getHealthRecordsByPatientId: async (patientId: string) => {
    const localHealthRecord = getLocalStorageHealthRecords(patientId);

    if (!localHealthRecord || localHealthRecord.length <= 0) {
      try {
        const ws = new WsProvider(GeoblockchainConstants.url);
        const apiPromise = await ApiPromise.create({ provider: ws });
        const contract = new ContractPromise(apiPromise, metadata, GeoblockchainConstants.contractId);
        const { output } = await contract.query.getHealthRecords(patientId, { gasLimit: GeoblockchainConstants.gasLimit });
        // console.log(result.toHuman());
        console.log(output?.toHuman());
        localStorage.setItem('healthRecords', JSON.stringify((<HealthRecord[]>output?.toHuman()).map((x) => ({ ...x, prescription: [], observations: [] }))));
        // await HealthRecordService.createHealthRecord({ ...<HealthRecord>output?.toHuman(), prescription: [], observations: [], patientId });
        apiPromise.disconnect();
      } catch (error) {
        console.log(error);
      }
    }

    return getLocalStorageHealthRecords(patientId);
    // return getLocalStorageHealthRecords(patientId);
  },
  createHealthRecord: async (healthRecord: HealthRecord) => {
    const id = parseInt(Math.random().toString(10).substring(2, 5));

    try {
      const ws = new WsProvider(GeoblockchainConstants.url);
      const apiPromise = await ApiPromise.create({ provider: ws });
      const contract = new ContractPromise(apiPromise, metadata, GeoblockchainConstants.contractId);

      let keyring = new Keyring({ type: "sr25519" });
      let aliceKeypair = keyring.addFromUri('//Alice');
      // console.log(result.toHuman());
      const values = [id, healthRecord.patientId, healthRecord.description, healthRecord.date];
      await contract.tx["addHealthRecord"]({ gasLimit: GeoblockchainConstants.gasLimit }, values).signAndSend(aliceKeypair);
      apiPromise.disconnect();
    } catch (error) {
      console.log("ERROR - createHealthRecord: ", error);
    }

    const LSHealthRecords = localStorage.getItem('healthRecords');
    if (LSHealthRecords) {
      const healthRecords = JSON.parse(LSHealthRecords);
      healthRecords.push({ ...healthRecord, id: id.toString() });
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
