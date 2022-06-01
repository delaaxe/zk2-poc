# Argent Account POC on ZK Sync v2

Since Account Abstraction (AA) is not yet available on ZK Sync v2, the goal of this proof of concept (POC) is to deploy a smart contract based account and simulate AA through an `execute()` method called by the `signer`.

The minimal requirements are:
* Only one signer (no guardian) - signature validation at VM level (not in the contract code)
* Execute method with a single call (no multicall)
* Basic proxy pattern (just forwarding calls, no upgrade mechanism)

## Get Started

After cloning the repository, run:

```
yarn
yarn hardhat compile 
```

Copy `.env.exemple` into `.env` and add there:
* `INFURA_KEY`: a valid Infura API key
* `PRIVATE_KEY`: the private key of an account with funds (ETH) on Goerli (at least 0.001 ETH)

Scripts are running on Goerli testnet:
* L1 explorer: https://goerli.etherscan.io
* L2 explorer: https://zksync2-testnet.zkscan.io

## Run Scripts

### Deposit from L1 to L2

```
yarn deposit
```

### Deploy ArgentAccountNoProxy

```
yarn deploy_no_proxy
```

### Deploy ArgentAccount

```
yarn deploy
```


## TO DO

### Features
* Add a guardian with recovery and transaction co-signing logic
* Upgrade mechanism
* Multicalls in execute

### Once AA is available
* Convert the POC using ZKSync AA framework
* Manage signatures (tx_hash, is_valid_signature, ...)