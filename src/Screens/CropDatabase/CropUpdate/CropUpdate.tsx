import TextField from "@mui/material/TextField";
import { ChangeEvent, forwardRef, useEffect, useState } from "react";
import Select from "react-select";
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


//icon import
import { BugOff, Calendar, CheckLine, NotepadText, Sprout, SquarePlus, Worm } from "lucide-react";
import { Box, Checkbox, FormControl, FormControlLabel, FormGroup, InputLabel,MenuItem,Select as MuiSelect  } from "@mui/material";



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

type BestSeason =
  | { start: number; end: number } // old data
  | { months: number[] }; // new data


//all pest data dummy
export default function CropUpdate(){


    const {id} = useParams()
    const navigate = useNavigate()
    const [contents,setContents] = useState<contentsInt[]>([]);
    const [reference,setReference] = useState<referenceInt[]>([])
    
    const[deleteCode,setDeleteCode] = useState('')

    const [pestSelection,setPestSelection] = useState<Pest[]>([]);
    const[diseaseSelection,setDiseaseSelection] = useState<Disease[]>([]);

    /*
    const [bestSeason, setBestSeason] = useState<{ start: number | "", end: number | "" }>({
        start: "",
        end: "",
    });*/

    const [bestSeason, setBestSeason] = useState<BestSeason>({ months: [] });

    const [cover,setCover] = useState<File | string>('');
    const [seedToHectare,setSeedToHectare] = useState<number>()
    const[cropName,setCropName] = useState("");
    const[scientificName,setScientificName] = useState("");
    const[family,setFamily] = useState("");
    const [growthTime,setGrowthTime] = useState("");

    const[soilPh,setSoilPh] = useState("");
    const[soilType,setSoilType] = useState<string[]>([]);

    const convertToArray = (data?: BestSeason): number[] => {
        if (!data) return [];
        if ("months" in data) return data.months; // new format
        const { start, end } = data;
        if (start && end) {
        return start <= end
            ? Array.from({ length: end - start + 1 }, (_, i) => start + i)
            : Array.from({ length: 12 - start + end + 1 }, (_, i) => ((start + i - 1) % 12) + 1);
        // handles wrap-around like Nov → Feb
        }
        return [];
    };

    const [selectedMonths, setSelectedMonths] = useState<number[]>(
    []
  );

    const handleToggleMonth = (monthValue: number) => {
        setSelectedMonths((prev) =>
        prev.includes(monthValue)
            ? prev.filter((m) => m !== monthValue)
            : [...prev, monthValue].sort((a, b) => a - b)
        );
    };


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


    useEffect(() => {
    const fetchCropData = async () => {
      try {
        console.log("Fetching Document with the id of : ", id);

        const docRef = doc(db, "Crops", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          setCover(data.cropCover ?? "");
          setCropName(data.cropName ?? "");
          setScientificName(data.scientificName ?? "");
          setFamily(data.family ?? "");
          setGrowthTime(data.growthTime ?? "");
          setSoilPh(data.soilPh ?? "");
          setSelectedDiseases(data.diseases ?? []);
          setSelectedPests(data.pests ?? []);
          setContents(data.contents ?? []);
          setSoilType(data.soilType ?? []);
          setSeedToHectare(data.seedRatio ?? undefined);
          setReference(data.reference ?? []);

          // Backward compatibility: read bestSeason or optimalSeason
          const seasonData = data.bestSeason ?? data.optimalSeason;
          const monthsFromData = convertToArray(seasonData);
          setSelectedMonths(monthsFromData);
          setBestSeason({ months: monthsFromData });
        }

        // fetch pests
        const pestsRef = collection(db, "Pest");
        const pestSnap = await getDocs(pestsRef);
        if (pestSnap) {
          const rawData = pestSnap.docs.map((d) => ({
            pestId: d.id,
            pestName: d.data().CommonName || "",
            pestCoverImage: d.data().PestSnapshot || "",
          }));
          setPestSelection(rawData);
        }

        // fetch diseases
        const diseaseRef = collection(db, "Disease");
        const diseaseSnap = await getDocs(diseaseRef);
        if (diseaseSnap) {
          const rawData = diseaseSnap.docs.map((d) => ({
            diseaseId: d.id,
            diseaseName: d.data().CommonName || "",
            diseaseCoverImage: d.data().DiseaseSnapshot || "",
          }));
          setDiseaseSelection(rawData);
        }
      } catch (err) {
        console.error("Error fetching crop data:", err);
      }
    };

    fetchCropData();
  }, [id]);



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
            }else if (!seedToHectare || seedToHectare < 0) {
                toast.error("Seed to hectare ratio is required.");
                return;
            }else if (!bestSeason){
                toast.error("Optimal season range is required.");
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


            // Prepare season object to save — ALWAYS save new format { months: [] }
            const sortedMonths = [...selectedMonths].sort((a, b) => a - b);
            const seasonToSave = { months: sortedMonths };

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
                soilType:soilType,
                optimalSeason:seasonToSave,
                seedRatio:seedToHectare,
                reference:reference,
            }
            console.log("Season to save : ", seasonToSave)
            console.log("Sorted Months : ", sortedMonths)
            console.log("Selected month : ", selectedMonths)
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
                    <div className="headerWrapper_info">

                        < Sprout/>
                        <div className="headerWrapper_info_text">
                            
                            <p className="headerWrapper_info_text_primary">Crop Data Editor</p>
                            <span className="headerWrapper_info_text_secondary">Edit and manage crop data</span>
                        </div>
                    </div>


                    <div className="headerWrapper_ArticleEdit_buttonWrappers">
                        <Button variant="contained"  sx={{height:'40px', backgroundColor:'red'}} onClick={()=>setOpenDeleteConfirm(true)}>Delete Crop Data</Button>
                        <Button variant="contained"  sx={{height:'40px',backgroundColor:'#607D8B'}} onClick={()=>setOpenUpdateConfirm(true)}>Save Changes</Button>
                    </div>

            </div>



        <div className="thumbnailWrapper">

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
        
        {/* Optimal Season (checkbox months) */}
        <div className="bestSeasonWrapper">
          <div className="sectionHeader">
            <div
              className="headerIconWrapper"
              style={{ backgroundColor: "#FFEED0" }}
            >
              <Calendar size={"20px"} color="#DD8057" />
            </div>
            <span className="sectionHeader__Primary">Optimal Season</span>
          </div>

          <Box sx={{ marginTop: "15px" }}>
     
            <FormGroup
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                flexDirection: "row",
              }}
            >
              {months.map((m) => (
                <FormControlLabel
                  key={m.value}
                  control={
                    <Checkbox
                      checked={selectedMonths.includes(m.value)}
                      onChange={() => handleToggleMonth(m.value)}
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

        {contents && contents.length > 0 && contents.map((content: { header: unknown; content: unknown; },index: number)=>{
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






        <Button variant="outlined" onClick={handleAddContent} className="createButton" sx={{ marginTop: '10px' }}>Create new content wrapper</Button>
        
    </div>

        
    </>)
}