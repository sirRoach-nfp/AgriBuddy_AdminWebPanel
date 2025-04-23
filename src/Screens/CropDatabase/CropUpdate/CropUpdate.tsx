import TextField from "@mui/material/TextField";
import { ChangeEvent, forwardRef, useEffect, useState } from "react";

import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../../firebaseconfig";
import { collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";

import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import Button from "@mui/material/Button";

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toast } from "react-toastify";

//dialog imports
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';


interface contentsInt{
    id: number,
    header:string,
    content: string
}



interface contentsInt{
    id: number,
    header:string,
    content: string
}


type Pest = {
    pestId: string;
    pestName: string;
    pestCoverImage: string;
    };


type Disease = {
    diseaseId: string;
    diseaseName: string;
    diseaseCoverImage: string;
}


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

//all pest data dummy
export default function CropUpdate(){


    const {id} = useParams()
    const navigate = useNavigate()
    const [contents,setContents] = useState<contentsInt[]>([]);
    const[deleteCode,setDeleteCode] = useState('')

    const [pestSelection,setPestSelection] = useState<Pest[]>([]);
    const[diseaseSelection,setDiseaseSelection] = useState<Disease[]>([]);


    const [cover,setCover] = useState<File | string>('');
    const[cropName,setCropName] = useState("");
    const[scientificName,setScientificName] = useState("");
    const[family,setFamily] = useState("");
    const [growthTime,setGrowthTime] = useState("");
    const[bestSeason,setBestSeason] = useState("");
    const[soilPh,setSoilPh] = useState("");
    const[soilType,setSoilType] = useState<string[]>([]);



    const handleCheckboxChangeSoil = (soil: string) => {
        setSoilType((prevSelected) =>
          prevSelected.includes(soil)
            ? prevSelected.filter((s) => s !== soil)
            : [...prevSelected, soil]
        );
      };




    const [selectedPests, setSelectedPests] = useState<Pest[]>([]);
    const [selectedDiseases,setSelectedDiseases] = useState<Disease[]>([]);
    
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



    const isPestSelected = (pestId: string) =>selectedPests.some((p) => p.pestId === pestId);


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


    useEffect(()=>{
        
        const fetchCropData = async () => {

            console.log("Fetching Document with the id of : ", id);



            try{


                const docRef = doc(db, "Crops", id as string);
                const docSnap = await getDoc(docRef);
                console.log("Returned Data : ", docSnap.data())


                if(docSnap.exists()){


                    setCover(docSnap.data().cropCover)
                    setCropName(docSnap.data().cropName)
                    setScientificName(docSnap.data().scientificName)
                    setFamily(docSnap.data().family)
                    setGrowthTime(docSnap.data().growthTime)
                    setBestSeason(docSnap.data().bestSeason)
                    setSoilPh(docSnap.data().soilPh)
                    setSelectedDiseases(docSnap.data().diseases)
                    setSelectedPests(docSnap.data().pests)
                    setContents(docSnap.data().contents)
                    setSoilType(docSnap.data().soilType)
                }


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

                console.log("Fetch Done !")




                

            }catch(err){

            }
        }

        fetchCropData()
    },[id])



    const deleteCrop = async()=>{


        try{
            setOpenDeleteConfirm(false)
            if(deleteCode !== "DELETE CROP"){toast.warning("Crop deletion is aborted ! Wrong Code");return}

            const cropRef = doc(db,'Crops',id as string)
            await deleteDoc(cropRef)
            toast.success("Crop Data was deleted Successfully");
            navigate("/admin/crop_database")
        }catch(err){
            console.error(err)
        }
    }


    const updateCrop = async()=>{


        try{

            setOpenUpdateConfirm(false)
            let newCover = cover;


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
            else if(selectedDiseases.length === 0){
                toast.error("Selected Diseases cannot be empty");
                return;
            }
            else if(selectedPests.length === 0){
                toast.error("Selected Diseases cannot be empty");
                return;
            }


            if(cover&& typeof cover !== 'string'){

                console.log("Uploading image change .........")
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
                    console.log("Upload image success : ", data.secure_url)
                    setCover(data.secure_url)
                    newCover = data.secure_url
                }else{
                    console.error("Upload failed : ", data)
                }
            }



            const UpdatedCrop = {
                //cropId: cropName + Date.now().toString(),
                cropName: cropName,
                cropCover:newCover,
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
            console.log("Updated Crop : ", UpdatedCrop)


            const cropRef = doc(db,'Crops',id as string)
            await updateDoc(cropRef,UpdatedCrop)

            toast.success("Crop data was updated successfully");
            navigate("/admin/Crop_database")

        }catch(err){console.error(err)}
    }




    const Transition = forwardRef(function Transition(
        props: TransitionProps & {
          children: React.ReactElement<any, any>;
        },
        ref: React.Ref<unknown>,
      ) {
        return <Slide direction="up" ref={ref} {...props} />;
      });



    const [openDeleteConfirm,setOpenDeleteConfirm] = useState(false);
    const [openUpdateConfirm,setOpenUpdateConfirm] = useState(false);

    const deleteDialog = ()=> (

      <Dialog
        open={openDeleteConfirm}

        keepMounted
        onClose={() =>setOpenDeleteConfirm(false)}
        aria-describedby="alert-dialog-slide-description"
      >

        <DialogTitle sx={{color:'red'}}>{"Delete Crop Data From The Database?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description" sx={{color:'red'}}>
                Deleting this crop data will permanently remove it from the system.
                This action may impact user experience by erasing the crop from their tracking lists and disabling related features.

                This action cannot be undone.
                Are you sure you want to continue?
                
          </DialogContentText>

          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="email"
            label="Please type 'DELETE CROP' to confirm"
            type="email"
            fullWidth
            variant="standard"
            onChange={(e)=>setDeleteCode(e.target.value)}
          />
        </DialogContent>



        <DialogActions>
          <Button onClick={() =>setOpenUpdateConfirm(false)}>Cancel Action</Button>
          <Button onClick={() =>deleteCrop()}>Continue</Button>
        </DialogActions>
      </Dialog>


    )

    const updateDialog = ()=> (

        <Dialog
          open={openUpdateConfirm}
  
          keepMounted
          onClose={() =>setOpenUpdateConfirm(false)}
          aria-describedby="alert-dialog-slide-description"
        >
  
          <DialogTitle >{"Update Crop Data ?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description" >
                Updating this crop data will affect all users who are currently tracking this crop.

                Changes may impact crop-specific recommendations, notifications, and user history.

                Please ensure the new information is accurate before proceeding.
                  
            </DialogContentText>

          </DialogContent>
  
  
  
          <DialogActions>
            <Button onClick={() =>setOpenUpdateConfirm(false)}>Cancel Action</Button>
            <Button onClick={() =>updateCrop()}>Continue</Button>
          </DialogActions>
        </Dialog>
  
  
      )

    return(<>

        {deleteDialog()}
        {updateDialog()}
        <div className="mainWrapper_cropUpdate">



            <div className="headerWrapper_ArticleEdit">

                    <div className="backWrapper_ArticleEdit">
                        <ArrowBackIcon sx={{fontSize:30,marginTop:0,marginBottom:0}}/>
                        <span className="backText_ArticleEdit">Return</span>
                    </div>
                    <Button variant="contained"  sx={{marginLeft:'auto', backgroundColor:'red'}} onClick={()=>setOpenDeleteConfirm(true)}>Delete Crop Data</Button>
                    <Button variant="contained"  sx={{marginLeft:'5px'}} onClick={()=>setOpenUpdateConfirm(true)}>Save Changes</Button>

            </div>



            <div className="thumbnailWrapper_cropUpload">

                <img src={typeof cover === 'string' ? cover : URL.createObjectURL(cover)} alt="" className="coverImage_cropUpload" />

                <div className="uploadButtonWrapper">

                    <input type="file" id="cover" style={{display: "none"}} onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                            setCover(e.target.files[0]);
                            }
                        }}/>

                    <label htmlFor="cover"><InsertPhotoIcon style={{color:"white", fontSize:"70px",  cursor:"pointer"}}/></label>
                </div>

            </div>
        

        <TextField value={cropName} onChange={(e)=>setCropName(e.target.value)} sx={{marginTop:'30px',fontSize:'30px',width:'100%'}} id="standard-basic" label="Crop Name....." variant="standard" />
        <TextField value={scientificName} onChange={(e)=>setScientificName(e.target.value)} sx={{marginTop:'30px',fontSize:'30px',width:'100%'}} id="standard-basic" label="Scientific Name....." variant="standard" />
        <TextField value={family} onChange={(e)=>setFamily(e.target.value)} sx={{marginTop:'30px',fontSize:'30px',width:'100%'}} id="standard-basic" label="Crop Family....." variant="standard" />
        <TextField value={growthTime} onChange={(e)=>setGrowthTime(e.target.value)} sx={{marginTop:'30px',fontSize:'30px',width:'100%'}} id="standard-basic" label="Growth Time....." variant="standard" />
        <TextField value={bestSeason} onChange={(e)=>setBestSeason(e.target.value)} sx={{marginTop:'30px',fontSize:'30px',width:'100%'}} id="standard-basic" label="Best Season....." variant="standard" />
        <TextField value={soilPh} onChange={(e)=>setSoilPh(e.target.value)} sx={{marginTop:'30px',fontSize:'30px',width:'100%'}} id="standard-basic" label="Soil PH....." variant="standard" />
        



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
                {diseaseSelection!.map((disease) => (
                    <label key={disease.diseaseId}>
                        <input
                        type="checkbox"
                        checked={selectedDiseases.some((p) => p.diseaseId === disease.diseaseId)}
                        onChange={(e)=>handleCheckboxChangeDiseases(e,disease)}
                        />
                        {disease.diseaseName}
                    </label>
                    ))}
            </div>

            <div className="selectedPestWrapper">

            </div>


        </div>

        {contents && contents.length > 0 && contents.map((content,index)=>{
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
        
        </div>

        
    </>)
}