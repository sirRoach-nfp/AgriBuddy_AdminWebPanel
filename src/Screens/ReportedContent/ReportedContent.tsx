

import * as React from 'react';
import Button from '@mui/material/Button';
import './ReportedContent.css'
import ArticleCard from '../../Components/ArticleCard/ArticleCard';
import { useNavigate } from 'react-router-dom';

import { Outlet } from 'react-router-dom';
import { db } from '../../firebaseconfig';
import { collection, getDocs } from 'firebase/firestore';

//MUI imports

import TextField from '@mui/material/TextField';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';



export default function ReportedContent(){



    const [reasonFilter,setReasonFilter] = React.useState("All")
    const handleChange = (event:any) => {
      setReasonFilter(event.target.value);
    };
    return(
        <>
        <div className="mainWrapper">

                <div className="headerWrapper">

                    <p className="headerSection__primary">Reported Contents</p>
                    <span className="headerSection__secondary">Manage Reported Contents</span>
                                        <div className="filterWrapperReported">

                        <div className="filterWrapperReported__reasonFilter">
                            <p className='filterWrapperReported__typeFilter__header__primary'>Content Type:</p>
                            <Select
                            labelId="dropdown-label"
                            value={reasonFilter}
                            label="Select Page"
                            inputProps={{
                                sx: {
                                
                                padding: '7px 14px',
                                
                                // adjust this to control the padding around the selected value
                                },
                            }}
                                sx={{
                                height: '40px',
                                minWidth: 120,
                                '& .MuiSelect-select': {
                                    padding: '10px 14px',
                                },
                                }}
                            onChange={handleChange}>
                                <MenuItem value="All">All</MenuItem>
                                <MenuItem value="Harassment">Comment</MenuItem>
                                <MenuItem value="FalseInfo">Post</MenuItem>
                                <MenuItem value="InappropriateContent">Crop Data</MenuItem>
                            
                    

                            </Select>
                        </div>

                        <div className="filterWrapperReported__reasonFilter">
                            <p className='filterWrapperReported__typeFilter__header__primary'>Reason:</p>
                            <Select
                            labelId="dropdown-label"
                            value={reasonFilter}
                            label="Select Page"
                            inputProps={{
                                sx: {
                                
                                padding: '7px 14px',
                                
                                // adjust this to control the padding around the selected value
                                },
                            }}
                                sx={{
                                height: '40px',
                                minWidth: 120,
                                '& .MuiSelect-select': {
                                    padding: '10px 14px',
                                },
                                }}
                            onChange={handleChange}>
                                <MenuItem value="All">All</MenuItem>
                                <MenuItem value="Spam&UnwantedContent" >Spam or Unwanted Content</MenuItem>
                                <MenuItem value="Harassment">Harassment or Bullying</MenuItem>
                                <MenuItem value="FalseInfo">False or Misleading Information</MenuItem>
                                <MenuItem value="InappropriateContent">Inappropriate Content</MenuItem>
                            
                    

                            </Select>
                        </div>

                        
                       
                    </div>
                    <hr />
                   

                </div>


                <div className="contentWrapper">



                    <div className="articleCardsWrapper">

                    </div>

                </div>

      
            </div>
        </>
    )
}