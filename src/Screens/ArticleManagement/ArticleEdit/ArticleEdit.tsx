import '../../../global.css'
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
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import { toast } from "react-toastify";





import {Flag, Newspaper } from 'lucide-react';

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
    const [cover,setCover]= useState<File | string>('');
    const [keyWords,setKeyWords] = useState<string[]>([])
    const [title,setTitle] = useState<string>("")


    const extractKeywords = (text: string): string[] => {
        return text
          .toLowerCase()
          .replace(/[^\w\s]/gi, '') // remove punctuation
          .split(/\s+/)
          .filter((word, index, self) =>
            word.length > 1 && self.indexOf(word) === index
          );
      };

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
            toast.error("Article was deleted successfully");
            navigate("/admin/Article_management")
            console.log("Changes Made ! ") // or wherever you want to go after delete
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
                    setCover(articleSnap.data().cover)
                    console.log("keywords : ",articleSnap.data().keywords)
                    setKeyWords(articleSnap.data().keywords)
                }
            }catch(err){console.error(err)}
        }

        fetchArticle()
    },[id])


    const saveEdit = async() => {

        try{

            console.log("Saving changes made........")
            const articleRef = doc(db,'Articles',id as string);

            let newCover = cover;

            if(cover&& typeof cover !== 'string'){

                console.log("Uploading image change .........")
                const formData = new FormData();
                formData.append("file",cover);
                formData.append("upload_preset","dishlyunsignedpreset")


    
                const response = await fetch(
                    'https://api.cloudinary.com/v1_1/dvl7mqi2r/image/upload',
                    {
                        method:"POST",
                        body: formData
                    }
                )
                

                const data = await response.json();
                if(data.secure_url){
                    console.log("Upload image success : ", data.secure_url)
                    setCover(data.secure_url)
                    newCover = data.secure_url
                }else{
                    console.error("Upload failed : ", data)
                }
            }


            await updateDoc(articleRef,{
                title:title,
                contents:contents,
                cover:newCover,
                keywords:extractKeywords(title)
            })
            toast.success("Article data was updated successfully");
            navigate("/admin/Article_management")
            console.log("Changes Made ! ")
        }catch(err){
            console.error(err)
        }
    }

    return(
        <>
            <div className="mainWrapper">
                

                <div className="headerWrapper_ArticleEdit">



                    <div className="headerWrapper_info">

                        <Newspaper/>
                        <div className="headerWrapper_info_text">
                            
                            <p className="headerWrapper_info_text_primary">Article Editor</p>
                            <span className="headerWrapper_info_text_secondary">Edit and manage your content</span>
                        </div>
                    </div>

                    <div className="headerWrapper_ArticleEdit_buttonWrappers">
                        <Button variant="contained" onClick={saveEdit} sx={{height:'40px',backgroundColor:'#607D8B'}}>Save Edited Article</Button>
                        <Button variant="contained" onClick={deleteArticle} sx={{backgroundColor:'red',height:'40px'}}>Delete Article</Button>
                    </div>
                    
                    

                </div>

                <div className="thumbnailWrapper">

                    <img src={typeof cover === 'string' ? cover : URL.createObjectURL(cover)} alt="" className="coverImage_cropUpload" />

                    <div className="uploadButtonWrapper">

                        <input type="file" id="cover" style={{display: "none"}} onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                setCover(e.target.files[0]);
                                }
                            }}/>

                        <label htmlFor="cover"><InsertPhotoIcon style={{color:"white", fontSize:"70px",  cursor:"pointer"}}/></label>
                    </div>


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
               



            </div>
        </>
    )
}   