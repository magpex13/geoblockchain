import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
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
        console.log("CONEJO");
        try {
            let apiInstance = apiPromise;
            if (!apiInstance || !apiInstance.isConnected) {
                const ws = new WsProvider(GeoblockchainConstants.url);
                apiInstance = await ApiPromise.create({ provider: ws });
            }
        console.log(apiInstance, apiPromise, patientId);

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
    }
};