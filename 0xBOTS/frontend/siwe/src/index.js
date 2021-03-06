import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';

const domain = window.location.host;
const origin = window.location.origin;
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const profileElm = document.getElementById('profile');
const noProfileElm = document.getElementById('noProfile');
const welcomeElm = document.getElementById('welcome');
const genJobElm = document.getElementById('genJob');
const simJobElm = document.getElementById('simJob');

const ensLoaderElm = document.getElementById('ensLoader');
const ensContainerElm = document.getElementById('ensContainer');
const ensTableElm = document.getElementById('ensTable');

const ensAddress = "https://api.thegraph.com/subgraphs/name/ensdomains/ens";
const tablePrefix = `<tr><th> </th><th> </th></tr>`;

let address;
let randStr;

const BACKEND_ADDR = require('Config').serverUrl;

async function createSiweMessage(address, statement) {
    const res = await fetch(BACKEND_ADDR + '/nonce', {
        credentials: 'include',
    });
    const nonce = await res.text();

    const message = new SiweMessage({
        domain,
        address,
        statement,
        uri: origin,
        version: '1',
        chainId: '1',
        nonce: nonce
    });
    return message.prepareMessage();
}

function connectWallet() {
    provider.send('eth_requestAccounts', [])
        .catch(() => console.log('user rejected request'));
}

async function getENSMetadata(ensName) {
    const body = JSON.stringify({
        query: `{
    domains(where:{ name: "${ensName}" }) {
        name
        resolver {
            texts
        }
    }
}`
    });

    let res = await fetch(ensAddress, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body
    });

    const wrapper = await res.json();
    const {data} = wrapper;
    const {domains} = data;
    let textKeys = [];
    for (let i = 0, x = domains.length; i < x; i++) {
        let domain = domains[i];
        if (domain.name === ensName) {
            textKeys = domain.resolver.texts;
            break;
        }
    }

    const resolver = await provider.getResolver(ensName);

    let nextProfile = `<tr><td>name:</td><td>${ensName}</td></tr>`;
    for (let i = 0, x = textKeys.length; i < x; i++) {
        nextProfile += `<tr><td>${textKeys[i]}:</td><td>${await resolver.getText(textKeys[i])}</td></tr>`
    }

    return tablePrefix
}

async function signInWithEthereum() {
    profileElm.classList = 'hidden';
    noProfileElm.classList = 'hidden';
    welcomeElm.classList = 'hidden';
    simJobElm.classList = 'hidden';

    address = await signer.getAddress()
    const message = await createSiweMessage(
        address,
        'Thank you for computing with 0xBOTS!'
    );
    const signature = await signer.signMessage(message);

    const res = await fetch(BACKEND_ADDR + '/verify', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, signature }),
        credentials: 'include'
    });


    if (!res.ok) {
        console.error(`Failed in getInformation: ${res.statusText}`);
        return
    }
    let result = await res.text();
    displayENSProfile(result);
}

async function getInformation() {
    const res = await fetch(BACKEND_ADDR + '/personal_information', {
        credentials: 'include',
    });

    if (!res.ok) {
        console.error(`Failed in getInformation: ${res.statusText}`);
        return
    }

    let result = await res.text();

    address = result.split(" ")[result.split(" ").length - 1];
    displayENSProfile();
}

async function genJob() {
    genJobElm.classList = 'hidden';
    var message = document.getElementById('userdata').value;
    const res = await fetch(BACKEND_ADDR + '/write', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
        credentials: 'include',
    });
    if (!res.ok) {
        console.error('??? Failed to generate job ?????????');
        genJobElm.classList = '';
        genJobElm.innerHTML = '??? Failed to generate job ?????????';
    } else {
        let randStr = await res.text();
        console.log('??? Successfully generated job with nonce ' + randStr + ' ?????????');
        genJobElm.classList = '';
        genJobElm.innerHTML = '??? Successfully generated job with nonce ' + randStr + ' ?????????';
    }
}

async function displayENSProfile(arg) {
    const ensName = await provider.lookupAddress(address);

    if (ensName) {
        profileElm.classList = '';

        welcomeElm.innerHTML = `Hello, ${ensName}`;
        let avatar = await provider.getAvatar(ensName);
        if (avatar) {
            welcomeElm.innerHTML += `<br></br> <img type="image" class="avatar" src=${avatar}>`;
        }

        ensLoaderElm.innerHTML = 'Loading ...';
        ensTableElm.innerHTML = await getENSMetadata(ensName);
        ensLoaderElm.innerHTML = '';
        ensContainerElm.classList = '';
    } else {
        welcomeElm.innerHTML = `Hello, ${address}`;
        noProfileElm.classList = '';
    }
    simJobElm.classList = '';
    simJobElm.innerHTML = arg;
    welcomeElm.classList = '';
}

const connectWalletButton = document.getElementById('connectWalletButton');
const genJobButton = document.getElementById('genJobButton');
const siweButton = document.getElementById('siweButton');
const infoButton = document.getElementById('infoButton');
connectWalletButton.onclick = connectWallet;
genJobButton.onclick = genJob;
siweButton.onclick = signInWithEthereum;
infoButton.onclick = getInformation;
