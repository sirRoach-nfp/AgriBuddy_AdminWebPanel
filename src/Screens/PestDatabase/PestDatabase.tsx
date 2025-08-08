import { Button, TextField } from "@mui/material";

import './PestDatabase.css'
import PestCard from "../../Components/PestCard/PestCard";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseconfig";






interface pestType{

    CommonName:string,
    ScientificName:string,
    PestSnapshot:string,
    PestId:string
}

export default function PestDatabase() {


    const [pests,setPests] = useState<pestType[]>([])

    useEffect(()=>{
        
        const fetchPests = async()=>{


            try{


                const pestRef = collection(db,'Pest')

                const pestSnap = await getDocs(pestRef)

                if(pestSnap){

                    const rawData = pestSnap.docs.map(doc=>({

                        CommonName:doc.data().CommonName || "",
                        ScientificName:doc.data().ScientificName || "",
                        PestSnapshot:doc.data().PestSnapshot || "",
                        PestId:doc.id
                    }))
                    setPests(rawData)

                }


                

            }catch(err){
                console.error(err)
            }

        }

        fetchPests();
    },[])




    const navigate = useNavigate()

    const navigateToPestUpload = () =>{

        navigate('/admin/pest_upload')
    }
    return(
        <>
        
            <div className="mainWrapper">
                
                    <div className="headerWrapper_PestDb">
                       
                        <p className="headerSection__primary">Pest Database</p>
                        <span className="headerSection__secondary">Manage your crop data</span>
                        <hr />
                    </div>



                    <div className="contentWrapper_PestDb">
                        <div className="filterWrapper">
                                                <Button sx={{backgroundColor:'#607D8B',height: '40px',}}  variant="contained" onClick={navigateToPestUpload}>Create New Crop Data</Button>



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
                            
                            {pests.map((pest,index)=>(
                                <PestCard CommonName={pest.CommonName} PestDocuId={pest.PestId} PestSnapshot={pest.PestSnapshot}ScientificName={pest.ScientificName}/>
                            ))}


                        </div>

                    </div>


            </div>
        
        </>
    )
}