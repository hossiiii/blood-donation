import { Box, Button,FormControl,FormHelperText,TextField,Typography } from "@mui/material";
import { useState } from "react";
import LeftDrawer from "../component/LeftDrawer";
import Header from "../component/Header";
import AlertsDialog from "../component/AlertsDialog";
import AlertsSnackbar from "../component/AlertsSnackbar";
import {QrCodeReader} from "../component/QrCodeReader";
import {offlineSignature,getHistory,getDateTime} from "../hooks/useFunction";
import axios from "axios";
import { Bars } from 'react-loader-spinner'
import TimeLine from "../component/TimeLine";

function Receive(): JSX.Element {
    //LeftDrawerの設定
    const [openLeftDrawer, setOpenLeftDrawer] = useState<boolean>(false);
    const [isWaitingConfirmed, setIsWaitingConfirmed] = useState<boolean>(true);
    const [isFinishMessage, setIsFinishMessage] = useState<boolean>(false);
    const [bloodAddressPlain, setBloodAddressPlain] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [dictList, setDictList] = useState<{address: string, amount: string, history: { signerAddress:string ,name: string, action: string, message: string, seconds: number }[]}[]>([]);

    const [isOpenQRCamera, setIsOpenQRCamera] = useState<boolean>(false);

    const clickOpenQrReader = () => {
      setIsOpenQRCamera(true);
    };
  
    const handleAgreeClick = async () => {
      setOpenDialog(false)
      const res = await axios.post(process.env.REACT_APP_API_MAKE_MESSAGE!, {
        userPublicKey: JSON.parse(localStorage.getItem('data')!).publicKey, //ユーザーの公開鍵
        bloodAddressPlain: bloodAddressPlain, //血液アカウントのアドレス
        action: "use",
        message: message,
      });
      console.log(res.data.data);
      setIsWaitingConfirmed(false);
      const result = await offlineSignature(JSON.parse(localStorage.getItem('data')!).privateKey,res.data.data.signedHash,res.data.data.signedPayload)

      const list = await getHistory([bloodAddressPlain])
      setDictList(list)
      console.log(list)

      setIsWaitingConfirmed(result);
      setIsFinishMessage(true)
      setAlertsMessage(`血液を受け取ったことを記録しました`)
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
          handleAgreeClick()
        }}
        dialogTitle={"献血された血液に対する記録"}
        dialogMessage={`献血された血液に対して${JSON.parse(localStorage.getItem('data')!).name}という名前で受け取ったことを記録しま すか？`}
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
          {(isWaitingConfirmed)?
          (JSON.parse(localStorage.getItem('data')!).role !== "check")?
          (dictList.length===0)?
          <>
            <Typography component="div" variant="caption" sx={{marginBottom:1}}>
              血液のQRコードを読み込み、情報の確認や受け取りの記録を行います。
            </Typography> 
            <Button
              variant="contained"
              style={{width: "70vw", marginLeft: "20px" ,borderRadius: "20px",backgroundColor: (isWaitingConfirmed)?'orangered':'gray', color: "white", marginTop: "20px"}}
              onClick={clickOpenQrReader}
            >
              QRコードを読み込む
            </Button>

            {isOpenQRCamera && <QrCodeReader onRead={async res => {
              setIsOpenQRCamera(false);
              console.log(res.getText());
              setBloodAddressPlain(res.getText())
              const dictList = await getHistory([res.getText()])
              setDictList(dictList)
              console.log(dictList)
            }} setOpen={setIsOpenQRCamera} />}
          </>
          :
          <>
            <Typography component="div" variant="h6">{`献血量　${dictList[0].amount}(ml)`}</Typography>
            <TimeLine
              dict={dictList[0]}
            />
            {(!isFinishMessage)?
            <>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <TextField
                  label="公開メッセージ(300字まで)"
                  multiline
                  maxRows={7}
                  style={{width: "85vw", marginTop: "10px"}}
                  variant="outlined"            
                  type={'text'}
                  value={message}
                  onChange={(e)=>{
                    setMessage(e.target.value)
                  }}
                />
                <FormHelperText>血液のを提供してくれた人に一言メッセージをお願いします</FormHelperText>
              </FormControl>
              <Button
                disabled={!isWaitingConfirmed}
                variant="contained"
                style={{width: "70vw", marginLeft: "20px" ,borderRadius: "20px",backgroundColor: (isWaitingConfirmed)?'orangered':'gray', color: "white", marginTop: "20px"}}
                onClick={()=>{
                  //既に記録がされていれば、記録を行わない
                  let flag = false
                  for (let i = 0; i < dictList.length; i++) {
                    for (let j = 0; j < dictList[i].history.length; j++) {
                      if(dictList[i].history[j].action === "check"){
                        flag = true //チェックされていれば、記録可能
                      }
                      if(dictList[i].history[j].name === JSON.parse(localStorage.getItem('data')!).name){
                        setAlertsMessage(`この血液に対して既に${getDateTime(dictList[i].history[j].seconds)}前に記録を行っています`)
                        setSeverity("error")
                        setOpenSnackbar(true)
                        flag = false
                        return                
                      }
                    }
                  }
                  if(flag){
                    setOpenDialog(true)
                  }else{
                    setAlertsMessage(`献血施設でチェックが行われていない血液なので受け取り記録ができません`)
                    setSeverity("error")
                    setOpenSnackbar(true)
                  }
                }}
              >
                記録する
              </Button>
            </>            
            :
            <></>
            }
          </>
          :
          <>
            <Typography component="div" variant="caption" sx={{marginBottom:1}}>献血施設の方はメニューから「血液の記録/確認」を選んで血液QRコードを作成して下さい</Typography>          
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
            <Typography component="div" variant="caption" sx={{marginTop:5}}>
              {`チェック内容を記録中...(３０秒ほどおまち下さい)`}
              </Typography>
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
          <Typography component="div" variant="caption" sx={{marginBottom:1}}>記録を行う前にホーム画面で施設アカウントを作成して下さい。</Typography>          
        </Box>
        }
      </Box>
    </>
    );
};
export default Receive;