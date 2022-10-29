import { Button, Empty, Image, Row, Col, Typography, Space } from "antd";
import { LoginOutlined, ArrowLeftOutlined, ArrowRightOutlined,CloseOutlined } from '@ant-design/icons';
import React, { useState, useContext } from "react";
import carapaceLogo from '../carapace_persist.svg';

const { Text } = Typography;

export default function Home({
  loadWeb3Modal,
}) {

  const [introStep, setIntroStep] = useState(1);

  const onChange = (currentSlide) => {
    console.log(currentSlide);
  };

  const hideIntro = () => {
    setSkipIntro(true);
  };

  const previous = () => {
    setIntroStep(introStep - 1);
  };

  const next = () => {
    setIntroStep(introStep + 1);
  };

  const showSkipIntro = () => {
    return ( 
      <div style={{display:'flex', alignItems: 'center', justifyContent: 'right'}}>
        { introStep !== 5 ?
          <Button type='text' onClick={hideIntro} >
             <Text type='secondary'>skip</Text>
          </Button>
          : <Button style={{marginRight: 10}} type='text' onClick={hideIntro} icon={<CloseOutlined />}/>
        }
      </div>
    )
  };

  const showArrows = () => {
    return (
        <div style={{display:'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Space style={{marginRight: 10, marginTop: 20}}>
            <Button onClick={previous} icon={<ArrowLeftOutlined />} disabled={introStep === 1}/>
            <Button onClick={next} icon={<ArrowRightOutlined />} disabled={introStep === 5} />
          </Space>
        </div>
    )
  };

  return (
    <div className="ant-div-carapace" style={{marginTop: "5%" , marginLeft: "10%", marginRight: "10%"}}>
     <Empty
          image={carapaceLogo}
          imageStyle={{
            height: 200,
            marginBottom: 48,
          }}
          description={
            <span>
              Connect your wallet to create a digital safe. 
            </span>
          }
        >
          <Button
            className="ant-button-carapace"
            key="loginbutton"
            type="primary"
            shape="square"
            size="large"
            onClick={loadWeb3Modal}
            icon={<LoginOutlined />}
          >
            Connect
          </Button>
        </Empty>
    </div>
  );
}
