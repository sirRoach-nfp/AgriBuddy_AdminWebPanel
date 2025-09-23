import { Button, MenuItem, Select, TextField } from "@mui/material";

import './PestDatabase.css'
import PestCard from "../../Components/PestCard/PestCard";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, limit, orderBy, query, startAfter, where } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import { CropSharp } from "@mui/icons-material";






interface pestType{

    CommonName:string,
    ScientificName:string,
    PestSnapshot:string,
    PestId:string
}

export default function PestDatabase() {


    



    //states
    const [selectedOption,setSelectedOption] = useState("Descending");
    const [pests,setPests] = useState<pestType[]>([])
    const [sortedPests,setSortedPests] = useState<pestType[]>([])
    const [lastDoc,setLastDoc] = useState<any>(null);
    const [searchTerm,setSearchTerm] = useState("");
    const [debouncedSearch,setDebouncedSearch] = useState("");
    const [loading,setLoading] = useState(false);





    const fetchPest = useCallback(

        async (isLoadMore = false,search:string = "")=>{

            setLoading(true);
            console.log("fetching pest (1)...")

            try{

                let q;
                const pestRef = collection(db,"Pest");
                console.log("fetching pest (1) [pestRef]...",pestRef)
                if(search){

                    q= query(
                        pestRef,
                        where("CommonName",">=", search),
                        where("CommonName","<=", search + "\uf8ff"),
                        orderBy("CommonName"),
                        limit(20)
                    )
                } else {

                    q = lastDoc
                    ? query(
                        pestRef,
                        orderBy("CommonName","desc"),
                        startAfter(lastDoc),
                        limit(20)
                    ) : query(pestRef,orderBy("CommonName","desc"), limit(20))
                }


                const snap = await getDocs(q);
                console.log("fetching pest (2) [pest snap]...",snap)
                if(!snap.empty){
                    const rawData = snap.docs.map((doc)=>({
                        CommonName:doc.data().CommonName || "",
                        ScientificName:doc.data().ScientificName || "",
                        PestSnapshot:doc.data().PestSnapshot || "",
                        PestId:doc.id
                    }));
                    console.log("fetching pest (3) [pest raw data]...",rawData)
                    setPests((prev) => {
                    const combined = isLoadMore ? [...prev, ...rawData] : rawData;
                    return combined.filter(
                        (item, index, self) =>
                        index === self.findIndex((t) => t.PestId === item.PestId)
                    );
                    });
                    setLastDoc(snap.docs[snap.docs.length - 1]);
                } else if (!isLoadMore) {
                    setPests([])
                }

            } catch(err){
                console.log("Error fetching crops: ", err)
            } finally {
                setLoading(false);
                console.log("Fetching pest success")
            }
            
        },
        [lastDoc]
    )


    //debounce 

    useEffect(()=>{
        const handler = setTimeout(()=>{
            setDebouncedSearch(searchTerm);
            setLastDoc(null)            
        },500)
        return()=> clearTimeout(handler)
    },[searchTerm])


    useEffect(()=>{
        fetchPest(false,debouncedSearch);
    },[debouncedSearch])

    //initial fetch

    useEffect(()=>{
        fetchPest(false,debouncedSearch)
    },[])


    //resort
    useEffect(()=>{
        if(pests.length > 0){
            const sorted = [...pests].sort((a,b)=>{
                return selectedOption === "Descending" 
                ? b.CommonName.localeCompare(a.CommonName)
                : a.CommonName.localeCompare(b.CommonName)
            }
            )
            setSortedPests(sorted)
        }else {
            setSortedPests([])
        }
    },[pests,selectedOption])



    const handleChange = (event: any) => {
    setSelectedOption(event.target.value);
    };
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    };


    const navigate = useNavigate()

    const navigateToPestUpload = () =>{

        navigate('/admin/pest_upload')
    }
    return(
        <>
        
            <div className="mainWrapper">
                
                    <div className="headerWrapper_PestDb">
                       
                        <p className="headerSection__primary">Pest Database</p>
                        <span className="headerSection__secondary">Manage your crop data</span>
                        <hr />
                    </div>



                    <div className="contentWrapper_PestDb">
                        <div className="filterWrapper">
                                                <Button sx={{backgroundColor:'#607D8B',height: '40px',}}  variant="contained" onClick={navigateToPestUpload}>Create New Crop Data</Button>



                            <div className="filterWrapper__searchWrapper">
                                <TextField 
                                    variant="outlined"
                                    label="Search"
                                    value={searchTerm}
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
                            
              



                            
                            {sortedPests.length > 0 ? (
                            sortedPests.map((pest) => (
                                 <PestCard CommonName={pest.CommonName} PestDocuId={pest.PestId} PestSnapshot={pest.PestSnapshot}ScientificName={pest.ScientificName}/>
                            ))
                            ) : (
                            <p className="fullWidth">No Crop Data found</p>
                            )}
                
                            {!debouncedSearch && sortedPests.length > 0 && (
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
                                onClick={() => fetchPest(true)}
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

function useCallBack(arg0: (isLoadMore?: boolean, search?: string) => Promise<void>) {
    throw new Error("Function not implemented.");
}
