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
                
                <p className="headerSection__primary">Disease Database</p>
                <span className="headerSection__secondary">Manage your disease database</span>
                <hr />
     
            </div>



            <div className="contentWrapper_diseaseDB">
                    <div className="filterWrapper">
                        <Button sx={{backgroundColor:'#607D8B',height: '40px',}}  variant="contained" onClick={navigateToDiseaseUpload}>Create New Crop Data</Button>



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

                    {diseases!.map((disease,index)=>(

                            <DiseaseCard DiseaseId={disease.DiseaseId} DiseaseName={disease.DiseaseName} DiseaseSnapshot={disease.DiseaseSnapshot}/>

                    ))}
 
                </div>
            </div>


        </div>









        </>
    )
}