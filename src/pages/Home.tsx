import { Alert, Box, Button, FormControl, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import LeftDrawer from "../component/LeftDrawer";
import Header from "../component/Header";
import AlertsDialog from "../component/AlertsDialog";
import AlertsSnackbar from "../component/AlertsSnackbar";
import {createAccount,offlineSignature,getMyBloodList,getHistory,getDateTime} from "../hooks/useFunction";
import axios from "axios";
import { Bars } from 'react-loader-spinner'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { CardActionArea } from '@mui/material';
import { useQRCode } from 'next-qrcode';

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

function Home(): JSX.Element {
    //LeftDrawerの設定
    const [openLeftDrawer, setOpenLeftDrawer] = useState<boolean>(false);
    const [roleList, setRoleList] = useState<string[]>([]);
    const [isWaitingConfirmed, setIsWaitingConfirmed] = useState<boolean>(true);
    const [placeName, setPlaceName] = useState<string | null>("");
    const [dictList, setDictList] = useState<{address: string, amount: string, history: { address:string ,name: string, action: string, seconds: number }[]}[]>([]);
    const [totalAmount, settTtalAmount] = useState<number>(0);
    const { Canvas } = useQRCode();

    useEffect(() => {
        (async () => {
          //ログイン情報の取得
          const ret = await fetch('/.auth/me');
          const me = await ret.json();
          if(me.clientPrincipal){
            setRoleList(me.clientPrincipal.userRoles);            
            console.log(me.clientPrincipal.userRoles)

          }
          //履歴の取得
          if(localStorage.getItem('data')){
            const bloodList = await getMyBloodList(JSON.parse(localStorage.getItem('data')!).address)
            const list = await getHistory(bloodList.reverse())
            setDictList(list)
            console.log(list)
            let total = 0
            list.forEach((item) => {
              if(item.history.length > 1) total = total + Number(item.amount)              
            
            })
            settTtalAmount(total)
          }
        })()
    }, []);

    const handleAgreeClick = async (account:{privateKey:string,publicKey:string,address:string}) => {
      setOpenDialog(false)
      let role = "donation"
      if(roleList.includes("check")) role = "check"
      if(roleList.includes("use")) role = "use"      
      const name = placeName
      const res = await axios.post('/api/makeAccount', {
        transfer_amount: 0,
        userPublicKey: account.publicKey,
        role: role,
        name: name,
      });
      console.log(res.data.data);
      setIsWaitingConfirmed(false);
      const result = await offlineSignature(account.privateKey,res.data.data.signedHash,res.data.data.signedPayload)
      setIsWaitingConfirmed(result);
      let data = {
        privateKey: account.privateKey,
        publicKey: account.publicKey,
        address: account.address,
        role: role,
        name: name
      }
      const jsonString = JSON.stringify(data);
      localStorage.setItem('data', jsonString);
      setAlertsMessage((roleList.includes("check") || roleList.includes("use"))?"施設アカウントが作成されました":"献血者アカウントが作成されました")
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
        dialogTitle={(roleList.includes("check") || roleList.includes("use"))?"施設アカウントの作成":"献血者アカウントの作成"}
        dialogMessage={(roleList.includes("check") || roleList.includes("use"))?`一度作成したアカウトはブロックチェーン上に半永久的に記録されます。${placeName}という名前で施設アカウントを作成しますか？`:"一度作成したアカウトはブロックチェーン上に半永久的に記録されます。献血者アカウントを作成しますか？"}
      />
      <Header
        setOpenLeftDrawer={setOpenLeftDrawer}
        />
      <LeftDrawer
        openLeftDrawer={openLeftDrawer}
        setOpenLeftDrawer={setOpenLeftDrawer}
        roleList={roleList}
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
          <Card sx={{ maxWidth: "300px" }}
          >
            <CardActionArea>
              <CardMedia
                component="img"
                height="140"
                image={`${JSON.parse(localStorage.getItem('data')!).role}.png`}
                alt="card image"
              />
              <CardContent
                onClick={() => {window.open(`https://testnet.symbol.fyi/accounts/${JSON.parse(localStorage.getItem('data')!).address}`, '_blank')}}
              >
                <Typography gutterBottom variant="h5" component="div">
                {`${JSON.parse(localStorage.getItem('data')!).name}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  your role is {`${JSON.parse(localStorage.getItem('data')!).role}`}
                </Typography>
                {
                  (JSON.parse(localStorage.getItem('data')!).role === "donation")?
                  <Typography variant="body2" color="text.secondary" sx={{marginTop:1}}>
                    your total {totalAmount} ml blood {`${JSON.parse(localStorage.getItem('data')!).role}`}
                  </Typography>
                  :<></>
                }
                <Typography variant="body2" color="text.secondary" sx={{marginTop:1}}>
                  your history is write by blockchain
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{marginTop:1,fontSize:"9px"}}>
                  {`${JSON.parse(localStorage.getItem('data')!).address}`}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
          {
            (JSON.parse(localStorage.getItem('data')!).role === "donation")?
            <Typography component="div" variant="caption" sx={{fontSize:1,marginTop:1}}>* チェックが行われた血液だけが total blood として計算されます</Typography>          
            :<></>
          }
          {dictList.map((dict,index)=> {
            return (
              
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
                marginTop={3}
              >
                {/* <Typography component="div" variant="caption" sx={{fontSize:11 ,marginBottom:1 , marginTop:3}}>{`${dict.address}`}</Typography> */}
                <Canvas
                  text={dict.address}
                  options={{
                    level: 'M',
                    margin: 3,
                    scale: 4,
                    width: 70,
                  }}
                />
                <Timeline position="alternate">
                {
                  dict.history.map((history, index) => (
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
                              <TimelineDot  sx={{ colr:'white', backgroundColor: 'orangered' }}
                                onClick={() => {window.open(`https://testnet.symbol.fyi/accounts/${dict.address}`, '_blank')}}
                              >
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
                            {(history.action==="donation")?
                            <Typography component="div" variant="body2">{`${dict.amount}(ml)`}</Typography>
                            :<></>}
                          </TimelineContent>
                        </TimelineItem>
                    </React.Fragment>
                  ))
                }
                </Timeline>
              </Box>
            );
          })}
        </Box>
        :
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
        >
          {(isWaitingConfirmed)?
          (roleList.includes("check") || roleList.includes("use"))?
          <>
            <Typography component="div" variant="caption" sx={{marginBottom:5}}>施設名を入力しアカウントを作成して下さい。</Typography>
            
            <FormControl>
              <TextField
                label="施設名"
                style={{width: "70vw", marginBottom: "30px"}}
                variant="outlined"            
                fullWidth={true}
                type={'text'}
                value={placeName}
                onChange={(e)=>{
                  setPlaceName(e.target.value)
                }}  
              />
            </FormControl>
            <Button
              disabled={!isWaitingConfirmed}
              variant="contained"
              style={{width: "70vw", marginLeft: "20px" ,borderRadius: "20px",backgroundColor: 'orangered', color: "white"}}
              onClick={() => {
                setOpenDialog(true)
              }}
            >
              施設アカウントを作成する
            </Button>
          </>
          :
          <>
            <Typography component="div" variant="caption" sx={{marginBottom:3}}>献血者の方はこのままアカウントを作成して下さい。</Typography>
            <Alert severity="warning" style={{fontSize:"11px"}} sx={{marginBottom:3}}>
              献血スタッフ、献血した血液を利用される施設の方は事前にログインが必要になります。
            </Alert>
            <Button
              disabled={!isWaitingConfirmed}
              variant="contained"
              style={{width: "70vw", marginLeft: "20px" ,borderRadius: "20px",backgroundColor: 'orangered', color: "white"}}
              onClick={() => {
                setPlaceName("donor")
                setOpenDialog(true)
              }}
            >
              献血者アカウントを作成する
            </Button>
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
            <Typography component="div" variant="caption" sx={{marginTop:5}}>登録中...(３０秒ほどおまち下さい)</Typography>
            </Box>
          </>
          }
        </Box>
        }

      </Box>
    </>
    );
};
export default Home;