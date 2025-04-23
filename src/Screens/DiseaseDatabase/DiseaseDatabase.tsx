import { useNavigate } from 'react-router-dom';
import './DiseaseDatabase.css'
import { Button, TextField } from "@mui/material";
import DiseaseCard from '../../Components/DiseaseCard/DiseaseCard';
import { useEffect, useState } from 'react';
import { db } from '../../firebaseconfig';
import { collection, getDocs } from 'firebase/firestore';


interface diseaseType{
    DiseaseName:string,
    DiseaseSnapshot:string,
    DiseaseId:string
}
export default function DiseaseDatabase(){


    const [diseases,setDiseases] = useState<diseaseType[]>([])


    useEffect(()=>{

        const fetchDiseases = async()=>{

            try{
                const diseaseRef = collection(db,'Disease')
                const diseaseSnap = await getDocs(diseaseRef)


                if(diseaseSnap){
                    const rawData = diseaseSnap.docs.map(doc=>({

                        DiseaseName:doc.data().CommonName || "",
                        DiseaseSnapshot:doc.data().DiseaseSnapshot || "",
                        DiseaseId:doc.id
                    }))

                    setDiseases(rawData)    
                }


           


            }catch(err){

            }

        }
        fetchDiseases()
        

    },[])

    const navigate = useNavigate();

    const navigateToDiseaseUpload = () => {
        navigate('/admin/disease_upload')
    }

    return(
        <>


        <div className="mainWrapper">

            <div className="headerWrapper_diseaseDB">
                <Button variant="contained" onClick={navigateToDiseaseUpload}>Create New Disease Data</Button>

     
            </div>



            <div className="contentWrapper_diseaseDB">


                <div className="cropCardsWrapper_diseaseDB">

                    {diseases!.map((disease,index)=>(

                            <DiseaseCard DiseaseId={disease.DiseaseId} DiseaseName={disease.DiseaseName} DiseaseSnapshot={disease.DiseaseSnapshot}/>

                    ))}
 
                </div>
            </div>


        </div>









        </>
    )
}