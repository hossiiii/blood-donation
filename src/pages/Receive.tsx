import { Alert, Box, Button,Typography } from "@mui/material";
import React, { useState } from "react";
import LeftDrawer from "../component/LeftDrawer";
import Header from "../component/Header";
import AlertsDialog from "../component/AlertsDialog";
import AlertsSnackbar from "../component/AlertsSnackbar";
import {QrCodeReader} from "../component/QrCodeReader";
import {offlineSignature,getHistory,getDateTime} from "../hooks/useFunction";
import axios from "axios";
import { Bars } from 'react-loader-spinner'

import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';

function Receive(): JSX.Element {
    //LeftDrawerの設定
    const [openLeftDrawer, setOpenLeftDrawer] = useState<boolean>(false);
    const [isWaitingConfirmed, setIsWaitingConfirmed] = useState<boolean>(true);
    const [isFinishMessage, setIsFinishMessage] = useState<boolean>(false);

    const [bloodAddressPlain, setBloodAddressPlain] = useState<string>("");
    const [dictList, setDictList] = useState<{address: string, amount: string, history: { signerAddress:string ,name: string, action: string, seconds: number }[]}[]>([]);

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
        message: "ありがとう",
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
            <Timeline position="alternate">
            {
              dictList[0].history.map((history, index) => (
                <React.Fragment key={index}>
                    <TimelineItem>
                      <TimelineOppositeContent
                        sx={{ m: 'auto 0' }}
                        align="right"
                        variant="body2"
                        color="text.secondary"
                      >
                        {`${getDateTime(history.seconds)} ago`}
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        {(history.action==="donation")?
                          <TimelineDot  sx={{ colr:'white', backgroundColor: 'orangered' }}>
                            <BloodtypeIcon sx={{ colr:'white', backgroundColor: 'orangered' }}/>
                          </TimelineDot>
                          :(history.action==="check")?
                          <TimelineDot  sx={{ colr:'white', backgroundColor: 'lightseagreen' }}>
                            <CheckCircleIcon sx={{ colr:'white', backgroundColor: 'lightseagreen' }}/>
                          </TimelineDot>
                          :(history.action==="use")?
                          <TimelineDot  sx={{ colr:'white', backgroundColor: 'salmon' }}>
                            <FavoriteIcon sx={{ colr:'white', backgroundColor: 'salmon' }}/>
                          </TimelineDot>
                          :<></>                      
                        }
                        {
                          (history.action!=="use")?
                          <TimelineConnector />:<></>                          
                        }
                      </TimelineSeparator>
                      <TimelineContent sx={{ py: '12px', px: 2 }}>
                        <Typography variant="h6" component="span">
                        {`${history.action}`}
                        </Typography>
                        <Typography>{`${history.name}`}</Typography>
                      </TimelineContent>
                    </TimelineItem>
                </React.Fragment>
              ))
            }
            </Timeline>
            {(!isFinishMessage)?
            <>
              <Typography component="div" variant="caption" sx={{marginBottom:1}}>献血量に相違がなければ受け取り記録を行って下さい</Typography> 
              <Button
                disabled={!isWaitingConfirmed}
                variant="contained"
                style={{width: "70vw", marginLeft: "20px" ,borderRadius: "20px",backgroundColor: (isWaitingConfirmed)?'orangered':'gray', color: "white", marginTop: "20px"}}
                onClick={()=>{
                  //既に記録がされていれば、記録を行わない
                  let flag = false
                  dictList.forEach((data, index) => {
                    data.history.forEach((history, index) => {
                      if(history.action === "check"){
                        flag = true //チェックされていれば、記録可能
                      }
                      if(history.name === JSON.parse(localStorage.getItem('data')!).name){
                        setAlertsMessage(`この血液に対して既に${getDateTime(history.seconds)}前に記録を行っています`)
                        setSeverity("error")
                        setOpenSnackbar(true)
                        flag = false                          
                      }
                    } )                   
                  })
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