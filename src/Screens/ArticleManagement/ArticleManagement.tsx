import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import * as React from 'react';
import Button from '@mui/material/Button';
import './ArticleManagement.css'
import ArticleCard from '../../Components/ArticleCard/ArticleCard';
import { useNavigate } from 'react-router-dom';

import { Outlet } from 'react-router-dom';
import { db } from '../../firebaseconfig';
import { collection, getDocs } from 'firebase/firestore';





interface contentsType{

    content:string,
    header:string,
    id:string
}


interface articleType{
    Title:string,
    Cover:string,
    CreatedAt:any,
    Id:string
    
}


export default function ArticleManagement() {

    const navigate = useNavigate()
    const [selectedOption, setSelectedOption] = React.useState('');
    const [articles,setArticles] = React.useState<articleType[]>([])



    React.useEffect(()=>{

        const fetchArticles = async()=>{

            try{

                console.log("Articles are being fetched.....")

                const articlesRef = collection(db,'Articles')

                const articlesSnap = await getDocs(articlesRef)

                if(articlesSnap){
                    const rawData = articlesSnap.docs.map(doc => ({
                        Title:doc.data().title || "",
                        Cover:doc.data().cover || "",
                        CreatedAt:doc.data().CreatedAt || 0,
                        Id: doc.id

                    }))
                    setArticles(rawData)
                    console.log("Articles Found : ", rawData)
                }


                console.log("Articles are fetched!")
            
            }catch(err){
    
            }
        }
        fetchArticles()
    },[])
    const handleChange = (event:any) => {
      setSelectedOption(event.target.value);
    };


    const navigateToUpload = () => {
        navigate('/admin/article_upload')

    }
    return(
        <>  


            <div className="mainWrapper">

                <div className="headerWrapper">
                    <Button variant="contained" onClick={navigateToUpload}>Add Article</Button>

                    <div className="searchWrapper">
                        <input type="text" placeholder="Search" />
                    </div>
                </div>


                <div className="contentWrapper">

                    <div className="filterWrapper">
                        <h3 className="sortHeader">Sort By : </h3>
                        <Select
                        labelId="dropdown-label"
                        value={selectedOption}
                        label="Select Page"
                        inputProps={{
                            sx: {
                              padding: '5px 14px', // adjust this to control the padding around the selected value
                            },
                          }}
                        onChange={handleChange}>

                            <MenuItem value="article" >Ascending</MenuItem>
                            <MenuItem value="report">Descending</MenuItem>
                   

                        </Select>
                    </div>

                    <div className="articleCardsWrapper">


                        {articles && articles.length >0 && articles.map((article,index)=>(


                            <ArticleCard Id={article.Id} Title={article.Title} Cover={article.Cover} CreatedAt={article.CreatedAt}/>

                        ))}
      
                    </div>

                </div>

      
            </div>
            
        </>
    )
}