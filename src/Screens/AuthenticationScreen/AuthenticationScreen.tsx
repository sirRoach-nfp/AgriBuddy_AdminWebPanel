
import TextField from '@mui/material/TextField';
import './Authentication.css'
import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
import { getIdToken, getIdTokenResult, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseconfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../global.css'
import iconAgriBuddy from '../../assets/AgriBuddyAppIcon.png';

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
                <div className="formWrapper__meta">
                    <div className="formWrapper__meta__iconWrapper">
                        <img src={iconAgriBuddy} alt="" className='formWrapper__meta__iconImg' />
                    </div>
                    <span className="formWrapper__meta__sysName">
                        AgriBuddy
                    </span>
                    <span className="formWrapper__meta__secondary">
                        Crop Knowledge Hub
                    </span>
                </div>

                <div className="formWrapper__fieldsWrapper">
                    <div className="fieldsWrapper__header">
                        <span className="fieldsWrapper__header__primary">
                            Log in to your admin account
                        </span>
                    </div>


                    <div className="inputWrapper">
                        <span className="inputWrapper__header__primary">
                            Admin ID
                        </span>
                        <TextField sx={{ width: '100%',

                            "& .MuiOutlinedInput-root": {
                                borderRadius: "5px", // cleaner radius
                                height: "40px",      // control total height
                                "& input": {
                                    padding: "0 12px", // remove vertical padding, keep horizontal
                                    height: "100%",    // make text sit centered vertically
                                },
                                "& fieldset": {
                                    borderRadius: "5px",
                                },
                            },

                         }}  
                            id="outlined-basic" 
                            placeholder='Enter your admin id'
                            variant="outlined" 
                            onChange={(e)=>{setEmail(e.target.value)}}
                            
                        />
                    </div>


                    <div className="inputWrapper">
                        <span className="inputWrapper__header__primary">
                            Admin Password
                        </span>
                        <TextField sx={{ width: '100%',

                              "& .MuiOutlinedInput-root": {
                                borderRadius: "5px", // cleaner radius
                                height: "40px",      // control total height
                                "& input": {
                                    padding: "0 12px", // remove vertical padding, keep horizontal
                                    height: "100%",    // make text sit centered vertically
                                },
                                "& fieldset": {
                                    borderRadius: "5px",
                                },
                            },
                         }} 
                            id="outlined-basic"
                            type="password"
                            variant="outlined" 
                            placeholder='Enter your password'
                            onChange={(e)=>{setPassword(e.target.value)}}/>
                    </div>




                </div>

                
                
                <Button sx={{width:'100%',
                        marginTop:'20px',
                        marginBottom:'20px',
                        border: 'none',
                        paddingTop:'10px',
                        paddingBottom:'10px',
                        background: "linear-gradient(90deg, #16a34a 0%, #059669 100%)",
                        fontWeight: 'bold',     // font weight
                        color: '#ffffff',}} 
                        variant="outlined" 
                        onClick={handleLogin}>Login</Button>
            </div>
        </div>
        </>
    )
}