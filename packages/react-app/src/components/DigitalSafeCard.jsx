import React, { useState } from "react";
import { Card, Typography, Image, Button, Modal } from "antd";
import "../App.css";
import { EyeOutlined } from '@ant-design/icons';
const { Meta } = Card;
const { Text, Paragraph } = Typography;

export default function DigitalSafeCard(
  { tokenId, title, description, additional, src, showFile, image, text, video, fileURL, cleanImage }) {
    const [open, setOpen] = useState(false);
    const [decrypting, setDecrypting] = useState(false);

    const cleanModal = () => {
      setOpen(true);
      cleanImage();
    };

    const hideModal = () => {
      setOpen(false);
      cleanImage();
    };

    const show = async (tokenId) => {
      setDecrypting(true);
      await showFile(tokenId);
      setDecrypting(false);
    };

  return (
    <>
      <Card
        style={{ width: 200 }}
        hoverable
        cover={<Image height={200} alt={title} style={{ height: "100%" }} src={src} />}
        onClick={cleanModal} 
      >
        <Meta
          style={{flex:1, textAlign: 'left'}}
          title={title}
          description={description}
        />
        <div style={{textAlign: 'left', marginTop:10}}>
          {additional}
        </div>
      </Card>
      <Modal
        title={`${title} | NFT Content`}
        centered
        visible={open}
        width={650}
        footer={null}
        closable
        maskClosable
        onCancel={hideModal}
      >
        <p>{description}</p>
        <Paragraph copyable>{fileURL}</Paragraph>
        <div style={{marginTop: 30, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <Button 
            //icon={<EyeOutlined/>} 
            style={{ marginRight: 40 }} 
            type='primary' 
            onClick={() => show(tokenId)}
            icon={<EyeOutlined/>} 
          >
            Show File
          </Button>
        </div>
        <div style={{marginTop: 30, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          {
            image && <Image maxheight={200} alt="img" style={{ height: "100%" }} src={image}/>
          }
          {
            text && <iframe src={text} height="100%" width="100%"></iframe>
          }
          {
            video && <video controls autoplay="true" width="760" height="480"><source type="video/mp4" src={video}/></video>
          }
          {
            decrypting && <Text>Decrypting...<Button loading type='text' shape='circle' /></Text>
          }
        </div>
      </Modal>
    </>
  )
};
