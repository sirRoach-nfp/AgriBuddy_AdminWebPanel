
import * as React from 'react';
import Button from '@mui/material/Button';
import './ArticleManagement.css'
import ArticleCard from '../../Components/ArticleCard/ArticleCard';
import { useNavigate } from 'react-router-dom';

import { Outlet } from 'react-router-dom';
import { db } from '../../firebaseconfig';
import { collection, getDocs } from 'firebase/firestore';

//MUI imports

import TextField from '@mui/material/TextField';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';



interface contentsType{

    content:string,
    header:string,
    id:string
}


interface articleType{
    Title:string,
    Cover:string,
    CreatedAt:any,
    Id:string,
    PreviewContext:string,
    
}


export default function ArticleManagement() {

    const navigate = useNavigate()
    const [selectedOption, setSelectedOption] = React.useState('Date');
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
                        Id: doc.id,
                        PreviewContext:doc.data().contents[0].content,

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

                    <p className="headerSection__primary">Article Management</p>
                    <span className="headerSection__secondary">Manage your articles</span>
                    <hr />
                   

                </div>


                <div className="contentWrapper">

                    <div className="filterWrapper">
                        <Button sx={{backgroundColor:'#607D8B',height: '40px',}} variant="contained" onClick={navigateToUpload}>Add Article</Button>



                        <div className="filterWrapper__searchWrapper">
                            <TextField 
                                variant="outlined"
                                label="Search"
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
                            onChange={handleChange}>

                                <MenuItem value="Date" >Date</MenuItem>
                                <MenuItem value="Title">Title</MenuItem>
                                <MenuItem value="Author">Author</MenuItem>
                            
                    

                            </Select>

                        </div>


                    </div>

                    <div className="articleCardsWrapper">


                        {articles && articles.length >0 && articles.map((article,index)=>(


                            <ArticleCard Id={article.Id} Title={article.Title} Cover={article.Cover} CreatedAt={article.CreatedAt} PreviewContext={article.PreviewContext}/>

                        ))}
      
                    </div>

                </div>

      
            </div>
            
        </>
    )
}