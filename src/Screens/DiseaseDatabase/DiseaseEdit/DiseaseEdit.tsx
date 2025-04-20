

import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import './DiseaseEdit.css'
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../../firebaseconfig';
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toast } from 'react-toastify';





//dialog imports
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';



export default function DiseaseEdit(){    

    const navigate = useNavigate();
    const{id} = useParams();
    const[deleteCode,setDeleteCode] = useState('')

    const [cover, setCover] = useState<File | string>('');
    const [diseaseDevelopment, setDiseaseDevelopment] = useState("");
    const [methodOfDispersal,setMethodOfDispersal] = useState("");
    const [symptoms,setSymptoms] = useState("");
    const [controlMeasures,setControlMeasures] = useState("");








    const [symptomImages, setSymptomImages] = useState<(File | string)[]>([]);



    const[diseaseName,setDiseaseName] = useState("");

    const handleAddSymptomImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        setSymptomImages(prev => [...prev, file]);
    }
    };



    const handleRemoveImage = (index: number) => {
        setSymptomImages(prev => prev.filter((_, i) => i !== index));
      };


    useEffect(()=>{


        const fetchDiseaseData = async()=>{

            console.log("Fetching Document with the id of : ", id);


            const docRef = doc(db,"Disease",id as string);
            const docSnap = await getDoc(docRef);

            console.log("DocSnap : ", docSnap.data());


            if(docSnap.exists()){
                setCover(docSnap.data().DiseaseSnapshot)
                setDiseaseName(docSnap.data().CommonName)
                setDiseaseDevelopment(docSnap.data().DiseaseDevelopment)
                setMethodOfDispersal(docSnap.data().MethodsOfDispersal)
                setSymptoms(docSnap.data().DamageSymptoms.Symptoms)
                setSymptomImages(docSnap.data().DamageSymptoms.SymptomsSnapshot)
                setControlMeasures(docSnap.data().ControlMeasures)
            }
            
        }

        fetchDiseaseData()


    },[id])


    const saveEdit = async()=>{




        try{
            
            setOpenUpdateConfirm(false)
            const newSymptomsSnapshot = symptomImages.filter(img => typeof img === "string");

            const filesToUpload = symptomImages.filter(img => typeof img !== "string") as File[];


            console.log("Files to upload : ", filesToUpload)
            console.log("New Symptoms Snapshot : ", newSymptomsSnapshot)



            //upload symptoms snapshots to cloudinary


            if (filesToUpload.length > 0) {
                for(const imageData of filesToUpload){
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

                        newSymptomsSnapshot.push(data.secure_url)
                    }else{
                        console.error("Upload failed : ", data)
                    }

                    
                }
            }



            if(cover && typeof cover !== "string"){
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
                if(data.secure_url){

                    setCover(data.secure_url)
                }else{
                    console.error("Upload failed : ", data)
                }
            }




            const symptomsData ={
                Symptoms:symptoms,
                SymptomsSnapshot:newSymptomsSnapshot
            }


            const diseaseData = {
                CommonName:diseaseName, 
                DiseaseDevelopment:diseaseDevelopment,
                MethodsOfDispersal:methodOfDispersal,
                DiseaseSnapshot:cover,
                DamageSymptoms:symptomsData,
                ControlMeasures:controlMeasures
            }


            const diseaseRef = doc(db,'Disease',id as string);
            console.log("New Disease Data : ", diseaseData)
            await updateDoc(diseaseRef,diseaseData)

            toast.success("Pest data was updated successfully");
            navigate("/admin/disease_database")



        }catch(err){

        }
    }


    const [openDeleteConfirm,setOpenDeleteConfirm] = useState(false);
    const [openUpdateConfirm,setOpenUpdateConfirm] = useState(false);



    const updateDialog = ()=> (
    
            <Dialog
              open={openUpdateConfirm}
      
              keepMounted
              onClose={() =>setOpenUpdateConfirm(false)}
              aria-describedby="alert-dialog-slide-description"
            >
      
              <DialogTitle >{"Update Disease Data ?"}</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-slide-description" >
                Updating this disease data will apply changes across the system for all users.

                Inaccurate data may lead to incorrect disease control recommendations and negatively affect user decisions.

                Please double-check the updated information before proceeding.
                      
                </DialogContentText>
    
              </DialogContent>
      
      
      
              <DialogActions>
                <Button onClick={() =>setOpenUpdateConfirm(false)}>Cancel Action</Button>
                <Button onClick={() =>saveEdit()}>Continue</Button>
              </DialogActions>
            </Dialog>
      
      
    )

    const deleteDialog = ()=> (
    
            <Dialog
            open={openDeleteConfirm}
    
            keepMounted
            onClose={() =>setOpenDeleteConfirm(false)}
            aria-describedby="alert-dialog-slide-description"
            >
    
            <DialogTitle sx={{color:'red'}}>{"Delete Disease Data From The Database?"}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description" sx={{color:'red'}}>
                Deleting this disease data will permanently remove it from the system and may affect users relying on this information.

            This action could result in missing or incorrect disease identification and control advice.

            Proceed only if you're certain this disease data is no longer relevant.
                    
                </DialogContentText>
    
                <TextField
                autoFocus
                required
                margin="dense"
                id="name"
                name="email"
                label="Please type 'DELETE DISEASE' to confirm"
                type="email"
                fullWidth
                variant="standard"
                onChange={(e)=>setDeleteCode(e.target.value)}
                />
            </DialogContent>
    
    
    
            <DialogActions>
                <Button onClick={() =>setOpenDeleteConfirm(false)}>Cancel Action</Button>
                <Button onClick={() =>deleteDisease()}>Continue</Button>
            </DialogActions>
            </Dialog>
    
    
    )


    const deleteDisease = async()=>{

        try{

            
            setOpenDeleteConfirm(false);
            if(deleteCode !== "DELETE DISEASE"){toast.warning("Disease deletion is aborted ! Wrong Code");return}
            const diseaseDocRef = doc(db,"Disease",id as string);
            await deleteDoc(diseaseDocRef);
            toast.success("Disease Data was deleted Successfully");
            navigate("/admin/disease_database")

        }catch(err){console.error(err)}
    }




    return(
        <>
        {updateDialog()}
        {deleteDialog()}
         <div className="mainWrapper_DiseaseEdit">

            <div className="headerWrapper_ArticleEdit">

                    <div className="backWrapper_ArticleEdit">
                        <ArrowBackIcon sx={{fontSize:30,marginTop:0,marginBottom:0}}/>
                        <span className="backText_ArticleEdit">Return</span>
                    </div>
                    <Button variant="contained"  sx={{marginLeft:'auto'}} onClick={() =>setOpenDeleteConfirm(true)}>Delete Article</Button>
                    <Button variant="contained" onClick={saveEdit} sx={{marginLeft:'5px'}}>Save Edited Article</Button>

            </div>



                <div className="thumbnailWrapper_DiseaseEdit">

                    <img src={typeof cover === 'string' ? cover : URL.createObjectURL(cover)} alt="" className="coverImage_DiseaseUpload" />

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
                        <span className="contentHeader">Symptoms</span>
                    </div>


                    <TextField
                        id="outlined-multiline-static"
                        label="Symptoms..."
                        multiline
                        rows={15}
                        value={symptoms}
                        sx={{marginTop:'30px', width:'95%'}}
                        onChange={(e)=>setSymptoms(e.target.value)}



                        />




                    <div className="damageSymptomWrapper">

                        {symptomImages.map((image, index) => (
                            <img onClick={()=>handleRemoveImage(index)} src={typeof image === 'string' ? image : URL.createObjectURL(image)} alt="" className="symptomImage" key={index}/>
                        ))}
                        <div className="imageSelectorWrapper">
                            <input type="file" id="symptom" style={{display: "none"}} onChange={handleAddSymptomImage}/>

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
                        label="Diseaese development..."
                        multiline
                        rows={15}
                        value={diseaseDevelopment}
                        sx={{marginTop:'30px', width:'95%'}}
                        onChange={(e)=>setDiseaseDevelopment(e.target.value)}


                        />
                </div>



                <div className="contentWrapper">
                    <div className="contentHeaderWrapper">
                        <span className="contentHeader">Methods Of Dispersal</span>
                    </div>


                    <TextField
                        id="outlined-multiline-static"
                        label="Method of dispersal..."
                        multiline
                        rows={15}
                        value={methodOfDispersal}
                        sx={{marginTop:'30px', width:'95%'}}
                        onChange={(e)=>setMethodOfDispersal(e.target.value)}



                        />
                </div>



                <div className="contentWrapper">
                    <div className="contentHeaderWrapper">
                        <span className="contentHeader">Control Measures</span>
                    </div>


                    <TextField
                        id="outlined-multiline-static"
                        label="Control measures..."
                        multiline
                        rows={15}
                        value={controlMeasures}
                        sx={{marginTop:'30px', width:'95%'}}
                        onChange={(e)=>setControlMeasures(e.target.value)}



                        />
                </div>


                <Button onClick={()=>console.log("Symptoms snapshots : ", symptomImages)}>check symptom images</Button>

            </div>
        
        </>
    )
}


