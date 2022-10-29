import "antd/dist/antd.css";
import React, { useContext, useEffect, useState } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { Alert } from 'antd';
import "./App.css";
import { ThemeSwitch, Header, NetworkSwitch, CreateSteps, MySmartVaults, TrustedSmartVaults, ReceiveAssets, Contract, Home, DigitalSafe } from "./components";
import { Web3Context } from "./context/web3Details";
import { NETWORK } from "./constants";


const NETWORKCHECK = true;

function App(props) {

  const { 
    selectedChainId,
    address,
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
    contractConfig
    } 
    = useContext(Web3Context);

  const [banner, setBanner] = useState(true);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setBanner(false);
  //   }, 30000);
  
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <div className="App">
      {/* <NetworkDisplay
        NETWORKCHECK={NETWORKCHECK}
        localChainId={localChainId}
        selectedChainId={selectedChainId}
        targetNetwork={targetNetwork}
        logoutOfWeb3Modal={logoutOfWeb3Modal}
      /> */}
    {/* <div style={{ position: "fixed", top: 0, width: "100%", zIndex: 10}}> */}
      <Header 
        address={address}
        networkOptions={networkOptions}
        selectedNetwork={selectedNetwork}
        setSelectedNetwork={setSelectedNetwork}
        localProvider={localProvider}
        signer={signer}
        price={price}
        web3Modal={web3Modal}
        loadWeb3Modal={loadWeb3Modal}
        logoutOfWeb3Modal={logoutOfWeb3Modal}
        blockExplorer={''}
        localChainId={localChainId}
        selectedChainId={selectedChainId}
        targetNetwork={targetNetwork}
      />
    {/* </div> */}

    <div className="body-content">
      <Switch>
        <Route exact path="/" >
          {/* <Home 
            address={address}
            loadWeb3Modal={loadWeb3Modal}
          /> */}
          {address 
          ? <Redirect to="/digitalsafe" />
          : <Home loadWeb3Modal={loadWeb3Modal} />}
        </Route>
        <Route path="/digitalsafe" >
          <DigitalSafe />
        </Route>
      </Switch>
    </div>
      <ThemeSwitch />
    </div>
  );
}

export default App;
