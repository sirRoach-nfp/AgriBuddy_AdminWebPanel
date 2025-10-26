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
    const [openDeleteConfirm,setOpenDeleteConfirm] = useState(false);
    const [openUpdateConfirm,setOpenUpdateConfirm] = useState(false);


    const deleteDialog = ()=> (

        <Dialog
        open={openDeleteConfirm}

        keepMounted
        onClose={() =>setOpenDeleteConfirm(false)}
        aria-describedby="alert-dialog-slide-description"
        >

        <DialogTitle sx={{color:'red'}}>{"Delete Article Data From The Database?"}</DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-slide-description" sx={{color:'red'}}>
                Deleting this article will permanently remove it from the system.
    
                This action cannot be undone.
                Are you sure you want to continue?
                
            </DialogContentText>


        </DialogContent>



        <DialogActions>
            <Button onClick={() =>setOpenDeleteConfirm(false)}>Cancel Action</Button>
            <Button onClick={() =>deleteArticle()}>Continue</Button>
        </DialogActions>
        </Dialog>


    )


    const updateDialog = ()=> (
    
            <Dialog
              open={openUpdateConfirm}
      
              keepMounted
              onClose={() =>setOpenUpdateConfirm(false)}
              aria-describedby="alert-dialog-slide-description"
            >
      
              <DialogTitle >{"Update Article Data ?"}</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-slide-description" >
                    Updating this article data will affect all users who are currently viewing this article.

                    Please ensure the new information is accurate before proceeding.
                      
                </DialogContentText>
    
              </DialogContent>
      
      
      
              <DialogActions>
                <Button onClick={() =>setOpenUpdateConfirm(false)}>Cancel Action</Button>
                <Button onClick={() =>saveEdit()}>Continue</Button>
              </DialogActions>
            </Dialog>
      
      
    )

        
    

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
            setOpenDeleteConfirm(false)
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
            setOpenUpdateConfirm(false)
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
        
            {deleteDialog()}
            {updateDialog()}
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
                        <Button variant="contained" onClick={() => setOpenUpdateConfirm(true)} sx={{height:'40px',backgroundColor:'#607D8B'}}>Save Edited Article</Button>
                        <Button variant="contained" onClick={() => setOpenDeleteConfirm(true)} sx={{backgroundColor:'red',height:'40px'}}>Delete Article</Button>
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


                <div className="sectionWrapper">
                    <div className="inputWrapper">
                        <span className="inputWrapper__header__primary">
                            Article Title
                        </span> 
                        <TextField value={title} 
                            onChange={(e)=>setTitle(e.target.value)} 
                            sx={{marginTop:'0px',fontSize:'30px',width:'100%',
    
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "8px", // cleaner radius
                                    height: "40px",      // control total height
                                    "& input": {
                                        padding: "0 12px", // remove vertical padding, keep horizontal
                                        height: "100%",    // make text sit centered vertically
                                    },
                                    "& fieldset": {
                                        borderRadius: "8px",
                                    },
                                },
    
                            }} 
                            id="outlined-basic" variant="outlined" />
                    </div>
                </div>

                {contents.map((content,index)=>{
                    return(
    
                        <div className="contentWrapper"  style={{borderRadius:0,borderColor:'#e2e8f0',padding:'20px 30px'}}>
                        <div className="contentWrapperHeaderWrapper">
                            <RemoveCircleIcon sx={{fontSize: 30,color:'red'}} onClick={() => handleRemoveContent(index)}/>
                        </div>

                        <div className="inputWrapper">
                            <span className="inputWrapper__header__primary">
                                Content Header
                            </span>
                            
                            <TextField style={{width:'100%'}} value={content.header}  id="outlined-basic" variant="outlined"
                                sx={{width:'100%',
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "8px", // cleaner radius
                                            height: "40px",      // control total height
                                            "& input": {
                                                padding: "0 12px", // remove vertical padding, keep horizontal
                                                height: "100%",    // make text sit centered vertically
                                            },
                                            "& fieldset": {
                                                borderRadius: "8px",
                                            },
                                        },

                                    }}
                                onChange={(e)=>{
                                    const newHeader = e.target.value;
                                    setContents((prev)=>
                                        prev.map((item,i)=>
                                            i===index ? {...item,header:newHeader} : item
                                        )
                                    )
                                }}
                            
                        
                            />
                        </div>

                        
                        <div className="inputWrapper">
                            <span className="inputWrapper__header__primary">
                                Content Body
                            </span>
                            <TextField
                                value={content.content}
                                id="outlined-multiline-static"
                            
                                multiline
                                rows={15}
                                defaultValue="Default Value"
                                sx={{marginTop:'0px',width:'100%'}}


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


                    </div>
                    )
                })}

                

                <Button onClick={handleAddContent} variant="outlined" className="createButton" sx={{ marginTop: '10px' }}>Create new content wrapper</Button>
               



            </div>
        </>
    )
}   