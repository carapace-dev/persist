import React, { useEffect, useState, useContext, useRef } from "react";
import { WebBundlr } from "@bundlr-network/client";
import LitJsSdk from "@lit-protocol/sdk-browser";
import { Avatar, Skeleton, Col, Row, Typography, Empty, Card, Button, Input, List, Progress, Modal } from "antd";
import { DigitalSafeCard, AdditionalInfo } from ".";
import emptyWallet from '../emptyWallet.png';
import { utils } from 'ethers';
import { Web3Context } from "../context/web3Details";
import { ScreenSize } from "../context/screenSize";
import BigNumber from 'bignumber.js';
import prettyBytes from 'pretty-bytes';
import { NETWORK } from "../constants";
import { LockOutlined, UploadOutlined, SyncOutlined, LinkOutlined, FileAddOutlined, WalletOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

export default function Persist() {

  const { selectedNetwork, injectedProvider, address, tx, readContracts, writeContracts, selectedChainId } = useContext(Web3Context);
  const { windowSize } = useContext(ScreenSize);

  const [bundlrInstance, setBundlrInstance] = useState();
  const bundlrRef = useRef();
  const [balance, setBalance] = useState(0);
  const [currentAddress, setCurrentAddress] = useState('');
  const [currentNetwork, setCurrentNetwork] = useState('');
  const [file, setFile] = useState();
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(null);
  const [fetchNFT, setFetchNFT] = useState(false);
  const [reScanNFT, setReScanNFT] = useState(false);
  const [digitalSafes, setDigitalSafes] = useState([]);
  const [downloadImageUri, setDownloadImageUri] = useState();
  const [downloadTextUri, setDownloadTextUri] = useState();
  const [downloadVideoUri, setDownloadVideoUri] = useState();
  const [percentComplete, setPercentComplete] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadingStep, setUploadingStep] = useState('');
  const [fileDescription, setFileDescription] = useState('');
  const [fundingAmount, setFundingAmount] = useState('');
  const [fundsNeeded, setFundsNeeded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Connection to the Lit Network
    const initialiseLit = async () => {
    const client = new LitJsSdk.LitNodeClient();
    await client.connect();
    window.litNodeClient = client;
    // Listening for the lit-ready event
    // document.addEventListener(
    //   "lit-ready",
    //   function (e) {
    //     console.log("LIT network is ready");
    //   },
    //   false
    // );
    };
    initialiseLit();
  }, []);

  useEffect(() => {
    if (address !== currentAddress || selectedChainId !== currentNetwork){
      setFetchNFT(false);
    }
  },[address, selectedChainId]);

  useEffect(() => {
      const getDigitalSafes = async () => {
        const digitalSafesFetched = [];
        const response = await tx(readContracts.CarapacePersist.getUploadsOfOwner(address));
        const uploadsOfOwner = response.map(item => item.toNumber());

        for (const tokenId of uploadsOfOwner) {
          const tokenURI = await tx(readContracts.CarapacePersist.tokenURI(tokenId));
          const base64String = tokenURI.toString().replace("data:application/json;base64,","");
          const {name, image, description } = JSON.parse(Buffer.from(base64String, 'base64').toString());
          const uploadInfo = await tx(readContracts.CarapacePersist.getUploadInfo(tokenId));

          digitalSafesFetched.push({ 
            address: readContracts.CarapacePersist.address,  
            tokenId,
            name, 
            image,
            fileURL: uploadInfo[0],
            description: uploadInfo[1] == '' ? 'Description unavailable' : uploadInfo[1],
          });
        }
        setDigitalSafes(digitalSafesFetched.sort((a, b) => a.tokenId - b.tokenId));
        setReScanNFT(false);
      }

      if (!fetchNFT && address && selectedChainId && Object.entries(readContracts).length !== 0 ){
        setCurrentAddress(address);
        setCurrentNetwork(selectedChainId);
        setReScanNFT(true);
        setFetchNFT(true);

      getDigitalSafes();
      }
  },[fetchNFT, address, selectedChainId, readContracts]);

  const cleanImage = () => {
    setDownloadImageUri('');
    setDownloadTextUri('');
    setDownloadVideoUri('');
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setFileName(file.name);
      const fileReader = new FileReader();
      fileReader.onload = async (e) => { 
        const dataURL = e.target.result;
        setFile(dataURL);
        setFileSize(`(${prettyBytes(dataURL.length)})`);
      }
      fileReader.readAsDataURL(file);
    }
  };

  const hideModal = () => {
    setFundsNeeded(false);
  };

  const tokenIdLink = ({tokenId, address}) => {
    return (
      <>
        <Text type='secondary' style={{marginRight: 5}}># {tokenId}</Text>
        <Text>
          <a href={`${NETWORK(selectedChainId).blockExplorer}token/${address}?a=${tokenId}`} target="_blank">
            <LinkOutlined key="setting" />
          </a>
        </Text>
      </>
    )
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: document.getElementById("nfts").offsetTop - 40,
      behavior:"smooth"
    });
  };

  const parseInput = (input) => {
    const conv = new BigNumber(input).multipliedBy(bundlrRef.current.currencyConfig.base[1])
    console.log("Parse input:", conv);
    if (conv.isLessThan(1)) {
      console.log('error: value too small')
      return
    } else {
      return conv
    }
  };

  const fundWallet = async () => {
    if (!fundingAmount) return;
    const amountParsed = parseInput(fundingAmount)
    let response = await bundlrRef.current.fund(amountParsed);
    fetchBalance();
  };

  // Connection to the Bundlr Network
  const initialiseBundlr = async () => {
    const bundlr = new WebBundlr(
      "https://devnet.bundlr.network", 
      "ethereum", 
      injectedProvider, 
      { providerUrl: "https://goerli.infura.io/v3/f2b4d03fa375429e9e33da943053cb38" }
    );
    try {
      await bundlr.ready();
      setBundlrInstance(bundlr);
      bundlrRef.current = bundlr;
      // Lazy funding
      const price = await bundlr.getPrice(file.length);
      console.log("Upload Price:", price);
      const bundlrBalance = await bundlr.getLoadedBalance();
      console.log("Bundlr balance:", bundlrBalance);
      // check if balance is enough for the upload
      if (bundlrBalance.isLessThan(price)) {
        const neededToFund = Math.ceil(price.minus(bundlrBalance).multipliedBy(1.1));
        console.log("Bundlr balance not enough, need to fund:", neededToFund);
        refreshDigitalSafes();
        setFundsNeeded(true);
        return;
        //await bundlr.fund(neededToFund);
      }

      setPercentComplete(20);
      setUploadingStep('Minting NFT...');
      await mint();
    } catch(error) {
      console.error("Error Initializing Bundlr: ", error);
      refreshDigitalSafes();
    }
  };

  const fetchBalance = async () => {
    const bal = await bundlrRef.current.getLoadedBalance();
    console.log('bal: ', utils.formatEther(bal.toString()));
    setBalance(utils.formatEther(bal.toString()));
  };

  const mint = async () => {

      const result = await tx(writeContracts.CarapacePersist.createUpload( {
        value: 100000000000000,
        gasLimit: 1000000
      }));
      
      if (!!result) {
        const txReceipt = await result.wait();
        txReceipt.events.forEach(item => {
          if (item.event === "Transfer") {
            setPercentComplete(40);
            setUploadingStep('Sign transaction...');
            litEncryptAndUpload(item.args.tokenId.toString());
          }
        });
      }
     else {
      console.error("Error Minting NFT ");
      refreshDigitalSafes();
    }
  };

  const updateNFT = async (tokenId, uploadURL, description) => {
    const args = [ tokenId, uploadURL, description ];
    const result = await tx(writeContracts.CarapacePersist.updateUpload( ...args));
     if(!!result) {
      setPercentComplete(100);
      setUploadingStep(' 🔐 The Digital Safe is minted! 🎉 ');
     } else {
      console.error("Error Updating NFT: ", error);
      refreshDigitalSafes();
    }
  }

  const litEncryptAndUpload = async (tokenId) => {
    const chain = selectedNetwork;
    if(file){
      try {
        const authSig = await LitJsSdk.checkAndSignAuthMessage({chain})
        const fileInBase64 = Buffer.from(file).toString('base64');
        const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(fileInBase64);
        const accessControlConditions = [
          {
            // contract ERC721 Carapace Smart Vault
            contractAddress: readContracts.CarapacePersist.address,
            standardContractType: 'ERC721',
            chain,
            method: 'ownerOf',
            parameters: [ tokenId ],
            returnValueTest: {
              comparator: '=',
              value: ':userAddress'
            }
          }
        ];
        const _encryptedSymmetricKey = await litNodeClient.saveEncryptionKey({
          accessControlConditions,
          symmetricKey,
          authSig,
          chain,
        });
        const encryptedStringInDataURI = await blobToDataURI(encryptedString);
        setPercentComplete(60);
        setUploadingStep('Encrypting file...');
        const arweaveURI = await uploadFileToArweave(
          encryptedStringInDataURI, 
          LitJsSdk.uint8arrayToString(_encryptedSymmetricKey, "base16"),
          accessControlConditions
          );
        setPercentComplete(80);
        setUploadingStep('Updating NFT metadata...');
        await updateNFT(tokenId, arweaveURI, fileDescription);
      } catch(error) {
        console.error("Error Encrypting and Uploading File to Arweave: ", error);
        refreshDigitalSafes();
      }
    } else {
      console.log("File needed");
    }
  };

  const uploadFileToArweave = async (encryptedData, encryptedSymmetricKey, accessControlConditions ) => {
    if(bundlrRef.current){
      
      const packagedData = {
        encryptedData,
        encryptedSymmetricKey,
        accessControlConditions,
      };
      console.log("Package Data to Upload:", packagedData);

      const packagedDataInString = JSON.stringify(packagedData);

      // upload to bundlr as Lit docs
      const tx = bundlrRef.current.createTransaction(packagedDataInString);
      const transactionId = tx.id;
      await tx.sign();
      const result = await tx.upload();
      const arweaveURI = `http://arweave.net/${tx.id}`;
      return arweaveURI;
    } else {
      console.log("Need to initialize Bundlr!");
    }
  };
  //
  // (Helper) Turn blob data to data URI
  // @param { Blob } blob
  // @return { Promise<String> } blob data in data URI
  //
  const blobToDataURI = (blob) => {
    return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.onload = (e) => {
        var data = e.target.result;
        resolve(data);
        };
        reader.readAsDataURL(blob);
    });
  };
  //
  // (Helper) Convert data URI to blob
  // @param { String } dataURI
  // @return { Blob } blob object
  //
  const dataURItoBlob = (dataURI) => {    
    var byteString = window.atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    var blob = new Blob([ab], {type: mimeString});
    return blob;
  };

  const uploadFile = async () => {
    setUploading(true);
    setUploadingStep('Initializing Bundlr...');
    await initialiseBundlr();

  };

  const downloadFile = async (tokenId) => {
    const uploadInfo = await tx(readContracts.CarapacePersist.getUploadInfo(tokenId));
    const data = await fetch(uploadInfo[0]);
    const dataOnArweave = JSON.parse(await data.text());
    // The 4 information we need: Chain + authSig + encrypted Symmetric Key + access control conditions 
    const authSig = await LitJsSdk.checkAndSignAuthMessage({chain: selectedNetwork});
    const accessControlConditions = dataOnArweave.accessControlConditions;
    const _encryptedSymmetricKey = dataOnArweave.encryptedSymmetricKey;

    // get the original symmetric key
    const symmetricKey = await litNodeClient.getEncryptionKey({
      accessControlConditions,
      toDecrypt: _encryptedSymmetricKey,
      chain: selectedNetwork,
      authSig,
    });
    const decryptString = await LitJsSdk.decryptString(
      dataURItoBlob(dataOnArweave.encryptedData),
      symmetricKey
    );
    const originalFormat = Buffer.from(decryptString, 'base64').toString('ascii');

    if (originalFormat.includes("data:image")) {
      setDownloadImageUri(originalFormat);
    } else if (originalFormat.includes("data:text")) {
      setDownloadTextUri(originalFormat);
    } else if (originalFormat.includes("data:video")) {
      setDownloadVideoUri(originalFormat);
    } else {
      console.error("Unsupported file type")
    };
  };

  const refreshDigitalSafes = () => {
    setFetchNFT(false);
    setUploading(false);
    setPercentComplete(0);
    setFileName('');
    setFileSize('');
    setFileDescription('');
  };

  return ( 
    <div className={windowSize?.mainContainer}>
      <div className="ant-div-carapace">
        <div className="div-header">
          <Modal
            title={"Bundlr Wallet -> Arweave"}
            centered
            visible={fundsNeeded}
            width={600}
            footer={null}
            closable
            maskClosable
            onCancel={hideModal}
          >
            <p>Please add funds to your Bundlr wallet to allow uploading files to Arweave. </p>
            <p>Current balance: {balance} ETH</p>
            <br/>
            <Input.Group compact>
              <Input
                style={{ width: 200 }}
                value={fundingAmount}
                placeholder="Insert amount to fund"
                maxLength={40}
                onChange={(e) => setFundingAmount(e.target.value)}
              />
              <Button 
                type="primary" 
                //disabled={!fundingAmount} 
                icon={<WalletOutlined />}
                onClick={fundWallet} 
              >
                Fund Wallet
              </Button>
            </Input.Group>
            <br/>
          </Modal>
          <Row >
            <h2>Create Digital Safe</h2>
            <AdditionalInfo info={
              <>
                <p>Upload files: text, images, videos</p>
              </>
            }/>
          </Row>
          <Row>
            <Col>
              <Avatar size='large' shape='square' icon={<LockOutlined/>} style={{marginTop: 3}}  />
            </Col>
            <Col>
              <Row>
                <Text style={{marginLeft: 20, marginTop:10}} type='secondary'>Safeguard your secrets forever</Text>
              </Row>
            </Col>            
          </Row>
          <Row>
            <Input hidden id='actual-btn' type="file" accept=".txt, image/*, video/*" onChange={onFileChange}/>
          </Row>
          <Row style={{marginTop: 30, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <div >
                {/* <label for="actual-btn"><Text style={{fontSize: '20px', color: '#08E8DE' }}>Select file</Text><FileAddOutlined style={{ marginLeft: 10, fontSize: '40px', color: '#08E8DE' }} /></label> */}
                <label for="actual-btn"><Text style={{fontSize: '20px' }}>Select file</Text><FileAddOutlined style={{ marginLeft: 10, fontSize: '35px' }} /></label>
                { file && <Text style={{marginLeft: 10, marginTop:5}} type="secondary">{fileName}</Text>}
                { file && <Text style={{marginLeft: 10, marginTop:5}} type="secondary">{fileSize}</Text>}
              </div>
          </Row>
           
          <Row style={{marginTop: 30, marginBottom:10, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            { uploading
              ? <div style={{marginTop: 0, marginLeft: 20}}>
                  <Progress  percent={percentComplete} type='circle' width={60} />
                  <Text style={{marginTop: 0, marginLeft: 20}} > {uploadingStep} </Text>
                  { percentComplete < 100
                    ? <Button style={{marginLeft: 5}} loading type='text' shape='circle' />
                    : <Button 
                        style={{marginLeft: 20}} 
                        type="primary" 
                        onClick={refreshDigitalSafes} 
                        icon={<SyncOutlined/>}
                      >
                        See the new look
                      </Button>
                  }
                </div>
              : <Input.Group compact>
                  <Input
                    style={{ width: 'calc(100% - 600px)' }}
                    value={fileDescription}
                    placeholder="Insert a description"
                    maxLength={40}
                    showCount
                    onChange={(e) => setFileDescription(e.target.value)}
                  />
                  <Button 
                    type="primary" 
                    disabled={!file} 
                    icon={<UploadOutlined />}
                    onClick={uploadFile} 
                  >
                    Upload file
                  </Button>
                </Input.Group>
            }
          </Row>
        </div>
      </div>
      <br/>
      <div id="nfts"/>      
        <div  className="ant-div-carapace" style={{marginTop:30}}>
          <div className="div-header">
            <Row style={{display: "flex", justifyContent: "space-between"}}>
              <h2>My Digital Safes<AdditionalInfo info={
                <>
                  <p>Select your NFTs to be protected. The NFTs will NOT be locked, so you can always use them normally.</p>
                  <p>At least one token or NFT must be selected. Disabled assets are already safeguarded in one of your vaults.</p>
                </>
                }/>
              </h2>
              <Button onClick={() => setFetchNFT(false)} loading={reScanNFT} icon={<SyncOutlined/>} />
            </Row>
            <Row>
              <Text type='secondary'>Unlock the NFT to see the digital content</Text>
            </Row>
          </div>
          { reScanNFT
            ?  <div style={{margin: 30}}>
                <Row gutter={32}>
                  <Col span={6}>
                    <Card style={{height: 400}}>
                      <Skeleton active avatar size='small' shape='square'/>
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card style={{height: 400}}>
                      <Skeleton active avatar size='small' shape='square'/>
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card style={{height: 400}}>
                      <Skeleton active avatar size='small' shape='square'/>
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card style={{height: 400}}>
                      <Skeleton active avatar size='small' shape='square'/>
                    </Card>
                  </Col>
                </Row>
              </div> 

            : <> { digitalSafes.length == 0
              ? <Empty 
                  description={<Text type='secondary'>Connected wallet has no digital safes</Text>} 
                  image={emptyWallet} 
                  imageStyle={{ height: 50, opacity: 0.4, marginBottom: 20 }}
                />
              : <List
                  align="center"
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 5 }}
                  dataSource={digitalSafes}
                  renderItem={item => (
                    <List.Item className="scan-nft" >
                      <DigitalSafeCard
                        address={item.address}
                        tokenId={item.tokenId} 
                        title={item.name} 
                        description={item.description.length < 28
                          ? `${item.description}`
                          : `${item.description.substring(0, 25)}...`}
                        src={item.image} 
                        additional={tokenIdLink(item)}
                        showFile={downloadFile}
                        image={downloadImageUri}
                        text={downloadTextUri}
                        video={downloadVideoUri}
                        fileURL={item.fileURL}
                        cleanImage={cleanImage}
                      />
                    </List.Item>
                  )}
                  bordered={false}
                  pagination={{ 
                    onChange: page => {
                      scrollToTop();
                    },
                    pageSize: 16 
                  }}
                />
              }
            </>
          }
        </div>
      <br/>
      <br/>
    </div>
    )
};


