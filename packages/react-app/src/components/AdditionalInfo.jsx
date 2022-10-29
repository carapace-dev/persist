import React from "react";
import { Tooltip, Typography } from "antd";
import { InfoCircleOutlined } from '@ant-design/icons';
import { useThemeSwitcher } from "react-css-theme-switcher";
import "../App.css";
const { Text } = Typography;


export default function AdditionalInfo (
  { info }) {
  
  const { currentTheme } = useThemeSwitcher();
  
    return (
    <Tooltip
      placement="right"
      trigger="click"
      color={currentTheme === "light" ? "#303030" : "#f9f9f9"}
      overlayInnerStyle={{
        padding: 15,
        fontSize: 12,
        color: currentTheme === "light" ? "#ffffff" : "#000000"}}
      title={info}>
        <InfoCircleOutlined style={{fontSize: 12, marginLeft: 8, marginTop: 12}} />
    </Tooltip>
  );
}
