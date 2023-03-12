import { Box,Typography} from "@mui/material";
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
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import React from "react";
import {getDateTime} from "../hooks/useFunction";
function TimeLine(props: {dict:any}): JSX.Element {
  //LeftDrawerの設定
    const {
        dict,
    } = props

    return (
        <>
        {(dict.history[0].message.length>0)?
            <Box
            marginTop={1}
            width="250px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            >
            <Typography component="div" variant="caption" sx={{fontSize:11}}>{dict.history[0].message}</Typography>
            <KeyboardDoubleArrowDownIcon/>
            </Box>
        :<></>}
        <Timeline position="alternate">
        {
            dict.history.map((history: { signerAddress:string ,name: string, action: string, message: string, seconds: number }, index: React.Key | null | undefined) => (
            <React.Fragment key={index}>
                <TimelineItem>
                    <TimelineOppositeContent
                    sx={{ m: 'auto 0' }}
                    align="right"
                    variant="body2"
                    color="text.secondary"
                    >
                    {(history.action==="donation")?`${getDateTime(history.seconds)} ago  ${dict.amount}(ml)`:`${getDateTime(history.seconds)} ago`}
                    </TimelineOppositeContent>

                    <TimelineSeparator>
                    {(history.action==="donation")?
                        <TimelineDot  sx={{ colr:'white', backgroundColor: 'orangered' }}
                            onClick={() => {window.open(`https://testnet.symbol.fyi/accounts/${history.signerAddress}`, '_blank')}}
                        >
                        <BloodtypeIcon sx={{ colr:'white', backgroundColor: 'orangered' }}/>
                        </TimelineDot>
                        :(history.action==="check")?
                        <TimelineDot  sx={{ colr:'white', backgroundColor: 'lightseagreen' }}
                            onClick={() => {window.open(`https://testnet.symbol.fyi/accounts/${history.signerAddress}`, '_blank')}}
                        >
                        <CheckCircleIcon sx={{ colr:'white', backgroundColor: 'lightseagreen' }}/>
                        </TimelineDot>
                        :(history.action==="use")?
                        <TimelineDot  sx={{ colr:'white', backgroundColor: 'salmon' }}
                            onClick={() => {window.open(`https://testnet.symbol.fyi/accounts/${history.signerAddress}`, '_blank')}}
                        >
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
                    <Typography component="div" variant="caption">{`${history.name}`}</Typography>
                    </TimelineContent>
                </TimelineItem>
            </React.Fragment>
            ))
        }
        </Timeline>
        {(dict.history[dict.history.length-1].action==="use")?
            <Box
            marginBottom={1}
            width="250px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            >
            <KeyboardDoubleArrowUpIcon/>
            <Typography component="div" variant="caption" sx={{fontSize:11}}>{dict.history[dict.history.length-1].message}</Typography>
            </Box>
        :<></>}
        </>
      );
};
export default TimeLine;