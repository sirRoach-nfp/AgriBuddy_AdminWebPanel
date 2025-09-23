import { useEffect, useState } from "react"
import "./ReportCard.css"
import { useNavigate } from "react-router-dom"


interface reportProps{
   // reportId:string,
    //contentReferenceId:string,
    contentType:string,
    //reason:string,
    //createdAt:any,
}

export default function ReportCard({contentType}:reportProps) {


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
        navigate(`/admin/reported_content/detailed/${"testId"}`)
    }

    return(
        <div className="reportCardWrapper" onClick={navigateToDetailedReport}>
            <div className={contentBadge}>

                <span className="badgeText">
                    Comment
                </span>
            </div>

            <div className="infoWrapper__reportCard">
                <span className="infoWrapper__label">
                    Reason:
                </span>
                <div className="infoWrapper__reasonBadge">

                    <span className="infoWrapper__reasonBadge__text">
                         Harassment
                    </span>
                   
                </div>
            </div>

            <div className="infoWrapper__reportCard">
                <span className="infoWrapper__label">
                    Report Date:
                </span>
   

                <span className="infoWrapper__info">
                        2024-01-2025
                </span>
                   
            </div>

            <div className="excerpt">
                <span className="excerpt__text">
                    user posted offensive comments about organic farming practices...
                </span>
            </div>




        </div>
    )



}