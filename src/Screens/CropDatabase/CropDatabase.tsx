import { Button, TextField } from "@mui/material";
import "./CropDatabase.css"
import CropCard from "../../Components/CropCard/CropCard";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query, startAfter, where } from "firebase/firestore";

import { db } from "../../firebaseconfig";
//MUI imports
import AccountCircle from '@mui/icons-material/AccountCircle';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';



interface cropData{
    cropId:string,
    cropName:string,
    cropScientificName:string,
    cropCoverImage:string
}
export default function CropDatabase() {

    const navigate = useNavigate();

    

    const navigateToUpload = () => {
        navigate('/admin/crop_upload')
    }



    //states
    const [selectedOption, setSelectedOption] = useState("Descending");
    const [crops,setCrops] = useState<cropData[]>([])
    const [sortedCrops,setSortedCrops] = useState<cropData[]>([])
    const [lastDoc,setLastDoc] = useState<any>(null);
    const[searchTerm,setSearchTerm] = useState("");
    const[debouncedSearch,setDebouncedSearch] = useState("");
    const[loading,setLoading] = useState(false);


const fetchCrops = useCallback(


  async (isLoadMore = false, search: string = "") => {
    setLoading(true);
    console.log("Fetching crops....")
    try {
      let q;
      const cropsRef = collection(db, "Crops");
      console.log("Fetching crops [crops ref]....",cropsRef)
      if (search) {
        // Search mode
        q = query(
          cropsRef,
          where("cropName", ">=", search),
          where("cropName", "<=", search + "\uf8ff"),
          orderBy("cropName"),
          limit(20)
        );
      } else {
        // Normal fetch with pagination
        q = lastDoc
          ? query(
              cropsRef,
              orderBy("cropName", "desc"),
              startAfter(lastDoc),
              limit(20)
            )
          : query(cropsRef, orderBy("cropName", "desc"), limit(20));
      }

      console.log("Fetching crops [q]....",q)
      const snap = await getDocs(q);
      console.log("Fetching Crops [snap]...",snap)
      if (!snap.empty) {
        const rawData = snap.docs.map((doc) => ({
          cropId: doc.id,
          cropName: doc.data().cropName || "",
          cropScientificName: doc.data().scientificName || "",
          cropCoverImage: doc.data().cropCover || ""
        }));

        console.log("Fetching Crops [rawdata]...",rawData)

        setCrops((prev) => {
        const combined = isLoadMore ? [...prev, ...rawData] : rawData;
        return combined.filter(
            (item, index, self) =>
            index === self.findIndex((t) => t.cropId === item.cropId)
        );
        });
        setLastDoc(snap.docs[snap.docs.length - 1]);
      } else if (!isLoadMore) {
        setCrops([]);
      }
    } catch (err) {
      console.error("Error fetching crops: ", err);
    } finally {
      setLoading(false);
      console.log("Fetching crops Success")
    }
  },
  [lastDoc] // ✅ dependency
);



//debounce 
useEffect(()=>{
    const handler = setTimeout(()=>{
        setDebouncedSearch(searchTerm);
        setLastDoc(null);
    },500)

    return () => clearTimeout(handler);
},[searchTerm])


useEffect(() => {
    fetchCrops(false,debouncedSearch);
},[debouncedSearch])

//initial fetch

useEffect(() => {
    fetchCrops(false,"");
},[])



// resort
useEffect(()=>{

    if(crops.length > 0) {
        const sorted = [...crops].sort((a,b)=> {
            return selectedOption === "Descending"
            ? b.cropName.localeCompare(a.cropName) // Z–A
            : a.cropName.localeCompare(b.cropName); // A–Z
        })
        setSortedCrops(sorted);
    } else {
        setSortedCrops([])
    }

}, [crops,selectedOption])



    


const handleChange = (event: any) => {
    setSelectedOption(event.target.value);
};
const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
setSearchTerm(e.target.value);
};

return(
    <>


        <div className="mainWrapper">

                <div className="headerWrapper">

                    <p className="headerSection__primary">Crop Database</p>
                    <span className="headerSection__secondary">Manage your crop data</span>
                    <hr />
                

                </div>
        

                <div className="contentWrapper_CropDb">

                <div className="filterWrapper">
                    <Button sx={{backgroundColor:'#607D8B',height: '40px',}}  variant="contained" onClick={navigateToUpload}>Create New Crop Data</Button>



                    <div className="filterWrapper__searchWrapper">
                        <TextField 
                            variant="outlined"
                            label="Search"
                            value = {searchTerm}
                            onChange={handleSearchChange}
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

                        <Select
                            labelId="dropdown-label"
                            value={selectedOption}
                            onChange={handleChange}
                            sx={{
                            height: "40px",
                            minWidth: 120,
                            "& .MuiSelect-select": {
                                padding: "10px 14px"
                            }
                            }}
                        >
                            <MenuItem value="Ascending">A-Z</MenuItem>
                            <MenuItem value="Descending">Z-A</MenuItem>
                        </Select>
                        

                    </div>


                    </div>

                    <div className="articleCardsWrapper">






                        {sortedCrops.length > 0 ? (
                        sortedCrops.map((crop) => (
                            <CropCard key={crop.cropId} cropName={crop.cropName} cropCoverImage={crop.cropCoverImage} cropScientificName={crop.cropScientificName} cropId={crop.cropId}/>
                        ))
                        ) : (
                        <p className="fullWidth">No Crop Data found</p>
                        )}
            
                        {!debouncedSearch && sortedCrops.length > 0 && (
                        <div className="fullWidth">
                            <Button
                            variant="outlined"
                            style={{ width: "100%" }}
                            sx={{
                                mt: 2,
                                backgroundColor: "#607D8B",
                                color: "white",
                                border: 0
                            }}
                            disabled={loading}
                            onClick={() => fetchCrops(true)}
                            >
                            {loading ? "Loading..." : "Load More"}
                            </Button>
                        </div>
                        )}
                        
                
                    </div>
                </div>

        </div>
    
        
        </>
    )
}