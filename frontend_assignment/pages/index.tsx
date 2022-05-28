import detectEthereumProvider from '@metamask/detect-provider'
import { Strategy, ZkIdentity } from '@zk-kit/identity'
import { generateMerkleProof, Semaphore } from '@zk-kit/protocols'
import { TextInput, createStyles, Button } from '@mantine/core'
import { Contract, ethers, providers } from 'ethers'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import Greeter from 'artifacts/contracts/Greeters.sol/Greeters.json'
import { Greetings } from './components/Greetings'
const useStyles = createStyles((theme) => ({
  root: {
    position: 'relative',
  },

  input: {
    height: 'auto',
    paddingTop: 18,
    width: 300,
  },

  label: {
    position: 'absolute',
    pointerEvents: 'none',
    fontSize: theme.fontSizes.xs,
    paddingLeft: theme.spacing.sm,
    paddingTop: theme.spacing.sm / 2,
    zIndex: 1,
    fontWeight: 'bold',
  },
  button: {
    position: 'relative',
    width: 300,
    transition: 'background-color 150ms ease',
    margin: 10,
  },
}))

export default function Home() {
  const [logs, setLogs] = useState('Connect your wallet and greet!')
  const [message, setMessage] = useState('')
  const [greetings, setGreetings] = useState<string[]>([])

  useEffect(() => {
    const listener = async () => {
      const contract = new Contract(
        '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
        Greeter.abi,
      )

      const provider = new providers.JsonRpcProvider('http://localhost:8545')

      const contractOwner = contract.connect(provider.getSigner())

      contractOwner.on('NewGreeting', (greeting) => {
        const message = ethers.utils.parseBytes32String(greeting)
        setGreetings((greetings) => [...greetings, message])
      })
    }
    listener()
  }, [])

  async function greet(greeting: string) {
    setLogs('Creating your Semaphore identity...')

    const provider = (await detectEthereumProvider()) as any

    await provider.request({ method: 'eth_requestAccounts' })

    const ethersProvider = new providers.Web3Provider(provider)
    const signer = ethersProvider.getSigner()
    const message = await signer.signMessage(
      'Sign this message to create your identity!',
    )

    const identity = new ZkIdentity(Strategy.MESSAGE, message)
    const identityCommitment = identity.genIdentityCommitment()
    const identityCommitments = await (
      await fetch('./identityCommitments.json')
    ).json()

    const merkleProof = generateMerkleProof(
      20,
      BigInt(0),
      identityCommitments,
      identityCommitment,
    )

    setLogs('Creating your Semaphore proof...')

    const witness = Semaphore.genWitness(
      identity.getTrapdoor(),
      identity.getNullifier(),
      merkleProof,
      merkleProof.root,
      greeting,
    )

    const { proof, publicSignals } = await Semaphore.genProof(
      witness,
      './semaphore.wasm',
      './semaphore_final.zkey',
    )
    const solidityProof = Semaphore.packToSolidityProof(proof)

    const response = await fetch('/api/greet', {
      method: 'POST',
      body: JSON.stringify({
        greeting,
        nullifierHash: publicSignals.nullifierHash,
        solidityProof: solidityProof,
      }),
    })

    if (response.status === 500) {
      const errorMessage = await response.text()

      setLogs(errorMessage)
    } else {
      setLogs('Your anonymous greeting is onchain :)')
    }
  }

  const { classes } = useStyles()

  return (
    <div className={styles.container}>
      <Head>
        <title>Greetings</title>
        <meta
          name="description"
          content="A simple Next.js/Hardhat privacy application with Semaphore."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Greetings</h1>
        <p className={styles.description}>
          A simple Next.js/Hardhat privacy application with Semaphore.
        </p>
        <div className={styles.logs}>{logs}</div>
        <TextInput
          label="Greeting Message"
          placeholder="Hey! Good Morning"
          classNames={classes}
          onChange={(e) => {
            setMessage(e.target.value)
          }}
        />
        <Button
          fullWidth
          className={classes.button}
          onClick={() => {
            greet(message)
          }}
          color={'teal'}
        >
          Greet
        </Button>
        <Greetings title="All Greetings" messages={greetings} />
      </main>
    </div>
  )
}
