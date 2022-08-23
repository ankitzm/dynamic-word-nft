import React, { useEffect, useState } from "react";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import {ethers} from "ethers"
import myEpicNFT from './utils/MyEpicNFT.json';
import Loader from "./assets/loader.gif"

// Constants
const TWITTER_HANDLE = 'ankitzm';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/wordnft-wv4ir0y1cw';

const CONTRACT_ADDRESS = "0x9ab069E3676297275b483479aB94d864c73E7148"

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  
  const checkIfWalletIsConnected = async () => {
    const {ethereum} = window;

    if(!ethereum) {
      console.log("Probably you don't have Metamask wallet")
    } else {
      console.log("We have a etheruem object", ethereum);
    }

    // Check if wallet is authorized
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    // grab first account if  multiple account present
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  }

  // Connect wallet code
   const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4"; 
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
      }
      
      // Request access to account.
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      // Print public address
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 

      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener();
      
    } catch (error) {
      console.log(error);
    }
  }

  // Setup our listener.
    const setupEventListener = async () => {
        // Most of this looks the same as our function askContractToMintNft
        try {
            const { ethereum } = window;

          if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNFT.abi, signer);

                // THIS IS THE MAGIC SAUCE.
                // This will essentially "capture" our event when our contract throws it.
                // If you're familiar with webhooks, it's very similar to that!
                connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
                  console.log(from, tokenId.toNumber())
                  document.getElementById("opensea-link").innerHTML = `Checkout your NFT on <a href="https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}" target="_blank"> OpenSea 
 </a> 🌊 `
        });
            
            console.log("Setup event listener!");
            
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        }
    };
  
  // Render Methods
  const renderNotConnectedContainer = () => (
    <button className="cta-button connect-wallet-button" onClick={connectWallet}>
      Connect to Wallet
    </button>
  );

  // Runs the function once page loads
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  // Minting function
  const askContractToMintNFT = async() => {
      try {
      const { ethereum } = window;

      if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNFT.abi, signer);

          console.log("Going to pop wallet now to pay gas...")
          let nftTxn = await connectedContract.makeEpicNFT();
        
          const dataElement = document.getElementById("data");
          dataElement.style.display = "flex";
        
          console.log("Mining...please wait.")
          await nftTxn.wait();

        dataElement.innerHTML = `You got a NFT 😎  !! 
                                <br></br><br></br>
                                Your Transaction Hash 👇 
                                <a href="https://rinkeby.etherscan.io/tx/${nftTxn.hash}" target="_blank">${nftTxn.hash} 🤙</a>`
      
        // alert(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
          console.log(error)
      }
  }

  useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">〣 Word NFT </p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? 
            renderNotConnectedContainer()
           : <button onClick={askContractToMintNFT} className="cta-button connect-wallet-button">
              Mint NFT
            </button>
          }
          <a href={OPENSEA_LINK} target="_blank">
          <button className="cta-button view-collection">
              Veiw Collection
            </button>
          </a>
        </div>
        <div id="data">
          Mining ...
          <img alt="loader" className="loader" src={Loader} />
        </div>
        <div id="opensea-link"> </div>
        <div className="footer-container">
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`Built by  @${TWITTER_HANDLE}`}</a>
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <br />
        </div>
      </div>
    </div>
  );
};

export default App;