
import { useEffect, useState } from "react"
import "./ExpandedReport.css"
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"
import { useNavigate, useParams } from "react-router-dom"
import { db } from "../../../firebaseconfig";
import { deleteDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import { toast } from "react-toastify";




interface reportData{
  _id:string;
   //retain thuis
   documentId:string
  CreatedAt: any;
  _additionalInfo:string,
  _author:string,
  _contentBody:string,
  _contentTitle:string,
  _postRefId:string,
  _replyRefId:string,
  _reportReason:string,
  _reportTitle:string,
  _reportType:string,
}





export default function ExpandedReported(){

    const {id} = useParams()
    const navigate = useNavigate();

    const [contentBadge,setContentBadge] = useState("Comment")
    const [reasonBadge,setReasonBadge] = useState("Harassment")


    const [reportDetails,setReportDetails] = useState<reportData | null>( null );

    //modal handlers
    const [openDeleteConfirm,setOpenDeleteConfirm] = useState(false);
    const [openCloseConfirm,setOpenCloseConfirm] = useState(false);
    useEffect(()=>{

        

    },[])


    const deleteDialog = ()=> (
    
            <Dialog
            open={openDeleteConfirm}
    
            keepMounted
            onClose={() =>setOpenDeleteConfirm(false)}
            aria-describedby="alert-dialog-slide-description"
            >
    
            <DialogTitle sx={{color:'red'}}>{"Delete Reported Content?"}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description" sx={{color:'red'}}>
                    This action will permanently remove the reported content from the discussion.
                    Once deleted, it cannot be restored.
                    Do you want to continue?
                    
                </DialogContentText>
    

            </DialogContent>
    
    
    
            <DialogActions>
                <Button >Cancel Action</Button>
                <Button onClick={deleteReportedContent}>Continue</Button>
            </DialogActions>
            </Dialog>
    
    
    )

    const closeDialog = () => (
            <Dialog
            open={openCloseConfirm}
    
            keepMounted
            onClose={() =>setOpenCloseConfirm(false)}
            aria-describedby="alert-dialog-slide-description"
            >
    
            <DialogTitle >{"Close Report Ticket?"}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description" >
                    This action will mark the report as resolved and remove it from the list.
                    The reported content will remain available.
                    Do you want to continue?
                    
                </DialogContentText>
    

            </DialogContent>
    
    
    
            <DialogActions>
                <Button onClick={() =>setOpenCloseConfirm(false)}>Cancel Action</Button>
                <Button onClick={closeReportedContent}>Continue</Button>
            </DialogActions>
            </Dialog>
    )


    //helper
    function formatFirestoreDate(timestamp: Timestamp): string {
        if (!timestamp) return "";
        console.log("raw timestamp : ",timestamp)
        const date = timestamp.toDate(); // Convert Firestore Timestamp to JS Date
        const options: Intl.DateTimeFormatOptions = {
            month: "long",
            day: "numeric",
            year: "numeric",
        };

        return date.toLocaleDateString("en-US", options);
    }

    useEffect(() => {
    const fetchReportInfo = async () => {
        console.log("Fetching Document with an id of: ", id);

        const docRef = doc(db, "Reports", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
        const data = docSnap.data() as Omit<reportData, "documentId">;
        setReportDetails({
            ...data,
            documentId: docSnap.id,
        });
        } else {
        console.log("No such document!");
        }
    };

    fetchReportInfo();
    }, [id]);


    const deleteReportedContent = async() => {
        console.log("Clicked")
        setOpenCloseConfirm(false)

        try{

            if(!reportDetails){
                console.error("No report details provided");
                return;

            }

            if(reportDetails?._reportType === "Post"){

                const postRef = doc(db,"Discussions",reportDetails._postRefId);
                await deleteDoc(postRef);
                console.log("Post deleted successfully")
            } else if (reportDetails?._reportType === "Comment"){


                const commentRef = doc(
                    db,
                    "Discussions",
                    reportDetails?._postRefId,
                    "Comments",
                    reportDetails?._replyRefId
                )

                await deleteDoc(commentRef);
                console.log("Comment deleted successfully.");
            }


            const reportRef = doc(db,"Reports",reportDetails?.documentId);
            await deleteDoc(reportRef);
            console.log("Report deleted successfully.")
            toast.success("Content was deleted successfully");
            navigate("/admin/reported_Content")

        }catch(err){
            console.error("Error deleting report content")
            toast.error("An error occured while deleting the content. Please try again later");
        }
    }

    const closeReportedContent = async() => {
        console.log("Clicked")
        setOpenDeleteConfirm(false)

        try{

            if(!reportDetails){
                console.error("No report details provided");
                return;
            }

            const reportRef = doc(db,"Reports",reportDetails?.documentId);
            await deleteDoc(reportRef);
            console.log("Report deleted successfully.")
            toast.success("Content ticket was removed from the list");
            navigate("/admin/reported_Content")

        }catch(err){
            console.error("Error deleting report content")
            toast.error("An error occured while removing the content. Please try again later");
        }
    }

    return(
        

     <>
        {deleteDialog()}
        {closeDialog()}
        <div className="mainWrapper">

                <div className="headerWrapper">

                    <p className="headerSection__primary">Report Details</p>
                    <span className="headerSection__secondary">Review and manage reported content</span>
                                        
                        
                  
                    <hr />
                   

                </div>


                <div className="contentWrapper__expanded">

                    <div className="metaInfo__wrapper">
                        <div className="metaInfo__wrapper__types">

                            <div className={contentBadge}>

                                <span className="badgeText">
                                    {reportDetails?._reportType}
                                </span>
                            </div>


                            <div className={contentBadge}>
                                <span className="badgeText">
                                    {reportDetails?._reportReason}
                                </span>
                            </div>

                        </div>

                        <div className="metaInfo__wrapper__title">
                            <span className="contentTitle">
                                {reportDetails?._reportTitle}
                            </span>
                        </div>

                        <div className="metaInfo__wrapper__meta">

                            <div className="meta__item">
                                <span className="meta__item__label">
                                    Report Date
                                </span>

                                <span className="meta__item__primary">
                                    {formatFirestoreDate(reportDetails?.CreatedAt)}
                                </span>
                            </div>


                            <div className="meta__item">
                                <span className="meta__item__label">
                                    Original Author
                                </span>

                                <span className="meta__item__primary">
                                    {reportDetails?._author}
                                </span>
                            </div>

                            <div className="meta__item">
                                <span className="meta__item__label">
                                    Location
                                </span>

                                <span className="meta__item__primary">
                                    Crop Discussion
                                </span>
                            </div>


                        </div>

                    </div>

                    <div className="reportedContentWrapper">
                        <div className="reportedContentWrapper__header">
                            <span className="header">
                                Additional Details
                            </span>
                        </div>

                        <div className="reportedContentWrapper__content">
                            <span className="content">
                                {reportDetails?._additionalInfo}
                            </span>
                        </div>
                    </div>

                    <div className="reportedContentWrapper">
                        <div className="reportedContentWrapper__header">
                            <span className="header">
                                Reported Content
                            </span>
                        </div>

                        <div className="reportedContentWrapper__content">
                            <span className="content">
                                {reportDetails?._contentBody}

                            </span>
                        </div>
                    </div>


                    <div className="buttonsWrapper">
                        <Button
                            variant="outlined"
                            style={{ width: "100%" }}
                            sx={{
                                mt: 0,
                                backgroundColor: "#607D8B",
                                color: "white",
                                border: 0
                            }}
                            onClick={()=>setOpenCloseConfirm(true)}
                        
                        
                            >
                            Close
                        </Button>


                        <Button
                        variant="outlined"
                        style={{ width: "100%" }}
                        sx={{
                            mt: 0,
                            backgroundColor:"transparent",
                            color: "red",
                            borderColor:'#e2e8f0',
                            border: 1
                        }}
                        onClick={() => setOpenDeleteConfirm(true)}
                    
                    
                        >
                        Delete Content
                        </Button>
                    </div>



                    
                </div>
                <Button
                    variant="outlined"
                    style={{ width: "100%" }}
                    sx={{
                        mt: 0,
                        backgroundColor:"transparent",
                        color: "red",
                        borderColor:'#e2e8f0',
                        border: 1
                    }}
                    onClick={() => console.log("Report data : ",reportDetails)}
                
                
                    >
                    check Data
                </Button>


                

      
        </div>
    </>
    )





    
}