import { useNavigate } from 'react-router-dom';
import './DiseaseDatabase.css'
import { Button, MenuItem, Select, TextField } from "@mui/material";
import DiseaseCard from '../../Components/DiseaseCard/DiseaseCard';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../../firebaseconfig';
import { collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore';


interface diseaseType{
    DiseaseName:string,
    DiseaseSnapshot:string,
    DiseaseId:string
}
export default function DiseaseDatabase(){



    const [selectedOption,setSelectedOption] = useState("Descending");
    const [diseases,setDiseases] = useState<diseaseType[]>([]);
    const [sortedPests,setSortedPests] = useState<diseaseType[]>([])
    const [lastDoc,setLastDoc] = useState<any>(null);
    const [searchTerm,setSearchTerm] = useState("");
    const [debouncedSearch,setDebouncedSearch] = useState("");
    const [loading,setLoading] = useState(false);




    useEffect(()=>{

        const fetchDiseases = async()=>{

            try{
                const diseaseRef = collection(db,'Disease')
                const diseaseSnap = await getDocs(diseaseRef)


                if(diseaseSnap){
                    const rawData = diseaseSnap.docs.map(doc=>({

                        DiseaseName:doc.data().CommonName || "",
                        DiseaseSnapshot:doc.data().DiseaseSnapshot || "",
                        DiseaseId:doc.id
                    }))

                    setDiseases(rawData)    
                }


           


            }catch(err){

            }

        }
        fetchDiseases()
        

    },[])


    const fetchDisease = useCallback(

        async (isLoadMore = false,search:string = "")=>{

            setLoading(true);
            console.log("fetching disease (1)...")

            try{

                let q;
                const diseaseRef = collection(db,"Disease");
                console.log("fetching disease (1) [diseaseRef]...",diseaseRef)
                if(search){

                    q= query(
                        diseaseRef,
                        where("CommonName",">=", search),
                        where("CommonName","<=", search + "\uf8ff"),
                        orderBy("CommonName"),
                        limit(20)
                    )
                } else {

                    q = lastDoc
                    ? query(
                        diseaseRef,
                        orderBy("CommonName","desc"),
                        startAfter(lastDoc),
                        limit(20)
                    ) : query(diseaseRef,orderBy("CommonName","desc"), limit(20))
                }


                const snap = await getDocs(q);

                console.log("fetching disease (2) [disease snap]...",snap)
                if(!snap.empty){
                    const rawData = snap.docs.map((doc)=>({

                        DiseaseName:doc.data().CommonName || "",
                        DiseaseSnapshot:doc.data().DiseaseSnapshot || "",
                        DiseaseId:doc.id
                    }));
                    console.log("fetching pest (3) [pest raw data]...",rawData)
                    setDiseases((prev) => {
                        const combined = isLoadMore ? [...prev, ...rawData] : rawData;
                        return combined.filter(
                            (item, index, self) =>
                            index === self.findIndex((t) => t.DiseaseId === item.DiseaseId)
                        );
                    });

                    setLastDoc(snap.docs[snap.docs.length - 1]);
                } else if (!isLoadMore) {
                    setDiseases([])
                }

            } catch(err){
                console.log("Error fetching Disease: ", err)
            } finally {
                setLoading(false);
                console.log("Fetching Disease success")
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
        fetchDisease(false,debouncedSearch);
    },[debouncedSearch])
    
        //initial fetch
    
    useEffect(()=>{
        fetchDisease(false,debouncedSearch)
    },[])

    //resort
    useEffect(()=>{
    if(diseases.length > 0){
        const sorted = [...diseases].sort((a,b)=>{
            return selectedOption === "Descending" 
            ? b.DiseaseName.localeCompare(a.DiseaseName)
            : a.DiseaseName.localeCompare(b.DiseaseName)
        }
        )
        setSortedPests(sorted)
    }else {
        setSortedPests([])
        }
    },[diseases,selectedOption])

    const handleChange = (event: any) => {
    setSelectedOption(event.target.value);
    };
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    };

    const navigate = useNavigate();

    const navigateToDiseaseUpload = () => {
        navigate('/admin/disease_upload')
    }

    return(
        <>


        <div className="mainWrapper">

            <div className="headerWrapper_diseaseDB">
                
                <p className="headerSection__primary">Disease Database</p>
                <span className="headerSection__secondary">Manage your disease database</span>
                <hr />
     
            </div>



            <div className="contentWrapper_diseaseDB">
                    <div className="filterWrapper">
                        <Button sx={{backgroundColor:'#607D8B',height: '40px',}}  variant="contained" onClick={navigateToDiseaseUpload}>Create New Crop Data</Button>



                        <div className="filterWrapper__searchWrapper">
                            <TextField 
                                variant="outlined"
                                label="Search"
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
                    sortedPests.map((disease) => (
                           <DiseaseCard DiseaseId={disease.DiseaseId} DiseaseName={disease.DiseaseName} DiseaseSnapshot={disease.DiseaseSnapshot}/>
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
                        onClick={() => fetchDisease(true)}
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