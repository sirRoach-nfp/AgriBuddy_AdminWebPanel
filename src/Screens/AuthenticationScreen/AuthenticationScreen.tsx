
import TextField from '@mui/material/TextField';
import './Authentication.css'
import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
import { getIdToken, getIdTokenResult, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseconfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
export default function AuthenticationScreen(){


    const [email,setEmail] = useState('');
    const [password,setPassword]=useState('')
    const navigate = useNavigate();



    const handleLogin = async()=>{


        try{

            if(email === ''){
                toast.error("Email field is required.");
                return
            }
            if(password === ''){
                toast.error("password field is required.");
                return
            }
            

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;


            const tokenResult = await getIdTokenResult(user);
            const isAdmin = tokenResult.claims.admin === true;


            if(isAdmin){


                console.log("Admin logged in successfully");
                navigate('/admin/article_management')
                toast.success("Admin logged in successfully");
            }else{
                toast.error("Admin email or password is incorrect.");
            }
        }catch(err){    
            console.error(err)
            toast.error("Admin email or password is incorrect.");
        }


    }



    useEffect(()=>{

        const unsubscribe = onAuthStateChanged(auth,async (user)=>{


            if(user){

                const tokenResult = await getIdTokenResult(user);
                if(tokenResult.claims.admin){
                    navigate('/admin/article_management')
                }
            }
        })

        return () => unsubscribe();
    },[navigate])

    return(
        <>

        <div className="mainWrapperAuth">

            <div className="formWrapperAuth">

                <h3 className="LoginHeader">Log in to your admin account</h3>
                <TextField sx={{ width: '90%' }}  id="outlined-basic" label="Admin UID" variant="outlined" onChange={(e)=>{setEmail(e.target.value)}} />
                <TextField sx={{ width: '90%' }} id="outlined-basic" label="Admin Password" variant="outlined" onChange={(e)=>{setPassword(e.target.value)}}/>
                <Button variant="outlined" onClick={handleLogin}>Login</Button>
            </div>
        </div>
        </>
    )
}