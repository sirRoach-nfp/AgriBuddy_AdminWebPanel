import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import * as React from 'react';
import Button from '@mui/material/Button';
import './ArticleUpload.css'
import '../../../global.css'
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';


import {db} from '../../../firebaseconfig';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface contentsInt{
    id: number,
    header:string,
    content: string
}


export default function ArticleUpload(){

    const navigate = useNavigate()
    const [contents,setContents] = React.useState<contentsInt[]>([]);
    const [cover, setCover] = React.useState<File | null>(null);
    const [title,setTitle] = React.useState<string>("");
    const [alert, setAlert] = React.useState<{ type: 'success' | 'error', message: string } | null>(null);

    const extractKeywords = (text: string): string[] => {
        return text
          .toLowerCase()
          .replace(/[^\w\s]/gi, '') // remove punctuation
          .split(/\s+/)
          .filter((word, index, self) =>
            word.length > 1 && self.indexOf(word) === index
          );
      };
    const uploadArticle = async(coverImg:File,title:string,contents:contentsInt[])=>{


        try{



            if(!coverImg){
                toast.error("Image is required.");
                return;
            }
            else if(!title || title.length === 0){
                toast.error("Title is required.");
                return;
            }

            console.log("Uploading image...")

            const formData = new FormData();
            formData.append("file",coverImg);
            formData.append("upload_preset","dishlyunsignedpreset")

            const response = await fetch(
                'https://api.cloudinary.com/v1_1/dvl7mqi2r/image/upload',
                {
                    method:"POST",
                    body: formData
                }
            )

            const data = await response.json();
            console.log("Uploaded image URL: ",data.secure_url)


            const newArticle = {
                title: title,
                cover: data.secure_url,
                contents: contents,
                CreatedAt:Timestamp.now(),
                keywords: extractKeywords(title)
            }

            const articleRef = await addDoc(collection(db,"Articles"),newArticle);
            console.log("New Article added with ID:", articleRef.id);
            console.log("Image Uploaded!")
            console.log("New article object : ",newArticle)
            toast.success("Article uploaded successfully!");
            navigate("/admin/Article_management")
        }catch(err){
            console.error(err)
        }
    }

    const handleAddContent = ()=>{
        const newContent: contentsInt ={
            id: Date.now(),
            header:'',
            content:''
        }

        setContents(prev=>[...prev,newContent])
    }

    const handleRemoveContent = (indexToRemove: number) => {
        setContents((prevContents) =>
            prevContents.filter((_, index) => index !== indexToRemove)
        );
    };

    return(
    
    
    <>

        <div className="mainWrapper">

          


            <div className="thumbnailWrapper">

                <img src={cover ? URL.createObjectURL(cover) : ""} alt="" className="coverImage" />

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

            <div className="actionWrapper" style={{width:'100%',
                display:'flex',
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'space-between',
                padding:'10px 30px'
            }}>
                <Button onClick={handleAddContent} className="createButton" sx={{ }}>Create new content wrapper</Button>

            
                <Button onClick={()=>uploadArticle(cover!,title,contents)} sx={{backgroundColor:' #607D8B', width:'fit-content'}} variant='contained'>Upload Article</Button>
            </div>

        </div>
    </>
    
    )
}