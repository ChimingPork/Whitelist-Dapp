import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useState, useRef } from"react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants"

export default function Home() {
  // State
  const [walletConnected, setWalletConnected] = useState(false) // Is user's wallet connected true or false
  const [joinedWhitelist, setJoinedWhitelist] = useState(false); // Does this wallet address have whitelist true or false
  const [loading, setLoading] = useState(false); // Are we waiting for a transaction to mine true or false
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0) // Counter for total # of addresses whitelisted
  const web3ModalRef = useRef(); //Reference to the Web3Modal used for connecting to metamask. Persists while page is open.


  //Actions
  // @param {*} needSigner - True if you need the signer, default false otherwise
  const getProviderOrSigner = async (needSigner = false) => {
    //Connect to Metamask
    const provider = await web3ModalRef.current.connect(); //web3Modal is a reference, access the current value and underlying object
    const web3Provider = new providers.Web3Provider(provider); 

    //Let user know if they aren't connected to Goerli
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the netowrk to Goerli");
      throw new Error("Change network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  //Add current address to whitelist
  const addAddressToWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true); // need to get a signer since it's a write transaction
      
      //Create a new instance of contract with Signer. Allows method updates
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );

      const tx = await whitelistContract.addAddressToWhitelist(); //Call addAddressToWhitelist from the contract
      setLoading(true); //Set loading while we wait for mining
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    } catch (err) {
      console.error(err);
    }
};

  //Get # of whitelisted addresses
  const getNumberOfWhitelisted = async () => {
    try {
      const provider = await getProviderOrSigner(); // Get provider form web3Modal. Reading from state so no signer needed
      //Connecto to the contract using provider so will have read-only access
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );
      // Call the numAddressesWhitelisted function from contract
      const _numberofWhitelisted =
        await whitelistContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numberofWhitelisted);
    } catch (err) {
      console.error(err);
    }
  };

  //Check if address is in list of Whitelist Addresses
  const checkIfAddressInWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true); // will need signer later to get user address
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const address = await signer.getAddress(); //get address of signer connected to MetaMask
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(address); //Call whitelisted addresses form contract
      setJoinedWhitelist(_joinedWhitelist);
  } catch (err) {
    console.error(err);
  }
};

  const connectWallet = async () => {
    try {
      await getProviderOrSigner(); // Get the provider from web3Modal (MetaMask)
      setWalletConnected(true);

      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch (err) {
      console.error(err);
    }
  };

//Render
//Return a button based on the state of the dapp
const renderButton = () => {
  if (walletConnected) {
    if (joinedWhitelist) {
      return (
        <div className={styles.description}>
          Thanks for joining the Whitelist!
        </div>
      );
    } else if (loading) {
      return <button className={styles.button}>Loading...</button>
    } else {
      return (
        <button onClick={addAddressToWhitelist} className={styles.button}>
          Join The Whitelist
        </button>
      );
    }
  } else {
    return (
      <button onClick={connectWallet} className={styles.button}>
        Connect your wallet
      </button>
    );
  }
};

//Effects (used to change the states of the website)
useEffect(() => {
  //If no walletConnected, create a new instance of web3modal
  if (!walletConnected) {
    web3ModalRef.current = new Web3Modal({
      network: "goerli",
      providerOptions: {},
      disableInjectedProvider: false,
    });
  }
}, [walletConnected]);


  //Return DOM
  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            It's an NFT collection for developers in Crypto
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  )
}