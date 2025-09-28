

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


import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { Calendar, NotepadText, SquarePlus } from 'lucide-react';



interface referenceInt{
    id:number,
    referenceTitle:string,
    referenceLink:string,

}


export default function DiseaseUpload(){    

    const navigate = useNavigate();
    const [reference,setReference] = useState<referenceInt[]>([])

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


    const handleAddReference = () => {
        const newReference: referenceInt = {
            id:Date.now(),
            referenceTitle:'',
            referenceLink:'',
        }

        setReference(prev=> [...prev,newReference])
    }

    const handleRemoveReference = (indexToRemove:number) => {
        setReference(
            (prevContents) => 
                prevContents.filter((_,index)=>index !== indexToRemove)
        )
    }


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
                ControlMeasures:controlMeasures,
                reference:reference
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
         <div className="mainWrapper">



                <div className="thumbnailWrapper">

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
                

                <div className="sectionWrapper">
                    <div className="sectionHeader">
                        <div className="headerIconWrapper" style={{backgroundColor:'#CEFCE2'}}>
                            <NotepadText size={'20px'} color='#1C8960' />
                        </div>
                        <span className="sectionHeader__Primary">
                            Basic Information
                        </span>
                    </div>

                    <div className="inputWrapper">
                        <span className="inputWrapper__header__primary">
                            Disease Name
                        </span>

                        <TextField value={diseaseName} 
                            onChange={(e)=>setDiseaseName(e.target.value)} 
                            sx={{marginTop:'0px',fontSize:'30px',width:'100%',
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "8px", // cleaner radius
                                    height: "40px",      // control total height
                                    "& input": {
                                        padding: "0 12px", // remove vertical padding, keep horizontal
                                        height: "100%",    // make text sit centered vertically
                                    },
                                    "& fieldset": {
                                        borderRadius: "8px",
                                    },
                                },


                            }} 
                            id="outlined-basic" variant="outlined" />
                    </div>
                </div>
                
               
                <div className="referenceWrapper" style={{marginTop:"20px"}}>

                    <div className="sectionHeader">
                        <div className="headerIconWrapper" style={{backgroundColor:'#E1E6FF'}}>
                    
                            <Calendar size={'20px'} color='#4F4D96' />
                        </div>
                        <span className="sectionHeader__Primary">
                            References
                        </span>
                        <Button onClick={handleAddReference} 
                            startIcon={<SquarePlus />}
                            className="createButton" 
                            sx={{ color:'#309C78',marginTop: 'auto',marginBottom:'auto',lineHeight: 1, marginLeft:'auto'}}>
                                Add new Reference</Button>
                    </div>

                    <div className="referenceContentWrapper" style={reference.length <= 0 ? { display: "none" } : {}}>

                                {reference?.map((reference,index)=>{

                                    return(
                                        <div className="referenceItem">
                                            <TextField placeholder='Reference Title' sx={{width:'30%'}}
                                                value={reference.referenceTitle}
                                                onChange={(e)=> {
                                                    const newTitle = e.target.value;
                                                    setReference((prev)=>
                                                        prev.map((item,i)=>
                                                            i === index ? {...item,referenceTitle:newTitle} : item
                                                        )
                                                    )
                                                }}

                                            />
                                            
                                            <TextField placeholder='Reference Link' sx={{width:'70%'}}
                                                value={reference.referenceLink}
                                                onChange={(e)=>{
                                                    const newLink = e.target.value.trim();

                                                    setReference((prev)=>
                                                        prev.map((item,i)=>
                                                            i === index ? {...item,referenceLink:newLink}:item
                                                        )
                                                    )
                                                }}
                                            
                                            
                                            />
                                            <RemoveCircleIcon 
                                                onClick={()=> handleRemoveReference(index)}
                                                sx={{fontSize: 30}} />
                                        </div>
                                    )

                                })}
                    </div>
                   
                </div>
                    
                <div className="contentWrapper" style={{borderRadius:0,borderColor:'#e2e8f0'}}>
                    <div className="contentHeaderWrapper">
                        <span className="sectionHeader__Primary"> Symptoms</span>
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

                <div className="contentWrapper" style={{borderRadius:0,borderColor:'#e2e8f0'}}>
                    <div className="contentHeaderWrapper">
                        <span className="sectionHeader__Primary">Disease Development</span>
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



                <div className="contentWrapper" style={{borderRadius:0,borderColor:'#e2e8f0'}}>
                    <div className="contentHeaderWrapper">
                        <span className="sectionHeader__Primary">Methods Of Dispersal</span>
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



                <div className="contentWrapper" style={{borderRadius:0,borderColor:'#e2e8f0'}}>
                    <div className="contentHeaderWrapper">
                        <span className="sectionHeader__Primary">Control Measures</span>
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


