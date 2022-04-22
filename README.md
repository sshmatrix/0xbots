# 0xbots

IPNS: [0xbots.eth](https://0xbots.eth.link)

**0xBOTS.eth** is an ENS-mediated protocol that enables web2 & web3 frontends to have lightweight compute-enabled distributed backends.

<img src="https://ipfs.io/ipfs/QmRXnJ67VeSqgmBzBcparCow4NTAw3feQy5oeLFaQ8WUG2?filename=0xbotsTrans.png" alt="drawing" width="200"/>

## Idea

<img src="https://ipfs.io/ipfs/QmPAgTjSGvHC18F4rH1RUKWAsGJmviDpSxiSzbVfMXiwMh?filename=ETHGlobalHack.png" alt="drawing" width="720"/>

0xBOTS is a web-wide protocol that enables web3 or web2 frontends requiring CPU or GPU time to move beyond centralised backend compute resources. Current generation of IPFS- and Arweave-enabled dWeb frontends are tied down by backend requirements of servers if they intend to serve any data-oriented HTC or HPC content. 0xBOTS protocol is a security-enabled BOINC distributed-computing infrastructure built to provide decentralised and secure high-throughput computing to web3 (or web2) frontends. The communication and monetisation layers in 0xBOTS are mediated by Ethereum, specifically ENS and SIWE. In this prototype however, the monetisation layer is mediated by Lightning BTC Network to keep this hack Solidity-free and fun (writing a price oracle right now is not a priority). 

### Schematic

<img src="https://ipfs.io/ipfs/QmWTPTC5y8So4qiEpqESLV6EWop7atpvhB1pP31ubX7ygL?filename=Schematic.png" alt="drawing" width="720"/>

Imagine this...

Supply side: One entity identified by [0xBOTS.eth](https://0xbots.eth.limo/) has compute resources in form of CPU or GPU idle time on a number of big and small devices ranging from servers to smartphones. 0xBOTS.eth is able to manage the compute resources on its devices using a BOINC (Berkeley Open Infrastructure for Network Computing) build residing on its centralised server. 0xBOTS.eth arranges the architecture in a way that [0xBOTS.eth.limo](https://0xbots.eth.limo/) resolves to the frontend of the BOINC server. Moreover, subdomains `*.0xBOTS.eth` map to as many devices as managed by the BOINC server. This mapping has no strict architecture and it is optimisable as a function of types of managed devices. [0xBOTS.eth.limo](https://0xbots.eth.limo/) now searches on the web for opportunity to compute, hopefully in return for some cheap $ETH on L2 💎, or in this case, $BTC on Lightning Network ⚡️[🤣]. 

Demand side: A website.xyz (web2 or web3) requires resources in form of compute time. It broadcasts a request for computation via the .well-known URI or equivalent located at `https://website.xyz/.well-known/`. In the broadcast JSON, metadata provides,
a) the URI of the code to execute, 
b) arguments required by the code, 
c) website.xyz's backend URI `website.xyz/` for `POST`, `GET` requests (`website.xyz/nonce`, for example),
d) a random key string `STR` to associate to the request, and 
e) a flag (not a necessity but helpful for state verification).


Interaction: The supply and demand side meet when [0xBOTS.eth.limo](https://0xbots.eth.limo/) finds a request to compute on `.well-known` URI of website.xyz during its routine search for work. Once the request is confirmed to be active via the flag, [0xBOTS.eth.limo](https://0xbots.eth.limo/) grabs a nonce from `website.xyz/nonce` with a `GET` request and sends a **signed** `POST` request to `website.xyz/` along with a) the random key string `STR` identifying the compute request, and b) URI where website.xyz can retrieve the computed output. In the prototype, we will showcase this communication using manual SIWE workflow in Metamask. This framework establishes the required communication layer necessary for the protocol. Needless to say, two additional layers - security layer and payment layer - will be implemented on top to ensure the validity of the computed output and settling payments respectively. In this prototype, we will use 'integration checks' [1] for security and BTC Lightning Network for broadcasting and receiving payments via the LNURL-(w/a/p/c) infrastructure (to piss off maxis on either side 🤓). In the final protocol, settling on Ethereum L2s via a price oracle is probably the ideal solution. 

[1] Integration Check: It refers to validating the computation by pre- or post-computing a small random subset of the computation to match against the incoming results from the computation provider 0xBOTS.eth

Used technologies: IPFS/IPNS, BOINC, SIWE, ENS, Metamask, LN-BTC.
