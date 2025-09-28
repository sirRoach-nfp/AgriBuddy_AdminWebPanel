
import { useEffect, useState } from 'react';
import './PestEdit.css'
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import { toast } from 'react-toastify';
import { addDoc, collection, deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebaseconfig';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

//dialog imports
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

//icon import

import { Bug, Calendar, NotepadText, SquarePlus } from 'lucide-react';


interface referenceInt{
    id:number,
    referenceTitle:string,
    referenceLink:string,

}



export default function PestEdit(){

    const{id} = useParams()
    const[deleteCode,setDeleteCode] = useState('')
    const navigate = useNavigate();

    const [cover, setCover] = useState<File | string>('');
    const [selectedSymptomImage, setSelectedSymptomImage] = useState<File[]>([]);

    //current symptom images
    const[currentSymptoms,setCurrentSymptoms] = useState<string[]>([]);

    const [reference,setReference] = useState<referenceInt[]>([])

    const[pestName,setPestName] = useState("");
    const[scientificName,setScientificName] = useState("");

    //const [symptomsObject,setSymptomsObject] = useState<any>({});
    const [characteristics,setCharacteristics] = useState("");
    const [ecology,setEcology] = useState("");
    const [symptoms,setSymptoms] = useState("");
    const [controlMeasures,setControlMeasures] = useState("");

    const [symptomImages, setSymptomImages] = useState<(File | string)[]>([]);



    /*

    const handleSymptomImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("Image selected :", e.target.files);
        if (e.target.files && e.target.files.length > 0) {
          const newImage = e.target.files[0];
          setSelectedSymptomImage(prev => [...prev, newImage]);
      
          // 👇 Reset the input so the same file can be picked again
          e.target.value = "";
        }
      };

    */

    const handleAddSymptomImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        setSymptomImages(prev => [...prev, file]);
    }
    };

    const handleRemoveImage = (index: number) => {
        setSymptomImages(prev => prev.filter((_, i) => i !== index));
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

    useEffect(()=> {
        
        const fetchPestData = async()=>{



            try{
                console.log("Fetching document with the id of : ",id)

                const docRef = doc(db,"Pest",id as string);
                console.log("Doc Ref : ", docRef);
                const docSnap = await getDoc(docRef);
                console.log("All fields in docSnap:", Object.keys(docSnap.data() || {}));



                console.log("DocSnap : ", docSnap.data());
                

                if(docSnap.exists()){
                    console.log("pest snapshot from docsnap : ", docSnap.data().PestSnapshot)
                    setPestName(docSnap.data().CommonName)
                    setScientificName(docSnap.data().ScientificName)
                    setCharacteristics(docSnap.data().Characterstics)
                    setEcology(docSnap.data().Ecology)
                    setSymptomImages(docSnap.data().DamageSymptoms.SymptomsSnapshot)
                    setSymptoms(docSnap.data().DamageSymptoms.Symptoms)
                    setControlMeasures(docSnap.data().ControlMeasures)
                    setCover(docSnap.data().PestSnapshot)
                    setReference(docSnap.data().reference ?? [])

                    console.log("Damage symptoms whole : ", docSnap.data().DamageSymptoms)
                    console.log("Pest snapshot : ", docSnap.data().PestSnapshot)
                    console.log("Damage symptoms context : ", docSnap.data().DamageSymptoms.Symptoms)
                }

                

            }catch(err){}
        }

        fetchPestData()



    },[])



    useEffect(() => {
    console.log("Cover updated: ", cover);
    }, [cover]);


    const saveEdit = async()=>{

        try{

            let newCover = cover;

            setOpenUpdateConfirm(false)
            const newSymptomsSnapshot = symptomImages.filter(img => typeof img === "string");


            const filesToUpload = symptomImages.filter(img => typeof img !== "string") as File[];
            console.log("Files to upload : ", filesToUpload)
            console.log("New Symptoms Snapshot : ", newSymptomsSnapshot)


            
            // upload symptoms snapshots to cloudinary
            if(filesToUpload.length > 0){



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
            
            
            console.log("new cover : ", cover)
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

                    newCover = (data.secure_url)
                }else{
                    console.error("Upload failed : ", data)
                }
            }






            const symptomsData = {
                SymptomsSnapshot : newSymptomsSnapshot,
                Symptoms : symptoms
            }

            const newPestData = {
                CommonName:pestName,
                ScientificName:scientificName,
                Characterstics:characteristics,
                Ecology:ecology,
                DamageSymptoms:symptomsData,
                ControlMeasures:controlMeasures,
                PestSnapshot:newCover,
                reference:reference
            }

            console.log("Pest data object : ", newPestData)


            const pestDocRef = doc(db,"Pest",id as string);
            console.log("Doc Ref : ", pestDocRef);
            await updateDoc(pestDocRef,newPestData)

               
            toast.success("Pest data was updated successfully");
            navigate("/admin/pest_database")





        }catch(err){
            console.error(err)
        }
    }


    

    const uploadPest = async()=>{


        try{

            if(!cover){
                toast.error("Pest Snapshot is required.");
                return;
            }
            else if(!pestName || pestName.length === 0){
                toast.error("Pest Name is required.");
                return;
            }
            else if(!scientificName || scientificName.length === 0){
                toast.error("Scientific Name is required.");
                return;
            }

            const symptomsSnapshotsImageUrls = []
            let pestSnapshotUrl;

            // upload symptoms snapshots to cloudinary

            if(selectedSymptomImage.length > 0){


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
                    pestSnapshotUrl = data.secure_url
                }
            }






            const pestNameAsDocId = pestName.replace(/\s+/g, '');

            const symptomsData = {
                Symptoms: symptoms,
                SymptomsSnapshot: symptomsSnapshotsImageUrls
            }
    
            const newPestData = {
                CommonName:pestName,
                ScientificName:scientificName,
                Characteristics:characteristics,
                Ecology:ecology,
                Symptoms:symptomsData,
                ControlMeasures:controlMeasures,
                PestSnapshot:pestSnapshotUrl
            }


            const pestRef = doc(db,'Pest',pestNameAsDocId);
            console.log("New Pest Data : ", newPestData)
            await setDoc(pestRef,newPestData);
            toast.success("Pest data was uploaded successfully");
            navigate("/admin/pest_database")
            
            

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
      
              <DialogTitle >{"Update Pest Data ?"}</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-slide-description" >
                Updating this pest data will apply changes across the system for all users.

                Inaccurate data may lead to incorrect pest control recommendations and negatively affect user decisions.

                Please double-check the updated information before proceeding.
                      
                </DialogContentText>
    
              </DialogContent>
      
      
      
              <DialogActions>
                <Button onClick={() =>setOpenUpdateConfirm(false)}>Cancel Action</Button>
                <Button onClick={() =>saveEdit()}>Continue</Button>
              </DialogActions>
            </Dialog>
      
      
    )

    const deletePest = async()=>{

        try{
            setOpenDeleteConfirm(false);
            if(deleteCode !== "DELETE PEST"){toast.warning("Pest deletion is aborted ! Wrong Code");return}
            const pestDocRef = doc(db,"Pest",id as string);
            await deleteDoc(pestDocRef);
            toast.success("Pest Data was deleted Successfully");
            navigate("/admin/pest_database")
        }catch(err){console.error(err)}
    }

    const deleteDialog = ()=> (
    
          <Dialog
            open={openDeleteConfirm}
    
            keepMounted
            onClose={() =>setOpenDeleteConfirm(false)}
            aria-describedby="alert-dialog-slide-description"
          >
    
            <DialogTitle sx={{color:'red'}}>{"Delete Pest Data From The Database?"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-slide-description" sx={{color:'red'}}>
              Deleting this pest data will permanently remove it from the system and may affect users relying on this information.

            This action could result in missing or incorrect pest identification and control advice.

            Proceed only if you're certain this pest data is no longer relevant.
                    
              </DialogContentText>
    
              <TextField
                autoFocus
                required
                margin="dense"
                id="name"
                name="email"
                label="Please type 'DELETE PEST' to confirm"
                type="email"
                fullWidth
                variant="standard"
                onChange={(e)=>setDeleteCode(e.target.value)}
              />
            </DialogContent>
    
    
    
            <DialogActions>
              <Button onClick={() =>setOpenUpdateConfirm(false)}>Cancel Action</Button>
              <Button onClick={() =>deletePest()}>Continue</Button>
            </DialogActions>
          </Dialog>
    
    
    )






    const testFetchedData = () => {

        console.log("Cover : ", cover)
        console.log("Control Measure : ", controlMeasures)
    }


    return(
        <>

        {updateDialog()}
        {deleteDialog()}
            <div className="mainWrapper">

                <div className="headerWrapper_ArticleEdit">
                    <div className="headerWrapper_info">

                        <Bug/>
                        <div className="headerWrapper_info_text">
                            
                            <p className="headerWrapper_info_text_primary">Pest Data Editor</p>
                            <span className="headerWrapper_info_text_secondary">Edit and manage your pest data</span>
                        </div>
                    </div>

                    <div className="headerWrapper_ArticleEdit_buttonWrappers">
                        <Button variant="contained"  onClick={()=>setOpenDeleteConfirm(true)} sx={{height:'40px',backgroundColor:'red'}}>Delete Pest Data</Button>
                        <Button variant="contained" onClick={()=>setOpenUpdateConfirm(true)} sx={{height:'40px'}}>Save Changes</Button>
                    </div>


                </div>



                <div className="thumbnailWrapper">

                    <img src={typeof cover === 'string' ? cover : URL.createObjectURL(cover)} alt="" className="coverImage_pestUpload" />

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
                            Pest common name
                        </span>
                        <TextField value={pestName} 
                            onChange={(e)=>setPestName(e.target.value)} 
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


                    <div className="inputWrapper">
                        <span className="inputWrapper__header__primary">
                            Pest scientific name
                        </span>
                        <TextField value={scientificName} 
                            onChange={(e)=>setScientificName(e.target.value)} 
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
                        <span className="sectionHeader__Primary">Characteristics</span>
                    </div>


                    <TextField
                        id="outlined-multiline-static"
                        label="Characteristics..."
                        multiline
                        rows={15}
                        value={characteristics}
                        sx={{marginTop:'30px', width:'95%'}}
                        onChange={(e)=>setCharacteristics(e.target.value)}




                        />
                </div>


                
                <div className="contentWrapper" style={{borderRadius:0,borderColor:'#e2e8f0'}}>
                    <div className="contentHeaderWrapper">
                        <span className="sectionHeader__Primary">Ecology</span>
                    </div>


                    <TextField
                        id="outlined-multiline-static"
                        label="Characteristics..."
                        multiline
                        rows={15}
                        value={ecology}

                        sx={{marginTop:'30px', width:'95%'}}
                        onChange={(e)=>setEcology(e.target.value)}




                        />
                </div>


                <div className="contentWrapper" style={{borderRadius:0,borderColor:'#e2e8f0'}}>
                    <div className="contentHeaderWrapper">
                        <span className="sectionHeader__Primary">Damage Symptoms</span>
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




                    <div className="damageSymptomWrapper" style={{borderRadius:0,borderColor:'#e2e8f0'}}>

                        {symptomImages.map((img, index) => (
                            <img src={typeof img === 'string' ? img : URL.createObjectURL(img)} alt="" className="symptomImage" key={index} onClick={()=>handleRemoveImage(index)}/>
                        ))}
                        <div className="imageSelectorWrapper">
                            <input type="file" id="symptom" style={{display: "none"}} onChange={handleAddSymptomImage}/>

                            <label htmlFor="symptom" style={{margin:0}}><InsertPhotoIcon style={{color:"white", fontSize:"50px",  cursor:"pointer"}}/></label>
                        </div>
                    </div>
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

                <Button
                    onClick={testFetchedData}
                >TEst data </Button>

         
             
            </div>
        </>
    )
}