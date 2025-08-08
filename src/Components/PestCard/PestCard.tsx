
import './PestCard.css'
import { useNavigate } from 'react-router-dom'
interface pestProps{

    CommonName:string,
    PestSnapshot:string,
    PestDocuId:string,
    ScientificName:string
}




export default function PestCard({CommonName,PestSnapshot,PestDocuId,ScientificName}:pestProps){

    const navigate = useNavigate();

    const navigateToPestEdit = ()=>{


        navigate(`/admin/pest_edit/${PestDocuId}`)
    }

    return(<>
    
    
    <div className="PestCardWrapper" onClick={navigateToPestEdit}>
            <div className="thumbanailWrapper">
                <img src={PestSnapshot} alt="" className="thumbnail" />
            </div>

            <div className="infoWrapper">
                <span className="dateTag">{ScientificName}</span>
                <h4 className="titleTag">{CommonName}</h4>
            </div>

     
    </div>
        
    
    
    </>)
}