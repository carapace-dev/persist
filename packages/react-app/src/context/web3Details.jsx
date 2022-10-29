import { useState, createContext, useEffect, useCallback } from "react";
import { useContractLoader, useUserProviderAndSigner } from "eth-hooks";
//import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import { NETWORKS } from "../constants";
import externalContracts from "../contracts/external_contracts";
import deployedContracts from "../contracts/hardhat_contracts.json";
import { Transactor, Web3ModalSetup } from "../helpers";
import { useStaticJsonRPC } from "../hooks";
import { message } from 'antd';

const { ethers } = require("ethers");
const Web3Context = createContext();
const defaultTargetNetwork = NETWORKS.goerli;

const web3Modal = Web3ModalSetup();

const providers = [
    //  "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
      `https://eth-mainnet.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_KEY}`,
    //  "https://rpc.scaffoldeth.io:48544",
    ];

const Web3ContextProvider = (props) => {
  
    const networkOptions = ["goerli"];
    const [injectedProvider, setInjectedProvider] = useState();
    const [address, setAddress] = useState();
    const [refresh, setRefresh] = useState(false);
    const selectedNetworkOption = networkOptions.includes(defaultTargetNetwork.name)
      ? defaultTargetNetwork.name
      : networkOptions[0];
    const [selectedNetwork, setSelecNetwork] = useState(selectedNetworkOption);
    //console.log("web3Details.selectedNetwork", selectedNetwork);
    const targetNetwork = NETWORKS[selectedNetwork];
    //console.log("web3Details.targetNetwork", targetNetwork);
    const localProvider = useStaticJsonRPC([
        process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : targetNetwork.rpcUrl,
      ]);
    //console.log("web3Details.localProvider", localProvider);

    const mainnetProvider = useStaticJsonRPC(providers);

    const setSelectedNetwork = (value) => {
      setSelecNetwork(value);
    };

    const logoutOfWeb3Modal = async () => {
      await web3Modal.clearCachedProvider();
      if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
        console.log("Trying to disconnect");
        await injectedProvider.provider.disconnect();
        console.log("Disconnected");
      }
      setTimeout(() => {
        // window.location.reload();
        window.location.href = "/"
      }, 1);
    };

    //const price = useExchangeEthPrice(targetNetwork, mainnetProvider);
    const price = 0;
    let gasPrice;

    //const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider); 
    const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, ''); 
    const signer = userProviderAndSigner.signer;
    // console.log("web3details.userProviderAndSigner", userProviderAndSigner)
    // console.log("web3details.signer", signer);

    const activateRefresh = (bool) => {
      setRefresh(bool);
    };

    useEffect(() => {
      async function getAddress() {
        if (signer) {
          const newAddress = await signer.getAddress();
          setAddress(newAddress);
        }
      }
      getAddress();
    }, [signer]);

    const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
    const selectedChainId =
      signer && signer.provider && signer.provider._network && signer.provider._network.chainId;

    const tx = Transactor(signer, gasPrice);

    const contractConfig = { deployedContracts: deployedContracts || {}, externalContracts: externalContracts || {} };

    const readContracts = useContractLoader(localProvider, contractConfig);
  
    // console.log("web3Details.localChainId", localChainId);
    // console.log("web3Details.selectedChainId", selectedChainId);
    // useEffect(() => {
    //   if(localChainId !== selectedChainId){
    //     message.warning("Attention: Selected Dapp Network is different from provider network!");
    //   }
    // }, [localChainId, selectedChainId]);
    const writeContracts = useContractLoader(signer, contractConfig, selectedChainId); // changed localChainId for selectedChainId
    // console.log("web3Details.writeContracts", writeContracts);

    const loadWeb3Modal = useCallback(async () => {
        const provider = await web3Modal.connect();
        setInjectedProvider(new ethers.providers.Web3Provider(provider));
    
        provider.on("chainChanged", chainId => {
          setInjectedProvider(new ethers.providers.Web3Provider(provider));
        });
    
        provider.on("accountsChanged", () => {
          setInjectedProvider(new ethers.providers.Web3Provider(provider));
        });
    
        // Subscribe to session disconnection
        provider.on("disconnect", (code, reason) => {
          logoutOfWeb3Modal();
        });
      }, [setInjectedProvider]);
    
      useEffect(() => {
        if (web3Modal.cachedProvider) {
          loadWeb3Modal();
        }
      }, [loadWeb3Modal]);

  return (
    <Web3Context.Provider value={{ 
        mainnetProvider,
        selectedChainId,
        address,
        tx,
        readContracts,
        writeContracts,
        signer,
        price,
        localChainId,
        targetNetwork,
        logoutOfWeb3Modal,
        networkOptions,
        selectedNetwork,
        setSelectedNetwork,
        localProvider,
        loadWeb3Modal,
        web3Modal,
        contractConfig,
        refresh,
        activateRefresh,
        injectedProvider
        }}>
      {props.children}
    </Web3Context.Provider>
  );
};
export { Web3Context, Web3ContextProvider };