import { Button, TextField } from "@mui/material";
import "./CropDatabase.css"
import CropCard from "../../Components/CropCard/CropCard";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";

import { db } from "../../firebaseconfig";
//MUI imports
import AccountCircle from '@mui/icons-material/AccountCircle';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';



interface cropData{
    cropId:string,
    cropName:string,
    cropScientificName:string,
    cropCoverImage:string
}
export default function CropDatabase() {

    const navigate = useNavigate();

    const [crops,setCrops] = useState<cropData[]>([])

    const navigateToUpload = () => {
        navigate('/admin/crop_upload')
    }

    useEffect(()=>{
    
        const fetchCrops = async()=>{
            try{

                const cropsRef = collection(db,'Crops')

                const cropsSnap = await getDocs(cropsRef)


                if(cropsSnap){
                    const rawData = cropsSnap.docs.map(doc=>({

                        cropId:doc.id,
                        cropName:doc.data().cropName || "",
                        cropScientificName:doc.data().scientificName || "",
                        cropCoverImage:doc.data().cropCover || ""
                    }))
                    setCrops(rawData)
                    
                }
            }catch(err){console.error(err)}
        }


        fetchCrops()

    })
    return(
        <>


            <div className="mainWrapper">

                    <div className="headerWrapper">

                        <p className="headerSection__primary">Crop Database</p>
                        <span className="headerSection__secondary">Manage your crop data</span>
                        <hr />
                    

                    </div>
            

                    <div className="contentWrapper_CropDb">

                    <div className="filterWrapper">
                        <Button sx={{backgroundColor:'#607D8B',height: '40px',}}  variant="contained" onClick={navigateToUpload}>Create New Crop Data</Button>



                        <div className="filterWrapper__searchWrapper">
                            <TextField 
                                variant="outlined"
                                label="Search"
                                fullWidth
                                sx={{
                                    flex: '1 1 200px',
                                    '& .MuiInputBase-root': {
                                    height: '40px',
                                    boxSizing: 'border-box',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0 14px',
                                    },
                                    '& .MuiInputBase-input': {
                                    padding: 0,
                                    height: '100%',
                                    boxSizing: 'border-box',
                                    },
                                    '& .MuiInputLabel-root': {
                                    top: '-6px',
                                    },
                                    '& label.Mui-focused': {
                                    top: 0,
                                    },
                                }} />
                            

                        </div>


                        </div>

                        <div className="articleCardsWrapper">


                            {crops.map((crop,index)=>(
                                <CropCard cropName={crop.cropName} cropCoverImage={crop.cropCoverImage} cropScientificName={crop.cropScientificName} cropId={crop.cropId}/>


                            ))}
                            
                   
                        </div>
                    </div>

            </div>
        
        
        </>
    )
}