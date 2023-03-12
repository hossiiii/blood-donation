import { Alert, Box, Typography } from "@mui/material";
import { useState } from "react";
import LeftDrawer from "../component/LeftDrawer";
import Header from "../component/Header";

function Infomation(): JSX.Element {
    //LeftDrawerの設定
    const [openLeftDrawer, setOpenLeftDrawer] = useState<boolean>(false);

    return (
    <>
      <Header
        setOpenLeftDrawer={setOpenLeftDrawer}
        />
      <LeftDrawer
        openLeftDrawer={openLeftDrawer}
        setOpenLeftDrawer={setOpenLeftDrawer}
      />
      <Box 
        sx={{ p: 3 }}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <Alert severity="warning" style={{fontSize:"11px"}} sx={{marginTop:3}}>
          献血スタッフ、献血した血液を利用される施設の方は事前登録が必要になります。必要な情報をご記入の上、以下メールアドレスへご連絡下さい。
        </Alert>
        <Typography component="div" variant="caption" sx={{marginTop:5}}>■ 施設名　（例：みやこでIT献血センター）</Typography>
        <Typography component="div" variant="caption" sx={{marginTop:1}}>■ 役割　（献血所 or 血液利用施設）</Typography>
        <Typography component="div" variant="caption" sx={{marginTop:1}}>■ 宛先　hossiiii0117@gmail.com</Typography>

        <Alert severity="info" style={{fontSize:"11px"}} sx={{marginTop:3}}>
          認証方法はGoogleアカウントになるため、Googleアカウトのメールアドレスでご連絡ください
        </Alert>
      </Box>
    </>
    );
};
export default Infomation;