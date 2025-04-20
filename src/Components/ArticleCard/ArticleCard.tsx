
import "./ArticleCard.css"
import { useNavigate } from "react-router-dom"

interface articleCardProps{
    Title:string,
    Cover:string,
    CreatedAt:any
    Id:string
}



export default function ArticleCard({Title,Cover,CreatedAt,Id}:articleCardProps){


    const navigate = useNavigate()

    const formatDate = (createdAt:any) => {
        if (!createdAt || !createdAt.seconds) return "N/A"; // Handle missing data
        
        const date = new Date(createdAt.seconds * 1000); // Convert Firestore timestamp to JS Date
        return date.toLocaleDateString("en-US", { month: "long", day: "numeric" }); // Format as "Month Day"
        };

    
    const navigateToArticleEdit = () => {

        navigate(`/admin/article_edit/${Id}`)
    }
    return(


        <div className="wrapper" onClick={navigateToArticleEdit}>
            <div className="thumbanailWrapper">
                <img src={Cover} alt="" className="thumbnail" />
            </div>

            <div className="infoWrapper">
                <span className="dateTag">{formatDate(CreatedAt)}</span>
                <h4 className="titleTag">{Title}</h4>
            </div>

            <div className="editWrapper">

            </div>
        </div>
    )
}