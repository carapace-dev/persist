import React from "react";
import { NETWORK } from "../constants";
import { Alert, Button } from "antd";

function NetworkDisplay({ NETWORKCHECK, localChainId, selectedChainId, targetNetwork, setSelectedNetwork }) {
  let networkDisplay = "";
  if (NETWORKCHECK && localChainId && selectedChainId && localChainId !== selectedChainId) {
    const networkSelected = NETWORK(selectedChainId);
    const networkLocal = NETWORK(localChainId);
    networkDisplay = (
      <div style={{ zIndex: 2, position: "absolute", top: 50, padding: 16 }}>
        <Alert
          message={<>Your wallet is connected on <b>{networkSelected && networkSelected.name}</b> </>}
          description={
            <div style={{marginTop:10}}>
              Change to {" "}
              <Button
                type="primary"
                ghost
                onClick={async () => {
                  const ethereum = window.ethereum;
                  const data = [
                    {
                      chainId: "0x" + targetNetwork.chainId.toString(16),
                      chainName: targetNetwork.name,
                      nativeCurrency: targetNetwork.nativeCurrency,
                      rpcUrls: [targetNetwork.rpcUrl],
                      blockExplorerUrls: [targetNetwork.blockExplorer],
                    },
                  ];
                  let switchTx;
                  // https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
                  try {
                    switchTx = await ethereum.request({
                      method: "wallet_switchEthereumChain",
                      params: [{ chainId: data[0].chainId }],
                    });
                  } catch (switchError) {
                    // not checking specific error code, because maybe we're not using MetaMask
                    try {
                      switchTx = await ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: data,
                      });
                    } catch (addError) {
                      // handle "add" error
                    }
                  }
                  if (switchTx) {
                    console.log(switchTx);
                  }
                }}
              >
                <b>{networkLocal && networkLocal.name}</b>
              </Button>
              {'  ' + 'or stay on'} <Button onClick={() => setSelectedNetwork(networkSelected.name) }>{networkSelected.name}</Button>
            </div>
          }
          type="warning"
          showIcon
          closable={false}
        />
      </div>
    );
  } 
  // else {
  //   networkDisplay = (
  //     <div style={{ zIndex: -1, position: "absolute", right: 154, top: 28, padding: 16, color: targetNetwork.color }}>
  //       {targetNetwork.name}
  //     </div>
  //   );
  // }

  return networkDisplay;
}

export default NetworkDisplay;
