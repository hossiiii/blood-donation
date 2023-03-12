import { Box, Button, FormControl, InputLabel, Typography } from "@mui/material";
import { useState } from "react";
import LeftDrawer from "../component/LeftDrawer";
import Header from "../component/Header";
import AlertsDialog from "../component/AlertsDialog";
import AlertsSnackbar from "../component/AlertsSnackbar";
import {createAccount,offlineSignature} from "../hooks/useFunction";
import axios from "axios";
import { Bars } from 'react-loader-spinner'
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useQRCode } from 'next-qrcode';


function Donation(): JSX.Element {
    //LeftDrawerの設定
    const [openLeftDrawer, setOpenLeftDrawer] = useState<boolean>(false);
    const [isWaitingConfirmed, setIsWaitingConfirmed] = useState<boolean>(true);
    const [isWaitingConfirmed2, setIsWaitingConfirmed2] = useState<boolean>(true);
    const [bloodAddressPlain, setBloodAddressPlain] = useState<string>("");
    const { Image } = useQRCode();

    const [amount, setAmount] = useState<string>("200");

    const handleChange = (event: SelectChangeEvent) => {
      setAmount(event.target.value);
    };

    const handleAgreeClick = async (account:{privateKey:string,publicKey:string,address:string}) => {
      setOpenDialog(false)
      let role = "blood"
      const name = `${JSON.parse(localStorage.getItem('data')!).address}`
      const res = await axios.post(process.env.REACT_APP_API_MAKE_ACCOUNT!, {
        transfer_amount: amount,
        userPublicKey: account.publicKey,
        role: role,
        name: name,
      });
      console.log(res.data.data);
      setIsWaitingConfirmed(false);
      const result = await offlineSignature(account.privateKey,res.data.data.signedHash,res.data.data.signedPayload)
      setIsWaitingConfirmed(result);
      //ここに血液アカウントに対して、メッセージを送る処理を書く

      const res2 = await axios.post(process.env.REACT_APP_API_MAKE_MESSAGE!, {
        userPublicKey: JSON.parse(localStorage.getItem('data')!).publicKey, //ユーザーの公開鍵
        bloodAddressPlain: account.address, //血液アカウントのアドレス
      });
      console.log(res2.data.data);
      setIsWaitingConfirmed2(false);
      const result2 = await offlineSignature(JSON.parse(localStorage.getItem('data')!).privateKey,res2.data.data.signedHash,res2.data.data.signedPayload)
      setIsWaitingConfirmed2(result2);

      setBloodAddressPlain(account.address)
      setAlertsMessage("QRコードを作成しました。")
      setSeverity("success")
      setOpenSnackbar(true)
    }

    //SnackBarの設定
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
    const [alertsMessage, setAlertsMessage] = useState<string>("");
    const [severity, setSeverity] = useState< "error" | "success" >("error");

    //ダイアログの設定
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    
    return (
    <>
      <AlertsSnackbar
        openSnackbar={openSnackbar}
        setOpenSnackbar={setOpenSnackbar}
        vertical={"bottom"}
        severity={severity}
        message={alertsMessage}
      />
      <AlertsDialog
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        handleAgreeClick={()=>{
          const account = createAccount()
          handleAgreeClick(account)
        }}
        dialogTitle={"QRコードの作成"}
        dialogMessage={`${amount} mlの献血量でQRコードを発行しますか？`}
      />
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
        {(localStorage.getItem('data'))?
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
        >
          {(isWaitingConfirmed && isWaitingConfirmed2)?
          (JSON.parse(localStorage.getItem('data')!).role === "check" || JSON.parse(localStorage.getItem('data')!).role === "use")?
          <>
            <Typography component="div" variant="caption" sx={{marginBottom:1}}>献血スタッフ、献血した血液を利用される方はメニューから「血液の確認 / 記録」を選んで血液QRコードを読み取って下さい</Typography>          
          </>
          :(bloodAddressPlain === "")?
          <>
            <Typography component="div" variant="caption" sx={{marginBottom:5}}>献血量を指定して献血を証明するためのQRコードを発行します。</Typography>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="demo-simple-select-helper-label">献血量</InputLabel>
              <Select
                value={amount}
                label="血量(ml)"
                onChange={handleChange}
                style={{width: "70vw"}}
              >
                <MenuItem value={200}>200 ml</MenuItem>
                <MenuItem value={400}>400 ml</MenuItem>
              </Select>
              <FormHelperText>200ml か 400ml から選択</FormHelperText>
            </FormControl>

            <Button
              disabled={!isWaitingConfirmed}
              variant="contained"
              style={{width: "70vw", marginLeft: "20px" ,borderRadius: "20px",backgroundColor: (isWaitingConfirmed)?'orangered':'gray', color: "white", marginTop: "20px"}}
              onClick={() => {
                setOpenDialog(true)
              }}
            >
              QRコードを発行する
            </Button>
          </>
          :
          <>
            <Typography component="div" variant="caption" sx={{marginBottom:3}}>表示されたQRコードを献血スタッフ側で読み込んでもらい献血の証明を行って下さい。</Typography>
            <Image
              text={bloodAddressPlain}
              options={{
                level: 'M',
                margin: 3,
                scale: 4,
                width: 200,
              }}
            />
            <Typography component="div" variant="caption" sx={{marginTop:1}}>{`${JSON.parse(localStorage.getItem('data')!).address}`}</Typography>          
          </>          
          :
          <>
            <Box 
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
            >
            <Bars height={50} width={50} color={'orangered'}></Bars>
            <Typography component="div" variant="caption" sx={{marginTop:5}}>{(!isWaitingConfirmed)?`QR作成中...(３０秒ほどおまち下さい)`:`ブロックチェーンに記録中...(３０秒ほどおまち下さい)`}</Typography>
            </Box>
          </>
          }
        </Box>
        :
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
        >
          <Typography component="div" variant="caption" sx={{marginBottom:1}}>献血の前にホーム画面で献血者アカウントを作成して下さい。</Typography>          
        </Box>
        }
      </Box>
    </>
    );
};
export default Donation;