import { createConfig, http } from 'wagmi'
import { abstractTestnet } from 'viem/chains'

// Create wagmi config for Abstract Testnet
export const wagmiConfig = createConfig({
  chains: [abstractTestnet],
  transports: {
    [abstractTestnet.id]: http(),
  },
})

