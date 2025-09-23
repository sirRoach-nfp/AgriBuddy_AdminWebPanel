import { useEffect, useState } from "react"
import "./ReportCard.css"
import { useNavigate } from "react-router-dom"
import { Timestamp } from "firebase/firestore"


interface reportProps{
    reportId:string,
    //contentReferenceId:string,
    contentType:string,
    //reason:string,
    //createdAt:any,
    additionalInfo:string
    createdAt:any,
    reportReason:string,
}

export default function ReportCard({additionalInfo,createdAt,contentType,reportReason,reportId}:reportProps) {


    const [contentBadge,setContentBadge] = useState("")

    useEffect(()=>{

        if(contentType ==="Comment"){setContentBadge("Comment")}
        switch (contentType) {
            case "Comment":
                setContentBadge("Comment Commenttxt");
                break;

            case "Post":
                setContentBadge("Post Posttxt");
                break;

            case "CropData":
                setContentBadge("CropData CropData_txt");
                break;

            default:
                setContentBadge("Unknown");
                break;
            }
    },[])
    const navigate = useNavigate()

    const navigateToDetailedReport = () => {
        navigate(`/admin/reported_content/detailed/${reportId}`)
    }


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


    return(
        <div className="reportCardWrapper" onClick={navigateToDetailedReport}>
            <div className={contentBadge}>

                <span className="badgeText">
                    {contentType}
                </span>
            </div>

            <div className="infoWrapper__reportCard">
                <span className="infoWrapper__label">
                    Reason:
                </span>
                <div className="infoWrapper__reasonBadge">

                    <span className="infoWrapper__reasonBadge__text">
                         {reportReason}
                    </span>
                   
                </div>
            </div>

            <div className="infoWrapper__reportCard">
                <span className="infoWrapper__label">
                    Report Date:
                </span>
   

                <span className="infoWrapper__info">
                        {formatFirestoreDate(createdAt)}
                </span>
                   
            </div>

            <div className="excerpt">
                <span className="excerpt__text">
                   {additionalInfo}
                </span>
            </div>




        </div>
    )



}