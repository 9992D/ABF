import { Resolver } from 'did-resolver'
import ethr, { } from 'ethr-did-resolver'
import ens from 'ens-did-resolver'
import { getResolver as getWebResolver } from 'web-did-resolver'
import { getResolver as getPeerResolver } from 'peer-did-resolver'
import { getResolver as getPlcResolver } from 'plc-did-resolver'
import express from 'express'
import actuator from 'express-actuator'
import dotenv from 'dotenv'
import { ethers } from 'ethers'

dotenv.config()

// import { CeramicClient } from '@ceramicnetwork/http-client'
// import { getResolver as get3IDResolver } from '@ceramicnetwork/3id-did-resolver'
// // This public gateway is currently deprecated. Removing support for did:3 until we can spin up a more stable gateway.
// const ceramic = new CeramicClient('https://gateway.ceramic.network')


const providerConfig = {
  networks: [
    // {
    //   provider: new ethers.JsonRpcProvider(process.env.MAINNET_RPC_URL),
    //   name: 'mainnet',
    // },
    {
      provider: new ethers.JsonRpcProvider(process.env.GANACHE_RPC_URL),
      chainId: 1337,
      name: "unknown",
      registry: '0x45140949d84F25dfb6dFc8659E95A258cc3b6648',
    }
  ],
};

// try to resolve did from 0x45140949d84F25dfb6dFc8659E95A258cc3b6648
const resolver = new Resolver({
  ...ethr.getResolver(providerConfig),
  ...ens.getResolver({
    networks: [
      // { name: 'sepolia', rpcUrl: process.env.SEPOLIA_RPC_URL },
      { rpcUrl: process.env.MAINNET_RPC_URL },
    ],
  }),
  ...getWebResolver(),
  ...getPeerResolver(),
  ...getPlcResolver(),
  // ...get3IDResolver(ceramic)
})

const app = express()

app.use(actuator())

app.get('/1.0/identifiers/*', function (req, res) {
  const url = req.url
  const regex = /\/1.0\/identifiers\/(did:.*)/
  const did = regex.exec(url)[1]

  console.log('Resolving DID: ' + did)

  resolver
    .resolve(did)
    .then((result) => {
      console.log("result: ", result);
      res.send(result)
    })
    .catch((err) => {
      console.log("error: ", err);
      if (err.message.match(/(Unsupported DID method:)|(Invalid DID)|(Not a valid ethr DID:)/)) {
        res.status(400).send(err.message)
      } else {
        console.error(err)
        res.status(500).send(err.message)
      }
    })
})

export default app
