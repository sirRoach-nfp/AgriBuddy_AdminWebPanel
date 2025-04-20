
import "./ArticleEdit.css"
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEffect, useState } from "react";
import { useNavigate,useParams } from "react-router-dom";
import { db } from "../../../firebaseconfig";
import { collection, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { Button, TextField } from "@mui/material";
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


interface contentsInt{
    id: number,
    header:string,
    content: string
}

interface articleType{
    title:string,
    cover:string,
    CreatedAt:any,
    contents:contentsInt[],
    
}
export default function ArticleEdit(){


    const navigate = useNavigate()
  
    const {id} = useParams()
    const [articleData,setArticleData] = useState<articleType|null>(null)
    const [contents,setContents] = useState<contentsInt[]>([]);

    const [title,setTitle] = useState<string>("")


    const [openConfirmation,setConfirmation] = useState(false)


    const handleRemoveContent = (indexToRemove: number) => {
        setContents((prevContents) =>
            prevContents.filter((_, index) => index !== indexToRemove)
        );
    };

    const handleAddContent = ()=>{
        const newContent: contentsInt ={
            id: Date.now(),
            header:'',
            content:''
        }

        setContents(prev=>[...prev,newContent])
    }

    const deleteArticle = async()=>{
        try{
            const articleRef = doc(db, "Articles", id as string);
            await deleteDoc(articleRef)
            console.log("Article deleted successfully");
    
            // Navigate back after deletion
            navigate("/admin/article_management"); // or wherever you want to go after delete
        }catch(err){
            console.log(err)
        }
    }


    useEffect(()=>{
        const fetchArticle = async()=>{

            try{

                const articleRef = doc(db,'Articles',id as string)
                const articleSnap = await getDoc(articleRef)

                console.log("Article snap : ", articleSnap.data())

                if(articleSnap.exists()){

                    console.log("Article data : ", articleSnap.data())
                    setArticleData(articleSnap.data() as any)
                    setTitle(articleSnap.data().title)
                    setContents(articleSnap.data().contents)
                }
            }catch(err){console.error(err)}
        }

        fetchArticle()
    },[id])


    const saveEdit = async() => {

        try{

            console.log("Saving changes made........")
            const articleRef = doc(db,'Articles',id as string);


            await updateDoc(articleRef,{
                title:title,
                contents:contents
            })

            console.log("Changes Made ! ")
        }catch(err){
            console.error(err)
        }
    }

    return(
        <>
            <div className="mainWrapper">
                

                <div className="headerWrapper_ArticleEdit">

                    <div className="backWrapper_ArticleEdit">
                        <ArrowBackIcon sx={{fontSize:30,marginTop:0,marginBottom:0}}/>
                        <span className="backText_ArticleEdit">Return</span>
                    </div>
                    <Button variant="contained" onClick={deleteArticle} sx={{marginLeft:'auto'}}>Delete Article</Button>
                    <Button variant="contained" onClick={saveEdit} sx={{marginLeft:'5px'}}>Save Edited Article</Button>

                </div>

                <div className="thumbnailWrapper">

                    <img src={articleData?.cover} alt="" className="coverImage" />


                </div>


                <TextField value={title} onChange={(e)=>setTitle(e.target.value)} sx={{marginTop:'30px',fontSize:'30px',width:'100%'}} id="standard-basic" label="Article Title....." variant="standard" />

                {contents.map((content,index)=>{
                    return(
    
                        <div className="contentWrapper">
                            <div className="contentWrapperHeaderWrapper">
                                <RemoveCircleIcon sx={{fontSize: 30}} onClick={() => handleRemoveContent(index)}/>
                            </div>
    
                            <TextField value={content.header}  id="standard-basic" label="Article Title" variant="standard"
                            
                                onChange={(e)=>{
                                    const newHeader = e.target.value;
                                    setContents((prev)=>
                                        prev.map((item,i)=>
                                            i===index ? {...item,header:newHeader} : item
                                        )
                                    )
                                }}

                                style={{width:'95%'}}
                            
                            
                            />
    
                            <TextField
                                value={content.content}
                                id="outlined-multiline-static"
                                label="Content"
                                multiline
                                rows={15}
                                defaultValue="Default Value"
                                sx={{marginTop:'30px'}}
                                style={{width:'95%'}}
    
                                onChange={(e)=>{
                                    const newContent = e.target.value;
                                    setContents((prev)=>
                                        prev.map((item,i)=>
                                            i===index ? {...item,content:newContent} : item
                                        )
                                    )
                                }}
    
    
    
                                />
    
                        </div>
                    )
                })}

                

                <Button onClick={handleAddContent} className="createButton" sx={{ marginTop: '10px' }}>Create new content wrapper</Button>
                <Button onClick={()=> console.log("Current Contents : ",contents)}>Test Contents</Button>




            </div>
        </>
    )
}   