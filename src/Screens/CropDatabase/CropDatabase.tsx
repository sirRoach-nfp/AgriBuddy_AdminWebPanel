import { Button, TextField } from "@mui/material";
import "./CropDatabase.css"
import CropCard from "../../Components/CropCard/CropCard";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";

import { db } from "../../firebaseconfig";


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

                    <div className="headerWrapper_CropDb">
                        <Button variant="contained" onClick={navigateToUpload}>Create New Crop Data</Button>


                    </div>


                    <div className="contentWrapper_CropDb">



                        <div className="cropCardsWrapper_CropDb">


                            {crops.map((crop,index)=>(
                                <CropCard cropName={crop.cropName} cropCoverImage={crop.cropCoverImage} cropScientificName={crop.cropScientificName} cropId={crop.cropId}/>


                            ))}
                            
                   
                        </div>
                    </div>

            </div>
        
        
        </>
    )
}