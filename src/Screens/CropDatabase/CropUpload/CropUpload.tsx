
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import Select from "react-select";


import TextField from '@mui/material/TextField';
import './CropUpload.css'
import { ChangeEvent, useEffect, useState } from 'react';
import '../../../global.css'
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
import { Box, Checkbox, FormControl, FormControlLabel, FormGroup, InputLabel,MenuItem,Select as MuiSelect } from '@mui/material';
import { BugOff, Calendar, CheckLine, NotepadText, SquarePlus, Worm } from 'lucide-react';


interface contentsInt{
    id: number,
    header:string,
    content: string
}

interface referenceInt{
    id:number,
    referenceTitle:string,
    referenceLink:string,

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


type BestSeason = {
    months:number[]
}

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

const months = [
  { name: "January", value: 1 },
  { name: "February", value: 2 },
  { name: "March", value: 3 },
  { name: "April", value: 4 },
  { name: "May", value: 5 },
  { name: "June", value: 6 },
  { name: "July", value: 7 },
  { name: "August", value: 8 },
  { name: "September", value: 9 },
  { name: "October", value: 10 },
  { name: "November", value: 11 },
  { name: "December", value: 12 },
];

export default function CropUpload(){



    const navigate = useNavigate()

    const[pestSelection,setPestSelection] = useState<Pest[]>([]);
    const[diseaseSelection,setDiseaseSelection] = useState<Disease[]>([]);

    /*
    const [bestSeason, setBestSeason] = useState<{ start: number | "", end: number | "" }>({
        start: "",
        end: "",
    });
    */

    const [bestSeason, setBestSeason] = useState<BestSeason>({ months: [] });


    const handleToggle = (monthValue: number) => {
        setBestSeason((prev) => {
        const isSelected = prev.months.includes(monthValue);
        const updatedMonths = isSelected
            ? prev.months.filter((m) => m !== monthValue)
            : [...prev.months, monthValue];
        return { ...prev, months: updatedMonths };
        });
    };

    

    const [contents,setContents] = useState<contentsInt[]>([]);
    const [reference,setReference] = useState<referenceInt[]>([])

    const [cover, setCover] = useState<File | null>(null);

    const [seedToHectare,setSeedToHectare] = useState<number>()

    const[cropName,setCropName] = useState("");
    const[scientificName,setScientificName] = useState("");
    const[family,setFamily] = useState("");
    const [growthTime,setGrowthTime] = useState("");
    
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

            else if(!family || family.length === 0){
                toast.error("Plant Family is required.");
                return;
            }
            else if(!soilPh || soilPh.length === 0){
                toast.error("Soil PH is required.");
                return;
            }else if (!seedToHectare || seedToHectare < 0) {
                toast.error("Seed to hectare ratio is required.");
                return;
            }else if (!bestSeason){
                toast.error("Optimal season range is required.");
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
                soilType:soilType,
                optimalSeason:bestSeason,
                seedRatio:seedToHectare,
                reference:reference,
            }


           

            const CropRef = doc(db,'Crops',cropNameAsDocId)

           
            console.log("New Crop Data : ", newCrop)
            await setDoc(CropRef,newCrop)
            toast.success("Crop data was uploaded successfully");
            navigate("/admin/crop_database")
           
           
           
           console.log("Data set : ", newCrop)

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
        <div className="mainWrapper">


            <div className="thumbnailWrapper">

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
                        Crop Name
                    </span>
                    <TextField value={cropName} 
                        onChange={(e)=>setCropName(e.target.value)} 
                        sx={{marginTop:'0px',fontSize:'1rem',width:'100%',borderRadius:'20px',

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
                        id="outlined-basic" 
                
                        InputLabelProps={{ shrink: false }}
                        variant="outlined" />
                </div>
                        
                <div className="inputWrapper">
                    <span className="inputWrapper__header__primary">
                        Scientific Name
                    </span>
                    <TextField value={scientificName} 
                        onChange={(e)=>setScientificName(e.target.value)} 
                        sx={{marginTop:'0px',fontSize:'1rem',width:'100%',

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
                        id="outlined-basic"
                        variant="outlined" />
                </div>

                <div className="inputWrapper">
                    <span className="inputWrapper__header__primary">
                        Crop Family
                    </span>
                    <TextField value={family} 
                        onChange={(e)=>setFamily(e.target.value)} 
                        sx={{marginTop:'0px',fontSize:'1rem',width:'100%',

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
                        Maturity Time (days)
                    </span>
                    <TextField value={growthTime} 
                        onChange={(e)=>setGrowthTime(e.target.value)} 
                        sx={{marginTop:'0px',fontSize:'1rem',width:'100%',

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
                        Seed To Hectare Ratio
                    </span>
                    <TextField type='number' 
                        value={seedToHectare} 
                        onChange={(e)=>setSeedToHectare(Number(e.target.value))} 
                        sx={{marginTop:'00px',fontSize:'30px',width:'100%',


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
                        id="outlined-basic" 
                        variant="outlined" />
                </div>


                <div className="inputWrapper">
                    <span className="inputWrapper__header__primary">
                        Soil pH Range
                    </span>
                   <TextField value={soilPh} onChange={(e)=>setSoilPh(e.target.value)} 
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
                        placeholder='e.g 6.4-7' 
                        id="outlined-basic"variant="outlined" />
                </div>


            </div>                        
          
            <div className="bestSeasonWrapper">
                <div className="sectionHeader">
                    <div className="headerIconWrapper" style={{backgroundColor:'#FFEED0'}}>
                  
                        <Calendar size={'20px'} color='#DD8057' />
                    </div>
                    <span className="sectionHeader__Primary">
                        Optimal Season
                    </span>
                </div>



                <Box sx={{ marginTop: "15px" }}>
         
                    <FormGroup sx={{ display: "flex", flexWrap: "wrap", gap: 1,flexDirection:'row' }}>
                        {months.map((m) => (
                        <FormControlLabel
                            key={m.value}
                            control={
                            <Checkbox
                                checked={bestSeason.months.includes(m.value)}
                                onChange={() => handleToggle(m.value)}
                            />
                            }
                            label={m.name}
                        />
                        ))}
                    </FormGroup>
                </Box>


            </div>
               
            <div className="referenceWrapper">
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

                        {reference.map((reference,index)=>{

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
            
            
            <div className="pestSelectionWrapper">

                <div className="sectionHeader">
                    <div className="headerIconWrapper" style={{backgroundColor:'#FDE3E4'}}>
                        <CheckLine size={'20px'} color='#CA5C67'/>
           
                    </div>
                    <span className="sectionHeader__Primary">
                        Suitable Soil Types
                    </span>
                </div>



                <div className="pestCheckBoxList">
                    {soilTypes.map((soil, index) => (
                    <label key={index} style={{fontSize:'1rem', display:'flex',flexDirection:'row',alignItems:'center',gap:'5px'}}>
                        <input
                        type="checkbox"
                        checked={soilType.includes(soil)}
                        onChange={() => handleCheckboxChangeSoil(soil)}
                        style={{width:'1rem',height:'1rem'}}
                        />
                        {soil}
                    </label>
                    ))}
                </div>

                <div className="selectedPestWrapper">

                </div>


            </div>


            
            <div className="pestSelectionWrapper">

                <div className="sectionHeader" style={{marginBottom:'10px'}}>
                    <div className="headerIconWrapper" style={{backgroundColor:'#FDE3E4'}}>
                     
                        <BugOff size={'20px'} color='#CA5C67' />
           
                    </div>
                    <span className="sectionHeader__Primary">
                        Related Pests
                    </span>
                </div>


                <Select
                    options={pestSelection.map((pest) => ({
                    value: pest.pestId,
                    label: pest.pestName,
                    }))}
                    isMulti
                    placeholder="Search and select pests..."
                    value={selectedPests.map((pest) => ({
                    value: pest.pestId,
                    label: pest.pestName,
                    }))}
                    onChange={(selected) => {
                    const updated = selected
                        ? pestSelection.filter((pest) =>
                            selected.some((sel) => sel.value === pest.pestId)
                        )
                        : [];
                    setSelectedPests(updated);
                    }}
                    isSearchable
                />


            </div>



            <div className="pestSelectionWrapper">

                <div className="sectionHeader" style={{marginBottom:'10px'}}>
                    <div className="headerIconWrapper" style={{backgroundColor:'#FDE3E4'}}>
                     
                    
                        <Worm size={'20px'} color='#CA5C67'/>
                    </div>
                    <span className="sectionHeader__Primary">
                        Related Diseases
                    </span>
                </div>


                <Select
                    options={diseaseSelection.map((disease) => ({
                    value: disease.diseaseId,
                    label: disease.diseaseName,
                    }))}
                    isMulti
                    placeholder="Search and select diseases..."
                    value={selectedDiseases.map((disease) => ({
                    value: disease.diseaseId,
                    label: disease.diseaseName,
                    }))}
                    onChange={(selected) => {
                    const updated = selected
                        ? diseaseSelection.filter((disease) =>
                            selected.some((sel) => sel.value === disease.diseaseId)
                        )
                        : [];
                    setSelectedDiseases(updated);
                    }}
                    isSearchable
                />

                <div className="selectedPestWrapper">

                </div>


            </div>            

            {contents.map((content,index)=>{
                return(

                    <div className="contentWrapper" style={{borderRadius:0,borderColor:'#e2e8f0'}}>
                        <div className="contentWrapperHeaderWrapper">
                            <RemoveCircleIcon sx={{fontSize: 30}} onClick={() => handleRemoveContent(index)}/>
                        </div>

                        <div className="inputWrapper">
                            <span className="inputWrapper__header__primary">
                                Content Header
                            </span>
                            <TextField sx={{width:'100%',
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

                            }} value={content.header}  id="outlined-basic" variant="outlined"
                        
                                onChange={(e)=>{
                                    const newHeader = e.target.value;
                                    setContents((prev)=>
                                        prev.map((item,i)=>
                                            i===index ? {...item,header:newHeader} : item
                                        )
                                    )
                                }}
                            
                        
                            />
                        </div>


                        

                        <div className="inputWrapper">
                            <span className="inputWrapper__header__primary">
                                Content Body
                            </span>
                            <TextField
                                value={content.content}
                                id="outlined-multiline"
                              
                                multiline
                                rows={15}
                                defaultValue="Default Value"
                                sx={{marginTop:'0px',width:'100%'}}


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



                    </div>
                )
            })}


            <div className="actionWrapper" style={{width:'100%',
                display:'flex',
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'space-between',
                padding:'10px 30px'
                }}>

                <Button variant="outlined" onClick={handleAddContent} className="createButton" sx={{ marginTop: '10px' }}>Create new content wrapper</Button>



                <Button variant="contained" onClick={()=>setOpenUploadConfirm(true)} className="createButton" sx={{ marginTop: '10px' }}>Upload Crop Data</Button>
    

            </div>







        </div>
        </>
    )
}