

import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import { useState } from 'react';
import './DiseaseUpload.css'
import { toast } from 'react-toastify';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebaseconfig';
import { useNavigate } from 'react-router-dom';
//dialog imports
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';


export default function DiseaseUpload(){    

    const navigate = useNavigate();

    const [cover, setCover] = useState<File | null>(null);
    const [selectedSymptomImage, setSelectedSymptomImage] = useState<File[]>([]);


    const[diseaseName,setDiseaseName] = useState("");
    const [characteristics,setCharacteristics] = useState("");
    const [ecology,setEcology] = useState("");
    const [symptoms,setSymptoms] = useState("");
    const [controlMeasures,setControlMeasures] = useState("");


    

    const handleSymptomImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("Image selected :", e.target.files);
        if (e.target.files && e.target.files.length > 0) {
          const newImage = e.target.files[0];
          setSelectedSymptomImage(prev => [...prev, newImage]);
      
          // 👇 Reset the input so the same file can be picked again
          e.target.value = "";
        }
    };



    const uploadDiseaseData = async()=>{


        try{
            setOpenUploadConfirm(false);
            if(!cover){
                toast.error("Pest Snapshot is required.");
                return;
            }
            else if(!diseaseName || diseaseName.length === 0){
                toast.error("Pest Name is required.");
                return;
            }
            else if(!characteristics || characteristics.length === 0){
                toast.error("Characteristics Cannot be empty.");
                return;
            }
            else if(!ecology || ecology.length === 0){
                toast.error("Ecology Cannot be empty.");
                return;
            }
            else if(!symptoms || symptoms.length === 0){
                toast.error("Symptoms Cannot be empty.");
                return;
            }
            else if(!controlMeasures || controlMeasures.length === 0){
                toast.error("Control Measures Cannot be empty.");
                return;
            }


            const symptomsSnapshotsImageUrls = []
            let diseaseSnapshotUrl;


            // upload symptoms snapshots to cloudinary
            if(selectedSymptomImage.length>0){

                for(const imageData of selectedSymptomImage){

                    const formData = new FormData();
                    formData.append("file",imageData);
                    formData.append("upload_preset","dishlyunsignedpreset")

                    const response = await fetch(
                        'https://api.cloudinary.com/v1_1/dvl7mqi2r/image/upload',
                        {
                            method:"POST",
                            body: formData
                        }
                    )
                    

                    const data = await response.json();
                    if(data.secure_url){

                        symptomsSnapshotsImageUrls.push(data.secure_url)
                    }else{
                        console.error("Upload failed : ", data)
                    }

                }
            }

            //upload cover to cloudinary
            if(cover){
                const formData = new FormData();
                formData.append("file",cover);
                formData.append("upload_preset","dishlyunsignedpreset")

                const response = await fetch(
                    'https://api.cloudinary.com/v1_1/dvl7mqi2r/image/upload',
                    {
                        method:"POST",
                        body: formData
                    }
                )

                const data = await response.json();
                console.log("Uploaded image URL: ",data.secure_url)

                if(data.secure_url){
                    diseaseSnapshotUrl = data.secure_url
                }
            }


            const diseaseNameAsDocId = diseaseName.split(" ").join("_").toLowerCase() + Date.now().toString();


            const symptomsData = {
                Symptoms:symptoms,
                SymptomsSnapshot:symptomsSnapshotsImageUrls
            }


            const diseaseData = {
                CommonName:diseaseName, 
                DiseaseDevelopment:characteristics,
                MethodsOfDispersal:ecology,
                DiseaseSnapshot:diseaseSnapshotUrl,
                DamageSymptoms:symptomsData,
                ControlMeasures:controlMeasures
            }

            const diseaseRef = doc(db,"Disease",diseaseNameAsDocId);
            console.log("New Disease Data : ", diseaseData)
            await setDoc(diseaseRef,diseaseData);
            toast.success("Disease data was uploaded successfully");
            navigate("/admin/disease_database")








        }catch(err){

        }
    }


    const [openUploadConfirm,setOpenUploadConfirm] = useState(false);
    const uploadDialog = ()=> (

        <Dialog
            open={openUploadConfirm}
    
            keepMounted
            onClose={() =>setOpenUploadConfirm(false)}
            aria-describedby="alert-dialog-slide-description"
        >
    
            <DialogTitle >{"Upload New Disease Data ?"}</DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-slide-description" >
                Do you want to upload this new disease data?
                    
            </DialogContentText>

            </DialogContent>
    
    
    
            <DialogActions>
            <Button onClick={() =>setOpenUploadConfirm(false)}>Cancel Action</Button>
            <Button onClick={() =>uploadDiseaseData()}>Continue</Button>
            </DialogActions>
        </Dialog>
    
    
        )
    return(
        <>
        {uploadDialog()}
         <div className="mainWrapper_DiseaseUpload">



                <div className="thumbnailWrapper_DiseaseUpload">

                    <img src={cover ? URL.createObjectURL(cover) : ""} alt="" className="coverImage_DiseaseUpload" />

                    <div className="uploadButtonWrapper">

                        <input type="file" id="cover" style={{display: "none"}} onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                setCover(e.target.files[0]);
                                }
                            }}/>

                        <label htmlFor="cover"><InsertPhotoIcon style={{color:"white", fontSize:"70px",  cursor:"pointer"}}/></label>
                    </div>

                </div>

                <TextField value={diseaseName} onChange={(e)=>setDiseaseName(e.target.value)} sx={{marginTop:'30px',fontSize:'30px'}} id="standard-basic" label="Disease Name....." variant="standard" />
               

                    
                <div className="contentWrapper">
                    <div className="contentHeaderWrapper">
                        <span className="contentHeader"> Symptoms</span>
                    </div>


                    <TextField
                        id="outlined-multiline-static"
                        label="Damage Symptoms..."
                        multiline
                        rows={15}
                        value={symptoms}
                        sx={{marginTop:'30px', width:'95%'}}
                        onChange={(e)=>setSymptoms(e.target.value)}



                        />




                    <div className="damageSymptomWrapper">

                        {selectedSymptomImage.map((image, index) => (
                            <img src={URL.createObjectURL(image)} alt="" className="symptomImage" key={index}/>
                        ))}
                        <div className="imageSelectorWrapper">
                            <input type="file" id="symptom" style={{display: "none"}} onChange={handleSymptomImageChange}/>

                            <label htmlFor="symptom" style={{margin:0}}><InsertPhotoIcon style={{color:"white", fontSize:"50px",  cursor:"pointer"}}/></label>
                        </div>
                    </div>
                </div>

                <div className="contentWrapper">
                    <div className="contentHeaderWrapper">
                        <span className="contentHeader">Disease Development</span>
                    </div>


                    <TextField
                        id="outlined-multiline-static"
                        label="DiseaseDevelopment..."
                        multiline
                        rows={15}
                        value={characteristics}
                        sx={{marginTop:'30px', width:'95%'}}
                        onChange={(e)=>setCharacteristics(e.target.value)}



                        />
                </div>



                <div className="contentWrapper">
                    <div className="contentHeaderWrapper">
                        <span className="contentHeader">Methods Of Dispersal</span>
                    </div>


                    <TextField
                        id="outlined-multiline-static"
                        label="Methods Of Dispersal..."
                        multiline
                        rows={15}
                        value={ecology}
                        sx={{marginTop:'30px', width:'95%'}}
                        onChange={(e)=>setEcology(e.target.value)}




                        />
                </div>



                <div className="contentWrapper">
                    <div className="contentHeaderWrapper">
                        <span className="contentHeader">Control Measures</span>
                    </div>


                    <TextField
                        id="outlined-multiline-static"
                        label="Control Measures..."
                        multiline
                        rows={15}
                        value={controlMeasures}
                        sx={{marginTop:'30px', width:'95%'}}
                        onChange={(e)=>setControlMeasures(e.target.value)}

                        />
                </div>

                <Button onClick={()=>setOpenUploadConfirm(true)} variant="contained" sx={{marginTop:'20px'}}>Upload Disease Data</Button>
            </div>
        
        </>
    )
}


