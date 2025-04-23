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
        
            <div className="mainWrapper_PestDb">
                
                    <div className="headerWrapper_PestDb">
                        <Button variant="contained" onClick={navigateToPestUpload} >Create New Pest Data</Button>

   
                    </div>



                    <div className="contentWrapper_PestDb">

                        <div className="pestCardsWrapper_PestDb">
                            
                            {pests.map((pest,index)=>(
                                <PestCard CommonName={pest.CommonName} PestDocuId={pest.PestId} PestSnapshot={pest.PestSnapshot}ScientificName={pest.ScientificName}/>
                            ))}


                        </div>

                    </div>


            </div>
        
        </>
    )
}