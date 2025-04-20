import './DiseaseCard.css'
import { useNavigate } from 'react-router-dom'
interface diseaseCardProps{
    DiseaseId:string,
    DiseaseName:string,
    DiseaseSnapshot:string
}
export default function DiseaseCard({DiseaseId,DiseaseName,DiseaseSnapshot}:diseaseCardProps){

    const navigate = useNavigate()

    const navigateToDiseaseEdit = ()=>{

        navigate(`/admin/disease_edit/${DiseaseId}`)
    }
    return(
        <>
        <div className="DiseaseCardWrapper" onClick={navigateToDiseaseEdit}>
            <div className="thumbanailWrapper">
                <img src={DiseaseSnapshot} alt="" className="thumbnail" />
            </div>

            <div className="infoWrapper">
                
                <h4 className="titleTag">{DiseaseName}</h4>
            </div>

            <div className="editWrapper">

            </div>
        </div>
        </>
    )
}