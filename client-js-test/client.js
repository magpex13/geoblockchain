const { WsProvider, ApiPromise, Keyring } = require('@polkadot/api');
const { ContractPromise } = require('@polkadot/api-contract');
const wsUrl = 'ws://localhost:9944';

//make sure this is the correct address for //Alice.
//for now, on the command line, do:
//
//   substrate-contracts-node key inspect //Alice
//
//you should see the address:
//
//  Public key (SS58): 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
//  SS58 Address:      5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
//
const aliceAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';


//make sure this path is correct for YOUR project.
const metadataPath = '../contract/health-record/target/ink/metadata.json';

//convert the metadata file constants into local variable
const metadata = require(metadataPath);

//make sure this address is correct for YOUR uploaded/instantiated contract.
const contractAddress = '5D5MfMTWRfCsEb95pa4Hx6x8FbkWghZQFCNys3ykQ7qXWb6t';

(async () => {
    //connect to our local substrate node
    const ws = new WsProvider(wsUrl);

    const wsApi = await ApiPromise.create({ provider: ws });
    const contract = new ContractPromise(wsApi, metadata, contractAddress);

    // console.log(contract);
    // console.log('query:\n', contract.query);
    // console.log('tx:\n', contract.tx);

    const gasLimit = -1;
    const storageDepositLimit = null;

    const conejo = await contract.tx.flip(aliceAddress, { gasLimit, storageDepositLimit });
    const healthRecord = conejo.output?.toHuman();
    console.log(healthRecord.description);
    // console.log(healthRecord[patientId]);

    // console.log(contract.registry.findMetaError(conejo.result.asErr.asModule));
    // console.log(conejo?.result.toHuman());
    // console.log(conejo?.output?.toHuman());

    // console.log('result:', result.toHuman());
    // console.log('out:', output != undefined ? output.toHuman() : null);

    wsApi.disconnect();
})();