

import * as React from 'react';
import Button from '@mui/material/Button';
import './ReportedContent.css'
import ArticleCard from '../../Components/ArticleCard/ArticleCard';
import { useNavigate } from 'react-router-dom';

import { Outlet } from 'react-router-dom';
import { db } from '../../firebaseconfig';
import { collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore';

//MUI imports

import TextField from '@mui/material/TextField';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { useCallback, useState } from 'react';
import { Report } from '@mui/icons-material';
import ReportCard from '../../Components/ReportedCard/ReportCard';




type ReportType = {
  reportId:string;
  documentId: string;
  contentId: string; // document id
  contentType: string; // e.g. "Post", "Comment", "Crop Data"
  reason: string;
  //reporterId: string; 
  createdAt: any;
};

export default function ReportedContent(){



    const [reasonFilter,setReasonFilter] = React.useState("All")
    const [contentFilter,setContentFilter] = React.useState("All")
    const [reports, setReports] = useState<ReportType[]>([]);
    const [lastDoc, setLastDoc] = React.useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const handleReason = (event:any) => {
      setReasonFilter(event.target.value);
    };
    const handleContent = (event:any) => {
        setContentFilter(event.target.value)
    }


    const fetchReports = useCallback(
        async (isLoadMore = false) => {
        if (loading) return;

        setLoading(true);

        try {

            console.log("Fetching reports(1) ...")


            const reportsRef = collection(db, "Reports");
            let q: any = query(reportsRef, orderBy("CreatedAt", "desc"), limit(50));


             console.log("Fetching reports(2) ... [reportsRef]",reportsRef)
            // Apply filters if not "All"
            if (reasonFilter !== "All") {
            q = query(q, where("_reportReason", "==", reasonFilter));
            }
            if (contentFilter !== "All") {
            q = query(q, where("_reportType", "==", contentFilter));
            }

            if (isLoadMore && lastDoc) {
            q = query(q, startAfter(lastDoc));
            }

            const snapshot = await getDocs(q);

            const data = snapshot.docs.map((docSnap) => {
            const docData = docSnap.data() as Omit<ReportType, "documentId">;
            return { documentId: docSnap.id, ...docData };
            });

            console.log("Fetching reports(3) ... [data]",data)
            if (isLoadMore) {
            setReports((prev) => [...prev, ...data]);
            } else {
            setReports(data);
            }

            if (snapshot.docs.length > 0) {
            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            }

            setHasMore(snapshot.docs.length === 50); // if < 50, no more data
        } catch (err) {
            console.error("Error fetching reports:", err);
        } finally {
            setLoading(false);
        }
        },
        [reasonFilter, contentFilter, lastDoc, loading]
    );


    React.useEffect(()=>{
        setLastDoc(null);
        fetchReports(false)
    }, [reasonFilter,contentFilter])




    return(
        <>
        <div className="mainWrapper" >

                <div className="headerWrapper">

                    <p className="headerSection__primary">Reported Contents</p>
                    <span className="headerSection__secondary">Manage Reported Contents</span>
                                        <div className="filterWrapperReported">

                        <div className="filterWrapperReported__reasonFilter">
                            <p className='filterWrapperReported__typeFilter__header__primary'>Content Type:</p>
                            <Select
                            labelId="dropdown-label"
                            value={contentFilter}
                            label="Select Page"
                            inputProps={{
                                sx: {
                                
                                padding: '7px 14px',
                                
                                // adjust this to control the padding around the selected value
                                },
                            }}
                                sx={{
                                height: '40px',
                                minWidth: 120,
                                '& .MuiSelect-select': {
                                    padding: '10px 14px',
                                },
                                }}
                            onChange={handleContent}>
                                <MenuItem value="All">All</MenuItem>
                                <MenuItem value="Harassment">Comment</MenuItem>
                                <MenuItem value="FalseInfo">Post</MenuItem>
                                <MenuItem value="InappropriateContent">Crop Data</MenuItem>
                            
                    

                            </Select>
                        </div>

                        <div className="filterWrapperReported__reasonFilter">
                            <p className='filterWrapperReported__typeFilter__header__primary'>Reason:</p>
                            <Select
                            labelId="dropdown-label"
                            value={reasonFilter}
                            label="Select Page"
                            inputProps={{
                                sx: {
                                
                                padding: '7px 14px',
                                
                                // adjust this to control the padding around the selected value
                                },
                            }}
                                sx={{
                                height: '40px',
                                minWidth: 120,
                                '& .MuiSelect-select': {
                                    padding: '10px 14px',
                                },
                                }}
                            onChange={handleReason}>
                                <MenuItem value="All">All</MenuItem>
                                <MenuItem value="Spam&UnwantedContent" >Spam or Unwanted Content</MenuItem>
                                <MenuItem value="Harassment">Harassment or Bullying</MenuItem>
                                <MenuItem value="FalseInfo">False or Misleading Information</MenuItem>
                                <MenuItem value="InappropriateContent">Inappropriate Content</MenuItem>
                            
                    

                            </Select>
                        </div>

                        
                       
                    </div>
                    <hr />
                   

                </div>


                <div className="contentWrapper">
                    {loading && !reports.length ? (
                    <p>Loading...</p>
                    ) : reports.length === 0 ? (
                    <p>No reports found</p>
                    ) : (
                        <ReportCard contentType="Comment" />
                    )}

                    {/* Pagination */}
                    {hasMore && !loading && (
                    <Button
                        onClick={() => fetchReports(true)}
                        sx={{ marginTop: "20px" }}
                        variant="contained"
                    >
                        Load More
                    </Button>
                    )}
                    {loading && reports.length > 0 && <p>Loading more...</p>}
                </div>

                <Button
                        onClick={() => console.log(reports)}
                        sx={{ marginTop: "20px" }}
                        variant="contained"
                    >
                        check data
                </Button>

      
            </div>
        </>
    )
}