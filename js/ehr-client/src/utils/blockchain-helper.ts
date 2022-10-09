import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import { mnemonicGenerate } from "@polkadot/util-crypto";
import metadata from '../../../../contract/health-record/build/metadata.json';
import { Patient } from "../types/patient";
const { encodeAddress } = require('@polkadot/util-crypto');


export const GeoblockchainConstants = {
    url: "ws://127.0.0.1:9944",
    contractId: "5DvovmfHwR66iie5pcspqoiRoCYvKRxbz7mb2msTZJvZ76uW",
    aliceId: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    gasLimit: -1,
    getPatient: async (patientId: string, apiPromise: ApiPromise) => {
        let patient = undefined;
        try {
            let apiInstance = apiPromise;
            if (!apiInstance || !apiInstance.isConnected) {
                const ws = new WsProvider(GeoblockchainConstants.url);
                apiInstance = await ApiPromise.create({ provider: ws });
            }

            const contract = new ContractPromise(apiInstance, metadata, GeoblockchainConstants.contractId);
            const { output } = await contract.query.getPatient(patientId, { gasLimit: GeoblockchainConstants.gasLimit });

            if (!apiPromise) {
                await apiInstance.disconnect();
            }

            patient = { ...<Patient>output?.toHuman(), id: patientId };
        } catch (error) {
            console.log(error);
        }

        return patient;
    },
    addPatient: async (patientWithoutId: Omit<Patient, 'id'>) => {
        try {
            let keyring = new Keyring({ type: "sr25519" });
            const keyPair = keyring.addFromUri(mnemonicGenerate(12), { name: patientWithoutId.names }, 'sr25519');

            const ws = new WsProvider(GeoblockchainConstants.url);
            const apiInstance = await ApiPromise.create({ provider: ws });

            const contract = new ContractPromise(apiInstance, metadata, GeoblockchainConstants.contractId);
            await contract.tx["addPatient"]({ gasLimit: GeoblockchainConstants.gasLimit }, [patientWithoutId.names, patientWithoutId.dateOfBirth, patientWithoutId.ssn]).signAndSend(keyPair);
            await apiInstance.disconnect();
            return <Patient>{...patientWithoutId, id: keyPair.address};

        } catch (error) {
            console.log(error);
            return undefined;
        }
    }
};