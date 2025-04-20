import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import * as React from 'react';
import Button from '@mui/material/Button';
import './ArticleUpload.css'
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';


import {db} from '../../../firebaseconfig';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';

interface contentsInt{
    id: number,
    header:string,
    content: string
}


export default function ArticleUpload(){


    const [contents,setContents] = React.useState<contentsInt[]>([]);
    const [cover, setCover] = React.useState<File | null>(null);
    const [title,setTitle] = React.useState<string>("");
    const [alert, setAlert] = React.useState<{ type: 'success' | 'error', message: string } | null>(null);


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
            }

            const articleRef = await addDoc(collection(db,"Articles"),newArticle);
            console.log("New Article added with ID:", articleRef.id);
            console.log("Image Uploaded!")
            console.log("New article object : ",newArticle)
            toast.success("Article uploaded successfully!");
      
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


            <TextField value={title} onChange={(e)=>setTitle(e.target.value)} sx={{marginTop:'30px',fontSize:'30px'}} id="standard-basic" label="Article Title....." variant="standard" />




            {contents.map((content,index)=>{
                return(

                    <div className="contentWrapper">
                        <div className="contentWrapperHeaderWrapper">
                            <RemoveCircleIcon sx={{fontSize: 30}} onClick={() => handleRemoveContent(index)}/>
                        </div>

                        <TextField style={{width:'95%'}} value={content.header}  id="standard-basic" label="Article Title" variant="standard"
                        
                            onChange={(e)=>{
                                const newHeader = e.target.value;
                                setContents((prev)=>
                                    prev.map((item,i)=>
                                        i===index ? {...item,header:newHeader} : item
                                    )
                                )
                            }}
                        
                        
                        />

                        <TextField
                            value={content.content}
                            id="outlined-multiline-static"
                            label="Content"
                            multiline
                            rows={15}
                            defaultValue="Default Value"
                            sx={{marginTop:'30px',width:'95%'}}


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

            <Button onClick={()=>console.log(contents)}>Check content wrappers</Button>
            <Button onClick={()=>console.log(cover)}>Check Image content</Button>
            <Button onClick={()=>uploadArticle(cover!,title,contents)}>Upload Test</Button>
        </div>
    </>
    
    )
}