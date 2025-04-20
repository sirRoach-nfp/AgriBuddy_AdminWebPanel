
import "./CropCard.css"
import {useNavigate} from "react-router-dom"
interface CropProps{

    cropId:string,
    cropName:string,
    cropScientificName:string,
    cropCoverImage:string
}
export default function CropCard({cropId,cropName,cropScientificName,cropCoverImage}:CropProps){
    const navigate = useNavigate()

    const navigateToCropEdit = ()=>{
        navigate(`/admin/crop_edit/${cropId}`)
    }
    return(

        <div className="CropCardWrapper" onClick={navigateToCropEdit}>
            <div className="thumbanailWrapper">
                <img src={cropCoverImage} alt="" className="thumbnail" />
            </div>

            <div className="infoWrapper">
                <span className="dateTag">{cropScientificName}</span>
                <h4 className="titleTag">{cropName}</h4>
            </div>

            <div className="editWrapper">

            </div>
        </div>
    )
}