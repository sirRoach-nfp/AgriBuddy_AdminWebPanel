
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';



import TextField from '@mui/material/TextField';
import './CropUpload.css'
import { ChangeEvent, useEffect, useState } from 'react';

import './CropUpload.css'
import Button from '@mui/material/Button';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../../firebaseconfig';
import { toast } from 'react-toastify';

import { useNavigate } from 'react-router-dom';
import { Upload } from '@mui/icons-material';
//dialog imports
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
interface contentsInt{
    id: number,
    header:string,
    content: string
}




const pestsnew = [
    {
      pestId: 'p1',
      pestName: 'Aphids',
      pestCoverImage: 'aphids.jpg',
    },
    {
      pestId: 'p2',
      pestName: 'Caterpillars',
      pestCoverImage: 'caterpillars.jpg',
    },
    {
      pestId: 'p3',
      pestName: 'Mites',
      pestCoverImage: 'mites.jpg',
    },
  ];
  
type Pest = {
pestId: string;
pestName: string;
pestCoverImage: string;
};

type Disease = {
    diseaseId:string,
    diseaseName:string,
    diseaseCoverImage:string
}
const pests = ['Aphids', 'Caterpillars', 'Mites', 'Whiteflies', 'Beetles'];
const soilTypes = [
    "Loamy",
    "Sandy",
    "Clayey",
    "Silty",
    "Volcanic (Andosol)",
    "Peaty",
    "Sandy Loam",
    "Clay Loam",
    "Silty Loam",
    "Sandy Clay Loam"
  ];
export default function CropUpload(){



        const navigate = useNavigate()

        const[pestSelection,setPestSelection] = useState<Pest[]>([]);
        const[diseaseSelection,setDiseaseSelection] = useState<Disease[]>([]);


        const [contents,setContents] = useState<contentsInt[]>([]);
        const [cover, setCover] = useState<File | null>(null);


        const[cropName,setCropName] = useState("");
        const[scientificName,setScientificName] = useState("");
        const[family,setFamily] = useState("");
        const [growthTime,setGrowthTime] = useState("");
        const[bestSeason,setBestSeason] = useState("");
        const[soilPh,setSoilPh] = useState("");
        const[soilType,setSoilType] = useState<string[]>([]);

        const [selectedPests, setSelectedPests] = useState<Pest[]>([]);
        const [selectedDiseases,setSelectedDiseases] = useState<Disease[]>([]);

        const handleCheckboxChangeSoil = (soil: string) => {
            setSoilType((prevSelected) =>
              prevSelected.includes(soil)
                ? prevSelected.filter((s) => s !== soil)
                : [...prevSelected, soil]
            );
          };

        const handleCheckboxChangePest = (e: ChangeEvent<HTMLInputElement>, pest: Pest) => {
            const { checked } = e.target;
        
            if (checked) {
              setSelectedPests((prev) => [...prev, pest]);
            } else {
              setSelectedPests((prev) => prev.filter((p) => p.pestId !== pest.pestId));
            }
          };

        const handleCheckboxChangeDiseases = (e: ChangeEvent<HTMLInputElement>, disease: Disease) => {
            const { checked } = e.target;
        
            if (checked) {
                setSelectedDiseases((prev) => [...prev, disease]);
            } else {
                setSelectedDiseases((prev) => prev.filter((p) => p.diseaseId !== disease.diseaseId));
            }
        };

        
    const checkData = ()=>{

        console.log("Selected pests : ", selectedPests);
        console.log("Selected Diseases : ", selectedDiseases);
        console.log("Contents : ", contents)
    }





    const handleAddContent = () =>{
        const newContent: contentsInt ={
            id: Date.now(),
            header:'',
            content:''
        }

        setContents(prev =>[...prev,newContent])
    }


    const handleRemoveContent = (indexToRemove:number)=>{
        setContents(
            (prevContents)=>
                prevContents.filter((_,index)=>index !== indexToRemove)
        )
    }


    const uploadCrop = async()=>{

        try{
            setOpenUploadConfirm(false);
            if(!cover){
                toast.error("Crop Snapshot is required.");
                return;
            }
            else if(!cropName || cropName.length === 0){
                toast.error("Crop Name is required.");
                return;
            }
            else if(!scientificName || scientificName.length === 0){
                toast.error("Scientific Name is required.");
                return;
            }
            else if(!growthTime || growthTime.length === 0){
                toast.error("Growth Time is required.");
                return;
            }
            else if(!bestSeason || bestSeason.length === 0){
                toast.error("Season is required.");
                return;
            }
            else if(!family || family.length === 0){
                toast.error("Plant Family is required.");
                return;
            }
            else if(!soilPh || soilPh.length === 0){
                toast.error("Soil PH is required.");
                return;
            }
            else if(soilType.length === 0){
                toast.error("Soil Type cannot be empty");
                return;
            }
            else if(contents.length === 0){
                toast.error("Contents cannot be empty");
                return;
            }




            let cropSnapshotUrl;

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
                    cropSnapshotUrl = data.secure_url
                }
            }


            const cropNameAsDocId = cropName.split(" ").join("").toLowerCase() + Date.now().toString();

            const newCrop = {
                cropId: cropName + Date.now().toString(),
                cropName: cropName,
                cropCover:cropSnapshotUrl,
                scientificName:scientificName,
                family:family,
                growthTime:growthTime,
                bestSeason:bestSeason,
                soilPh:soilPh,
                pests:selectedPests,
                diseases:selectedDiseases,
                contents:contents,
                soilType:soilType
            }



            const CropRef = doc(db,'Crops',cropNameAsDocId)
            console.log("New Crop Data : ", newCrop)
            await setDoc(CropRef,newCrop)
            toast.success("Crop data was uploaded successfully");
            navigate("/admin/crop_database")


            console.log(newCrop)
        }catch(err){}
    }

    useEffect(()=>{

        const fetchPestAndDiseaseSelections = async()=>{


            try{

                const pestsRef = collection(db,'Pest')  
                const pestSnap = await getDocs(pestsRef)

                if(pestSnap){

                    const rawData = pestSnap.docs.map(doc=>({

                        pestId:doc.id,
                        pestName:doc.data().CommonName || "",
                        pestCoverImage:doc.data().PestSnapshot || ""

                    }))

                    setPestSelection(rawData)
                    console.log("Pest Selection : ", rawData)
                }

                const diseaseRef = collection(db,'Disease')
                const diseaseSnap = await getDocs(diseaseRef)


                if(diseaseSnap){

                    const rawData = diseaseSnap.docs.map(doc=>({

                        diseaseId:doc.id,
                        diseaseName:doc.data().CommonName || "",
                        diseaseCoverImage:doc.data().DiseaseSnapshot || ""


                    }))
                    setDiseaseSelection(rawData)
                    console.log("Disease Selection : ", rawData)



                }


            }catch(err){
                console.error(err)
            }
        }

        fetchPestAndDiseaseSelections()
    },[])

    const [openUploadConfirm,setOpenUploadConfirm] = useState(false);

    const uploadDialog = ()=> (

        <Dialog
            open={openUploadConfirm}
    
            keepMounted
            onClose={() =>setOpenUploadConfirm(false)}
            aria-describedby="alert-dialog-slide-description"
        >
    
            <DialogTitle >{"Upload New Crop Data ?"}</DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-slide-description" >
                Do you want to upload this new crop data?
                    
            </DialogContentText>

            </DialogContent>
    
    
    
            <DialogActions>
            <Button onClick={() =>setOpenUploadConfirm(false)}>Cancel Action</Button>
            <Button onClick={() =>uploadCrop()}>Continue</Button>
            </DialogActions>
        </Dialog>
    
    
        )



    return(
        <>
        {uploadDialog()}
        <div className="mainWrapper_cropUpload">


            <div className="thumbnailWrapper_cropUpload">

                <img src={cover ? URL.createObjectURL(cover) : ""} alt="" className="coverImage_cropUpload" />

                <div className="uploadButtonWrapper">

                    <input type="file" id="cover" style={{display: "none"}} onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                            setCover(e.target.files[0]);
                            }
                        }}/>

                    <label htmlFor="cover"><InsertPhotoIcon style={{color:"white", fontSize:"70px",  cursor:"pointer"}}/></label>
                </div>

            </div>




            <TextField value={cropName} onChange={(e)=>setCropName(e.target.value)} sx={{marginTop:'30px',fontSize:'30px'}} id="standard-basic" label="Crop Name....." variant="standard" />
            <TextField value={scientificName} onChange={(e)=>setScientificName(e.target.value)} sx={{marginTop:'30px',fontSize:'30px'}} id="standard-basic" label="Scientific Name....." variant="standard" />
            <TextField value={family} onChange={(e)=>setFamily(e.target.value)} sx={{marginTop:'30px',fontSize:'30px'}} id="standard-basic" label="Crop Family....." variant="standard" />
            <TextField value={growthTime} onChange={(e)=>setGrowthTime(e.target.value)} sx={{marginTop:'30px',fontSize:'30px'}} id="standard-basic" label="Growth Time....." variant="standard" />
            <TextField value={bestSeason} onChange={(e)=>setBestSeason(e.target.value)} sx={{marginTop:'30px',fontSize:'30px'}} id="standard-basic" label="Best Season....." variant="standard" />
            <TextField value={soilPh} onChange={(e)=>setSoilPh(e.target.value)} sx={{marginTop:'30px',fontSize:'30px'}} id="standard-basic" label="Soil PH....." variant="standard" />
            
            
            <div className="pestSelectionWrapper">

                <div className="headerWrapper_pestSelection">
                    <span className="pestSelectionHeader">Select Soil Type</span>
                </div>


                <div className="pestCheckBoxList">
                    {soilTypes.map((soil, index) => (
                    <label key={index}>
                        <input
                        type="checkbox"
                        checked={soilType.includes(soil)}
                        onChange={() => handleCheckboxChangeSoil(soil)}
                        />
                        {soil}
                    </label>
                    ))}
                </div>

                <div className="selectedPestWrapper">

                </div>


            </div>


            
            <div className="pestSelectionWrapper">

                <div className="headerWrapper_pestSelection">
                    <span className="pestSelectionHeader">Select Pests</span>
                </div>


                <div className="pestCheckBoxList">
                    {pestSelection!.map((pest) => (
                    <label key={pest.pestId}>
                        <input
                        type="checkbox"
                        checked={selectedPests.some((p) => p.pestId === pest.pestId)}
                        onChange={(e) => handleCheckboxChangePest(e, pest)}
                        />
                        {pest.pestName}
                    </label>
                    ))}
                </div>

                <div className="selectedPestWrapper">

                </div>


            </div>



            <div className="pestSelectionWrapper">

                <div className="headerWrapper_pestSelection">
                    <span className="pestSelectionHeader">Select Diseases</span>
                </div>


                <div className="pestCheckBoxList">
                    {diseaseSelection.map((disease) => (
                        <label key={disease.diseaseId}>
                            <input
                            type="checkbox"
                            checked={selectedDiseases.includes(disease)}
                            onChange={(e)=> handleCheckboxChangeDiseases(e,disease)}
                            />
                            {disease.diseaseName}
                        </label>
                        ))}
                </div>

                <div className="selectedPestWrapper">

                </div>


            </div>            



            {contents.map((content,index)=>{
                return(

                    <div className="contentWrapper">
                        <div className="contentWrapperHeaderWrapper">
                            <RemoveCircleIcon sx={{fontSize: 30}} onClick={() => handleRemoveContent(index)}/>
                        </div>

                        <TextField sx={{width:'95%'}} value={content.header}  id="standard-basic" label="Content Header..." variant="standard"
                        
                            onChange={(e)=>{
                                const newHeader = e.target.value;
                                setContents((prev)=>
                                    prev.map((item,i)=>
                                        i===index ? {...item,header:newHeader} : item
                                    )
                                )
                            }}
                        
                        
                        />

                        <TextField
                            value={content.content}
                            id="outlined-multiline-static"
                            label="Content Body..."
                            multiline
                            rows={15}
                            defaultValue="Default Value"
                            sx={{marginTop:'30px',width:'95%'}}


                            onChange={(e)=>{
                                const newContent = e.target.value;
                                setContents((prev)=>
                                    prev.map((item,i)=>
                                        i===index ? {...item,content:newContent} : item
                                    )
                                )
                            }}



                            />

                    </div>
                )
            })}


            <Button onClick={handleAddContent} className="createButton" sx={{ marginTop: '10px' }}>Create new content wrapper</Button>



            <Button onClick={()=>setOpenUploadConfirm(true)} className="createButton" sx={{ marginTop: '10px' }}>Upload Crop Data</Button>






        </div>
        </>
    )
}