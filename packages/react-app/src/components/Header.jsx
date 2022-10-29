import { PageHeader, Menu, Row, Col, Button, Drawer, Typography, Image, Tooltip } from "antd";
import React, {useContext, useState} from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../logo_white_circle.png";
import { Account, NetworkSwitch, NetworkDisplay } from ".";
import { ScreenSize } from "../context/screenSize";
import "../App.css";
import { useThemeSwitcher } from "react-css-theme-switcher";
import {
  AppstoreOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  PieChartOutlined,
  DesktopOutlined,
  ContainerOutlined,
  MailOutlined,
  InfoCircleOutlined,
  ReadOutlined
} from '@ant-design/icons';
import gitBookWhite from '../GitBook_white.png';
import gitBookBlack from '../GitBook_black.png';

const { Text } = Typography;

const items = [
  // {
  //   label: 
  //   (
  //     <div style={{width: 0, marginTop:6, marginLeft: 20, marginRight: 20 }}>
  //       <Link to="/mysmartvaults">Manage</Link>
  //     </div>
  //   ),
  //   key: 'mysmartvaults',
  //   // icon: <SettingOutlined />,
  // },
  // {
  //   label: (
  //     <div style={{width: 0, marginTop:6,marginLeft: 20, marginRight: 20}}>
  //       <Link to="/trustedsmartvaults">Trust</Link>
  //     </div>
  //   ),
  //   key: 'trustedsmartvaults',
  //   // icon: <AppstoreOutlined />,
  //   // disabled: true,
  // },
  // {
  //   label: (
  //     <div style={{width: 0, marginTop:6, marginLeft: 8, marginRight: 20}}>
  //       <Link to="/receive">Receive</Link>
  //     </div>
  //   ),
  //   key: 'receive',
  // },
  {
    label: (
      <div style={{width: 0, marginTop:6, marginLeft: 20, marginRight: 20}}>
        <Link to="/digitalsafe">Digital Safe</Link>
      </div>
    ),
    key: 'digitalsafe',
  },
];

export default function Header({
  address,
  signer,
  price,
  logoutOfWeb3Modal,
  networkOptions,
  selectedNetwork,
  setSelectedNetwork,
  localProvider,
  loadWeb3Modal,
  web3Modal,
  contractConfig,
  localChainId,
  selectedChainId,
  targetNetwork
}) {

  const { windowSize } = useContext(ScreenSize);
    const { currentTheme } = useThemeSwitcher();
  const [current, setCurrent] = React.useState(useLocation().pathname.split("/")[1]);

  const [visible, setVisible] = useState(false);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };
  
  const onClick = (e) => {
    setCurrent(e.key);
  };

  return windowSize?.headerLogo === 0
  ? (
    
      <div className="ant-header-carapace">
        <Row>
          <Col span={ 12 } style={{ height: 60, display: "flex", alignItems: "center"}}>
        
              <a href="https://carapace.io" target="_blank" rel="noopener noreferrer">
                <PageHeader
                  title="C A R A P A C E"
                  //subTitle="Safeguarding the future of digital assets"
                  style={{ cursor: "pointer"}}
                  avatar={{src: logo}}
                />
              </a>
          
          </Col>
          <Col span={12} style={{ height: 60, display: "flex", alignItems: "center", justifyContent:'flex-end'}}>
            <div style={{marginRight: '5%'}}>
              <Button icon={<MenuOutlined />} onClick={showDrawer} />
            </div>
            <Drawer
              title={     
                <Row style={{display: 'flex', justifyContent:'space-evenly'}}>   
                  <div style={{marginRight: 20, marginTop:5}}>
                    <Tooltip color='gold' title="Carapace App is on a Beta version. It has not yet been audited, please use it at your own risk.">
                      <Text code style={{background: 'gold', color: 'black'}}>Beta v0.01</Text>
                    </Tooltip>
                  </div>
                  <div style={{marginRight: 20, marginTop:5}}>
                    <a href="https://docs.carapace.io/support/tutorials" target="_blank" rel="noopener noreferrer">
                      <Image 
                        style={{marginTop:1 }} 
                        width='20px' 
                        src={currentTheme === "light" ? gitBookBlack : gitBookWhite} 
                        preview={false}
                      />
                    </a>
                  </div>  
                  <NetworkSwitch
                    networkOptions={networkOptions}
                    selectedNetwork={selectedNetwork}
                    setSelectedNetwork={setSelectedNetwork}
                  />
                  <NetworkDisplay
                    NETWORKCHECK={true}
                    localChainId={localChainId}
                    selectedChainId={selectedChainId}
                    targetNetwork={targetNetwork}
                    logoutOfWeb3Modal={logoutOfWeb3Modal}
                    setSelectedNetwork={setSelectedNetwork}
                  />
                    <Account
                    address={address}
                    localProvider={localProvider}
                    signer={signer}
                    price={price}
                    web3Modal={web3Modal}
                    loadWeb3Modal={loadWeb3Modal}
                    logoutOfWeb3Modal={logoutOfWeb3Modal}
                    blockExplorer={''}
                    />
                </Row>
              } 
              placement="top" 
              onClose={onClose} 
              visible={visible}
              closable
              height={180}
            >
              <div style={{display: 'flex', justifyContent:'space-evenly', marginTop:20}}>
                {/* <div >
                  <Link to="/mysmartvaults"><h3>Manage</h3></Link>
                </div>
                <div>
                  <Link to="/trustedsmartvaults"><h3>Trust</h3></Link>
                </div>
                <div>
                  <Link to="/receive"><h3>Receive</h3></Link>
                </div> */}
                <div>
                  <Link to="/digitalsafe"><h3>Digital Safe</h3></Link>
                </div>
              </div>
          </Drawer>
        </Col>
      </Row>
    </div>
  )
  :( 
    <div className="ant-header-carapace">
      <Row >
        <Col span={ windowSize?.headerLogo || 6 }>
          <div style={{ height: 60, display: "flex", alignItems: "center"}}>
            <a href="https://carapace.io" target="_blank" rel="noopener noreferrer">
              <PageHeader
                title="C A R A P A C E"
                //subTitle="Safeguarding the future of digital assets"
                style={{ cursor: "pointer"}}
                avatar={{src: logo}}
              />
            </a>
          </div>
        </Col>
            
        {address ? 
          <Col span={ 12 - windowSize?.headerLogo || 6 }>
            <div style={{ height: "100%"}}>
              <Menu 
                style={{ display: "flex", justifyContent: "flex-start", textAlign: "center", borderBottom:'none' }} 
                onClick={onClick} 
                selectedKeys={[current]} 
                mode="horizontal" 
                items={items} 
              />
            </div>
          </Col>
          : <Col span={6}></Col>
        }       
        
        <Col span={12}>
          <div style={{ height: "100%", display: "flex", justifyContent: "flex-end", alignItems: "center", marginRight: 24 }}>
            <div style={{marginRight: 20}}>
              <Tooltip color='gold' title="Carapace App is on a Beta version. It has not yet been audited, please use it at your own risk.">
                <Text code style={{background: 'gold', color: 'black'}}>Beta v0.01</Text>
              </Tooltip>
            </div>
            <div style={{marginRight: 20}}>
              <a href="https://docs.carapace.io/support/tutorials" target="_blank" rel="noopener noreferrer">
                <Image 
                  style={{marginTop:1 }} 
                  width='20px' 
                  src={currentTheme === "light" ? gitBookBlack : gitBookWhite} 
                  preview={false}
                />
              </a>
            </div>
            <NetworkSwitch
                  networkOptions={networkOptions}
                  selectedNetwork={selectedNetwork}
                  setSelectedNetwork={setSelectedNetwork}
                />
            <NetworkDisplay
              NETWORKCHECK={true}
              localChainId={localChainId}
              selectedChainId={selectedChainId}
              targetNetwork={targetNetwork}
              logoutOfWeb3Modal={logoutOfWeb3Modal}
              setSelectedNetwork={setSelectedNetwork}
            />
            <Account
              address={address}
              localProvider={localProvider}
              signer={signer}
              price={price}
              web3Modal={web3Modal}
              loadWeb3Modal={loadWeb3Modal}
              logoutOfWeb3Modal={logoutOfWeb3Modal}
              blockExplorer={''}
              />
          </div>
        </Col>   
      </Row>
    </div> 
  );
}
